import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const python=process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python';
if(!existsSync(python))throw new Error('Create the project Python 3.12 virtual environment first.');
const checks=[
  [python,['scripts/lint_contracts.py']],
  [python,['-m','pytest','--tb=short']],
  [process.execPath,['--test','scripts/sdk-adapter.test.mjs','scripts/native-transfer.test.mjs']],
  [process.execPath,['node_modules/typescript/bin/tsc','--noEmit','--project','frontend/tsconfig.json']],
  [process.execPath,['../node_modules/vitest/vitest.mjs','run'],{cwd:'frontend'}],
  [process.execPath,['../node_modules/vite/bin/vite.js','build'],{cwd:'frontend'}],
];
for(const [command,args,options] of checks){
  const result=spawnSync(command,args,{stdio:'inherit',env:{...process.env,PYTHONUTF8:'1'},...options});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
