// Inspect exact public paths and known secrets in memory; never print secret values.
import {readFile,realpath} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await realpath(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const git=(args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}).trim();
const lines=v=>v?v.split(/\r?\n/):[];
const allowed=new Set(JSON.parse(await readFile(resolve(root,'scripts/public-files.json'),'utf8')));
const tracked=lines(git(['ls-files'])),staged=lines(git(['diff','--cached','--name-only']));
const stagedContent=new Set(lines(git(['diff','--cached','--diff-filter=ACMR','--name-only'])));
const commits=lines(git(['rev-list','--all']));
const historical=commits.flatMap(commit=>lines(git(['ls-tree','-r','--name-only',commit])));
const blockedPaths=new Set([...tracked,...staged,...historical].filter(p=>!allowed.has(p)));
const secrets=[];
for(const path of [resolve(dirname(root),'.env'),resolve(root,'.env'),resolve(root,'.env.local'),resolve(root,'frontend/.env'),resolve(root,'frontend/.env.local')])if(existsSync(path)){
  const values=parseEnv(await readFile(path,'utf8'));
  for(const [key,value] of Object.entries(values))if(/private.?key|secret|token|password|mnemonic|api.?key|seed/i.test(key)&&value.length>=12)secrets.push(value);
}
const blockedContent=new Set();
const privateLiteral=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:private[_-]?key|secret|mnemonic|api[_-]?key)\s*[:=]\s*['"](?:0x[0-9a-fA-F]{64}|[A-Za-z0-9_/-]{32,})['"]/i;
function inspect(path,content){if(secrets.some(value=>content.includes(value))||privateLiteral.test(content))blockedContent.add(path);}
for(const path of new Set([...tracked,...staged])){
  if(path.endsWith('.png'))continue;
  if(stagedContent.has(path))inspect(path,git(['show',`:${path}`]));
  else if(staged.includes(path))continue;
  else inspect(path,await readFile(resolve(root,path),'utf8'));
}
for(const commit of commits){
  for(const path of lines(git(['ls-tree','-r','--name-only',commit]))){
    if(path.endsWith('.png'))continue;
    inspect(`${commit.slice(0,7)}:${path}`,git(['show',`${commit}:${path}`]));
  }
}
const ignoredLocal={};
for(const path of ['.env','.env.local','frontend/.env','frontend/.env.local','.venv','node_modules','.vercel','frontend/.vercel'])if(existsSync(resolve(root,path))){
  try{ignoredLocal[path]=!!git(['check-ignore',path]);}catch{ignoredLocal[path]=false;}
}
const contract=await readFile(resolve(root,'contracts/parity_option.py'));
const correctRoot=(await realpath(git(['rev-parse','--show-toplevel'])))===root&&!existsSync(resolve(dirname(root),'.git'));
const passed=correctRoot&&blockedPaths.size===0&&blockedContent.size===0&&Object.values(ignoredLocal).every(Boolean)&&contract.every(b=>b<128);
console.log(JSON.stringify({passed,correctRoot,trackedCount:tracked.length,stagedCount:staged.length,historyCommits:lines(git(['rev-list','--all'])).length,
  blockedPaths:[...blockedPaths],blockedContent:[...blockedContent],ignoredLocal,asciiContract:contract.every(b=>b<128)},null,2));
process.exitCode=passed?0:1;
