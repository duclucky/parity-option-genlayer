// Studio Dev only. Secrets stay in ignored .env files; output is explicitly projected.
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAccount, createClient, abi } from 'genlayer-js';
import { TransactionHashVariant } from 'genlayer-js/types';
import { formatUnits, toHex, isAddress } from 'viem';
import { studioChain } from '../frontend/src/network.ts';
import { receiptUpdate } from '../frontend/src/receipt.ts';
import { studioSimulationParams } from '../frontend/src/simulation-clock.ts';
import { nativeTransferMessageProof } from './native-transfer.mjs';

const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const evidence=resolve(project,'docs/evidence/studio-dev');
const endpoint='https://studio-next.genlayer.com/api';
const walletEndpoint='https://studio-dev.genlayer.com/api';
const explorer='https://explorer-studio-dev.genlayer.com';
const source=await readFile(resolve(project,'contracts/parity_option.py'),'utf8');
const sourceHash=createHash('sha256').update(source).digest('hex');
const runner=source.match(/py-genlayer:([a-z0-9]+)/)?.[1];
const env={};
for(const path of [resolve(dirname(project),'.env'),resolve(project,'.env')])if(existsSync(path))Object.assign(env,parseEnv(await readFile(path,'utf8')));
const names={provider:'STUDIONET_PRIVATE_KEY',holder:'STUDIONET_INTEGRATOR_PRIVATE_KEY',buyer:'STUDIONET_STEWARD_PRIVATE_KEY'};
const accounts={};
for(const [role,name] of Object.entries(names))if(env[name] && /^0x[0-9a-fA-F]{64}$/.test(env[name]))accounts[role]=createAccount(env[name]);
const presence=Object.fromEntries(Object.entries(names).map(([role,name])=>[role,typeof env[name]==='string'&&env[name].trim().length>0]));
const reader=createClient({chain:studioChain(endpoint)});
const clients=Object.fromEntries(Object.entries(accounts).map(([role,account])=>[role,createClient({chain:studioChain(walletEndpoint),account})]));
const journalPath=resolve(evidence,'attempts.json');
let journal=existsSync(journalPath)?JSON.parse(await readFile(journalPath,'utf8')):{network:'studio-dev',chainId:61997,sourceHash,runner,attempts:{}};
let activeAttempt;
await mkdir(evidence,{recursive:true});
const json=v=>JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x,2)+'\n';
async function save(path,value){const temp=path+'.tmp';await writeFile(temp,json(value));await rename(temp,path);}
async function persist(){await save(journalPath,journal);}
const emit=v=>console.log(json(v).trim());
const originalFetch=globalThis.fetch;
// Save the transaction hash immediately after actual broadcast, before SDK envelope polling.
globalThis.fetch=async(url,options)=>{
  if(typeof options?.body==='string'){
    try{const request=JSON.parse(options.body);if(request.method==='sim_estimateTransactionFees')options={...options,body:JSON.stringify({...request,params:studioSimulationParams(request.method,request.params??[])})};}catch{}
  }
  const response=await originalFetch(url,options);
  if(options?.body){try{
    const request=JSON.parse(options.body);
    if(!response.ok)emit({rpcMethod:request.method,httpStatus:response.status});
    if(request.method==='sim_estimateTransactionFees'){
      const body=await response.clone().json();
      if(body.error){
        const receipt=body.error?.data?.receipt;
        const ownResult=typeof receipt?.result==='string'?Buffer.from(receipt.result,'base64').toString('utf8'):'';
        const combined=json(body.error)+ownResult;
        emit({feeEstimateErrorCode:body.error.code??null,
          knownContractErrors:['Transaction time unavailable','Transaction time must include timezone','Invalid transaction time','Invalid reservation time bounds','Invalid wallet address','Provider cannot hold its own priority','Each scope clause must contain 1-1200 characters'].filter(s=>combined.includes(s)),
          errorClasses:['TypeError','ValueError','KeyError','UserError','AttributeError','GenVMError'].filter(s=>combined.includes(s)),
          serviceCategories:['timeout','rate limit','budget','fee','LLM','Invalid result','execution failed'].filter(s=>combined.toLowerCase().includes(s.toLowerCase()))});
      }
    }
  }catch{}}
  if(activeAttempt&&options?.body){
    try{const request=JSON.parse(options.body);if(request.method==='eth_sendRawTransaction'){
      const result=(await response.clone().json()).result;
      if(typeof result==='string'&&/^0x[0-9a-fA-F]{64}$/.test(result)){
        journal.attempts[activeAttempt].hash=result;journal.attempts[activeAttempt].stage='submitted';await persist();
        emit({attempt:activeAttempt,stage:'submitted',hash:result,explorer:`${explorer}/tx/${result}`});
      }
    }}catch{}
  }
  return response;
};
// SDK warnings can include raw RPC data. The commands below report only safe error types/codes.
console.warn=()=>{};
console.error=()=>{};
async function rpc(method,params=[],url=endpoint){
  const response=await originalFetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(45000)});
  const body=await response.json();if(body.error){
    let nonpayable=false;const visit=v=>{if(typeof v==='string'&&/non.?payable|not payable|cannot.*value|value.*not.*allowed/i.test(v))nonpayable=true;else if(v&&typeof v==='object')for(const x of Object.values(v))visit(x);};visit(body.error);
    throw Object.assign(new Error('RPC failure'),{safeCode:Number.isInteger(body.error.code)?body.error.code:null,safeCategory:nonpayable?'NONPAYABLE_REJECTION':null});
  }return body.result;
}
async function balance(address){return formatUnits(BigInt(await rpc('eth_getBalance',[address,'latest'])),18);}
async function verifyNetwork(){for(const url of [endpoint,walletEndpoint])if(BigInt(await rpc('eth_chainId',[],url))!==61997n)throw new Error('Network identity mismatch');}
async function read(address,functionName,args=[]){return reader.readContract({address,functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});}
async function deployment(){const path=resolve(evidence,'deployment.json');if(!existsSync(path))return null;const value=JSON.parse(await readFile(path,'utf8'));if(value.sourceHash!==sourceHash||value.network!=='studio-dev'||value.chainId!==61997)throw new Error('Deployment source or network mismatch');return value;}
function receiptProjection(raw,hash){
  const update=receiptUpdate(raw),c=raw?.consensus_data??{},receipts=c.leader_receipt;
  const leader=Array.isArray(receipts)&&receipts.length===1?receipts[0]:!Array.isArray(receipts)?receipts:{};
  const address=raw?.data?.contract_address??raw?.contract_address;
  return {hash,stage:update.stage,status:typeof raw.status==='string'?raw.status:null,
    executionResult:typeof raw.txExecutionResultName==='string'?raw.txExecutionResultName:typeof leader?.execution_result==='string'?leader.execution_result:null,
    returnCode:typeof leader?.result==='string'?Buffer.from(leader.result,'base64')[0]??null:null,
    contractAddress:typeof address==='string'&&isAddress(address)?address:null,
    triggeredTransactions:Array.isArray(raw?.triggered_transactions)?raw.triggered_transactions.filter(v=>typeof v==='string'&&/^0x[0-9a-fA-F]{64}$/.test(v)):[],
    createdAt:typeof raw.created_at==='string'?raw.created_at:null,
    explorer:`${explorer}/tx/${hash}`,observedAt:new Date().toISOString()};
}
async function wait(hash,key){
  let previous;
  for(let i=0;i<100;i++){
    const raw=await rpc('eth_getTransactionByHash',[hash]);const proof=receiptProjection(raw,hash);
    if(key){journal.attempts[key].receipt=proof;journal.attempts[key].stage=proof.stage;await persist();}
    if(proof.stage!==previous){emit({attempt:key,...proof});previous=proof.stage;}
    if(proof.stage==='finalized')return {raw,proof};
    if(proof.stage==='failed')throw new Error('Confirmed unsuccessful execution');
    await new Promise(resolve=>setTimeout(resolve,2000));
  }throw new Error('Pending finality; inspect before any retry');
}
async function execute(key,role,method,args=[],value=0n){
  const client=clients[role];if(!client)throw new Error('Required authorized role unavailable');
  const old=journal.attempts[key];
  if(old){if(old.hash)return wait(old.hash,key);throw new Error('Ambiguous prior submission; read-only inspection required');}
  const dep=method==='deploy'?null:await deployment();if(method!=='deploy'&&!dep)throw new Error('No verified deployment');
  if(value>0n){const proof=JSON.parse(await readFile(resolve(evidence,'metadata-smoke.json'),'utf8'));if(proof.sourceHash!==sourceHash||proof.contractAddress!==dep.contractAddress||!proof.passed)throw new Error('Verified payable smoke required before sending GEN');}
  const smoke=method==='deploy'?JSON.parse(await readFile(resolve(evidence,'source-smoke.json'),'utf8')):null;
  const measured=smoke&&Object.keys(smoke.feeAccounting??{}).length>0;
  const fees=method==='deploy'?(measured?await client.estimateTransactionFeesFromSimulation({simulation:{feeAccounting:smoke.feeAccounting}}):await client.estimateTransactionFees()):await client.estimateTransactionFeesForWrite({address:dep.contractAddress,functionName:method,args,value,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
  emit({attempt:key,role,method,valueGEN:formatUnits(value,18),feeBudgetGEN:formatUnits(fees.feeValue,18),quoteSource:method==='deploy'&&!measured?'SDK live-policy bootstrap; simulation has no fee report':'SDK simulation estimate'});
  journal.attempts[key]={role,actor:accounts[role].address,method,args,valueGEN:formatUnits(value,18),feeBudgetGEN:formatUnits(fees.feeValue,18),
    beforeContractGEN:dep?await balance(dep.contractAddress):null,beforeActorGEN:await balance(accounts[role].address),startedAt:new Date().toISOString(),stage:'submitting'};
  await persist();activeAttempt=key;
  try{
    const quoted={distribution:fees.distribution,feeValue:fees.feeValue,messageAllocations:fees.messageAllocations};
    const hash=method==='deploy'?await client.deployContract({code:source,args:[],fees:quoted}):await client.writeContract({address:dep.contractAddress,functionName:method,args,value,fees:quoted});
    journal.attempts[key].hash=hash;await persist();return await wait(hash,key);
  }finally{activeAttempt=undefined;}
}
async function inspect(){
  await verifyNetwork();const dep=await deployment(),roles={};
  for(const [role,account] of Object.entries(accounts))roles[role]={address:account.address,balanceGEN:await balance(account.address)};
  emit({network:'studio-dev',chainId:61997,sourceHash,runner,secretPresence:presence,distinctRoles:new Set(Object.values(accounts).map(a=>a.address)).size,roles,
    deployment:dep?{contractAddress:dep.contractAddress,sourceCommit:dep.sourceCommit}:null,
    attempts:Object.fromEntries(Object.entries(journal.attempts).map(([k,v])=>[k,{stage:v.stage,hash:v.hash??null}]))});
  if(dep)emit({accounting:await read(dep.contractAddress,'get_accounting'),contractBalanceGEN:await balance(dep.contractAddress)});
}
async function snapshot(id){
  const dep=await deployment();
  const value={at:new Date().toISOString(),option:id?await read(dep.contractAddress,'get_option',[id]):null,
    accounting:await read(dep.contractAddress,'get_accounting'),contractBalanceGEN:await balance(dep.contractAddress),creditsGEN:{}};
  for(const [role,a] of Object.entries(accounts))value.creditsGEN[role]=await read(dep.contractAddress,'get_credit',[a.address]);
  return value;
}
async function metadataSmoke(){
  await inspect();const dep=await deployment();if(!dep)throw new Error('No verified deployment');
  const schema=await rpc('gen_getContractSchema',[dep.contractAddress]);
  const methods=Object.fromEntries(Object.entries(schema.methods??{}).map(([name,v])=>[name,{readonly:v.readonly,payable:v.payable??false}]));
  const payable=Object.entries(methods).filter(([,v])=>v.payable).map(([name])=>name).sort();
  const before=await snapshot();
  const args=['payable-tripwire','Nonpayable tripwire','tripwire-slot',accounts.holder.address,'Read research','One session','No sharing',Math.floor(Date.now()/1000)+3600,30];
  const data=abi.transactions.serialize([abi.calldata.encode(abi.calldata.makeCalldataObject('create_option',args)),false]);
  let receipt;try{receipt=await rpc('sim_call',[{type:'write',from:accounts.provider.address,to:dep.contractAddress,data,value:toHex(10n**18n),transaction_hash_variant:'latest-final'}]);}
  catch(error){if(error.safeCategory!=='NONPAYABLE_REJECTION')throw error;receipt={execution_result:'REJECTED_NONPAYABLE_RPC'};}
  const after=await snapshot();
  const unchanged=json(before.accounting)===json(after.accounting)&&before.contractBalanceGEN===after.contractBalanceGEN;
  const passed=payable.join(',')==='exercise_option,submit_offer'&&Object.keys(methods).length===18&&['ERROR','REJECTED_NONPAYABLE_RPC'].includes(receipt.execution_result)&&unchanged;
  const proof={network:'studio-dev',chainId:61997,contractAddress:dep.contractAddress,sourceHash,at:new Date().toISOString(),methods,
    nonpayableValueGEN:'1',simulationExecutionResult:receipt.execution_result,unchanged,passed};
  await save(resolve(evidence,'metadata-smoke.json'),proof);emit(proof);if(!passed)throw new Error('Payable metadata smoke failed');
}
async function estimateReview(){
  await inspect();const dep=await deployment(),item=journal.cases.match;
  const current=await read(dep.contractAddress,'get_option',[item.id]);
  const fees=await clients.holder.estimateTransactionFeesForWrite({address:dep.contractAddress,functionName:'review_offer',args:[item.id,current.review_count+1],value:0n,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
  emit({kind:'unsigned review fee estimate',feeBudgetGEN:formatUnits(fees.feeValue,18)});
}
async function step(key,role,method,args=[],value=0n,id){
  const before=journal.attempts[key]?.canonical?.before??await snapshot(id);const result=await execute(key,role,method,args,value);
  const after=await snapshot(id);journal.attempts[key].canonical={before,after};
  journal.attempts[key].afterActorGEN=await balance(accounts[role].address);await persist();
  emit({attempt:key,stage:result.proof.stage,optionStatus:after.option?.status??null,accounting:after.accounting,contractBalanceGEN:after.contractBalanceGEN});
  return after;
}
async function prepareCase(kind){
  await inspect();if(new Set(Object.values(accounts).map(a=>a.address)).size!==3)throw new Error('Required authorized role unavailable');
  const dep=await deployment();if(!dep)throw new Error('No verified deployment');
  journal.cases??={};
  if(!journal.cases[kind]){journal.cases[kind]={id:`demo-${kind}-v1`,deadline:Math.floor(Date.now()/1000)+(kind==='unclear'?600:3600),window:kind==='expired-match'?30:1800};await persist();}
  const item=journal.cases[kind],id=item.id;
  const protectedScope=['Reserve one research-paper reading session','One private one-hour reading session','No redistribution; attribution is required'];
  const offered=kind==='distinct'?['Reserve one research-paper reading session','One private one-hour reading session','Redistribution is permitted; attribution is required']:
    kind==='unclear'?['Reserve a service whose purpose will be defined later','The scope of deliverables is still undecided','Restrictions will be determined later']:
      ['Book a private session for reading a research paper','A single reading reservation lasting sixty minutes','Copies must not be shared and the source must be credited'];
  if(!await read(dep.contractAddress,'get_option',[id]))await step(`${kind}-create`,'provider','create_option',[id,`${kind} reading reservation`,`${kind}-slot-v1`,accounts.holder.address,...protectedScope,item.deadline,item.window],0n,id);
  let current=await read(dep.contractAddress,'get_option',[id]);
  if(current.status==='DRAFT')await step(`${kind}-accept`,'holder','accept_option',[id,current.scope_digest],0n,id);
  current=await read(dep.contractAddress,'get_option',[id]);
  if(current.status==='ACTIVE')await step(`${kind}-offer`,'buyer','submit_offer',[id,current.scope_digest,...offered],10n**18n,id);
  current=await read(dep.contractAddress,'get_option',[id]);
  if(current.status==='OFFERED')await step(`${kind}-endorse`,'provider','endorse_offer',[id,current.offer_digest],0n,id);
  current=await read(dep.contractAddress,'get_option',[id]);
  if(current.status==='ENDORSED')await step(`${kind}-review`,'holder','review_offer',[id,current.review_count+1],0n,id);
  current=await read(dep.contractAddress,'get_option',[id]);
  if(current.review_count){const review=await read(dep.contractAddress,'get_review',[id,current.review_count]);emit({case:kind,review});await save(resolve(evidence,`${kind}-review.json`),{network:'studio-dev',contractAddress:dep.contractAddress,review});}
  const expected=kind==='distinct'?'AWARDED':kind==='unclear'?'UNVERIFIABLE':'MATCH';
  if(![expected,'AWARDED','REDEEMED','RECOVERED'].includes(current.status))throw new Error('Unexpected canonical verdict; no automatic semantic retry');
  return {item,current};
}
async function withdraw(role,key){
  const dep=await deployment(),credit=BigInt(await read(dep.contractAddress,'get_credit',[accounts[role].address]));
  if(journal.attempts[key]?.hash){await wait(journal.attempts[key].hash,key);}
  else if(credit>0n){await step(key,role,'withdraw_credit');}
  else return;
  const attempt=journal.attempts[key];
  const after=await snapshot();
  // Exact arithmetic from decimal GEN strings; never round balances for transfer proof.
  const base=gen=>{const [whole,fraction='']=gen.split('.');return BigInt(whole)*10n**18n+BigInt(fraction.padEnd(18,'0'));};
  const expected=BigInt(attempt.canonical?.before?.creditsGEN?.[role]??credit)*10n**18n;
  const decreased=base(attempt.beforeContractGEN)-base(after.contractBalanceGEN);
  const recipientIncrease=base(await balance(accounts[role].address))-base(attempt.beforeActorGEN);
  const raw=await rpc('eth_getTransactionByHash',[attempt.hash]);
  const nativeMessage=nativeTransferMessageProof(raw,dep.contractAddress,accounts[role].address,expected);
  const proven=decreased===expected&&expected>0n&&recipientIncrease>0n&&recipientIncrease<=expected&&after.creditsGEN[role]==='0'&&nativeMessage.bound;
  attempt.transferProof={expectedGEN:formatUnits(expected,18),contractDecreaseGEN:formatUnits(decreased,18),recipientNetIncreaseGEN:formatUnits(recipientIncrease,18),nativeMessages:nativeMessage.messages,nativeMessageBound:nativeMessage.bound,zeroCredit:after.creditsGEN[role]==='0',proven};await persist();
  emit({withdrawal:key,...attempt.transferProof});if(!proven)throw new Error('External transfer balance proof missing; no further value allowed');
}
async function lifecycle(kind){
  if(!['match','distinct','unclear','expired-match'].includes(kind))throw new Error('Unknown lifecycle scenario');
  const {item}=await prepareCase(kind),dep=await deployment(),id=item.id;
  let current=await read(dep.contractAddress,'get_option',[id]);
  if(kind==='match'&&current.status==='MATCH')await step(`${kind}-exercise`,'holder','exercise_option',[id],10n**18n,id);
  if(kind==='expired-match'&&current.status==='MATCH'){
    if(Math.floor(Date.now()/1000)<current.exercise_deadline){emit({case:kind,pendingExpiry:true,deadlineUTC:new Date(current.exercise_deadline*1000).toISOString()});return;}
    await step(`${kind}-finalize`,'buyer','finalize_option',[id],0n,id);
  }
  if(kind==='unclear'&&current.status==='UNVERIFIABLE'){
    if(Math.floor(Date.now()/1000)<current.deadline){emit({case:kind,pendingExpiry:true,deadlineUTC:new Date(current.deadline*1000).toISOString()});return;}
    await step(`${kind}-recover`,'buyer','recover_offer',[id],0n,id);
  }
  current=await read(dep.contractAddress,'get_option',[id]);
  if(current.status==='AWARDED')await step(`${kind}-redeem`,current.winner.toLowerCase()===accounts.holder.address.toLowerCase()?'holder':'buyer','redeem',[id],0n,id);
  await withdraw('provider',`${kind}-withdraw-provider`);await withdraw('buyer',`${kind}-withdraw-buyer`);
  const final=await snapshot(id);if(final.accounting.locked_gen!=='0'||final.accounting.credit_gen!=='0'||final.contractBalanceGEN!=='0')throw new Error('Nonzero remaining lifecycle liability');
  journal.cases[kind].complete=true;await persist();await save(resolve(evidence,`${kind}-lifecycle.json`),{network:'studio-dev',contractAddress:dep.contractAddress,sourceCommit:dep.sourceCommit,...final});emit({case:kind,complete:true,...final});
}
async function smoke(){
  await verifyNetwork();
  const from=accounts.provider?.address??'0x0000000000000000000000000000000000000001';
  const data=abi.transactions.serialize([source,abi.calldata.encode(abi.calldata.makeCalldataObject(undefined,[])),false]);
  const receipt=await rpc('sim_call',[{type:'deploy',from,to:'0x0000000000000000000000000000000000000000',data}]);
  const raw=receipt?.genvm_result?.fee_accounting??receipt?.fee_accounting??{};
  const feeAccounting={};
  for(const key of ['execution_fee_consumed','message_fee_consumed','genvm_message_fee_consumed','execution_fee_budget','execution_fee_refunded','message_fee_refunded'])if(typeof raw[key]==='number'||typeof raw[key]==='string')feeAccounting[key]=raw[key];
  if(raw.execution_fee_report?.totalEstimatedFee!==undefined)feeAccounting.execution_fee_report={totalEstimatedFee:raw.execution_fee_report.totalEstimatedFee};
  const proof={network:'studio-dev',chainId:61997,sourceHash,runner,at:new Date().toISOString(),kind:'unsigned exact-source constructor simulation',executionResult:receipt?.execution_result??null,feeAccounting};
  await save(resolve(evidence,'source-smoke.json'),proof);emit({...proof,feeAccounting:undefined,feeObservationPresent:Object.keys(feeAccounting).length>0});
  if(proof.executionResult!=='SUCCESS')throw new Error('Exact-source smoke failed');
}
async function deploy(){
  await inspect();if(await deployment()){emit({reusedDeployment:true});return;}
  const smokeProof=JSON.parse(await readFile(resolve(evidence,'source-smoke.json'),'utf8'));if(smokeProof.sourceHash!==sourceHash||smokeProof.executionResult!=='SUCCESS')throw new Error('Exact-source smoke required');
  const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:project,encoding:'utf8'}).trim();
  if(execFileSync('git',['status','--porcelain','--','contracts/parity_option.py'],{cwd:project,encoding:'utf8'}).trim())throw new Error('Contract must match committed source');
  journal.sourceCommit=sourceCommit;await persist();
  const {raw,proof}=await execute('deploy-v1','provider','deploy');
  const address=proof.contractAddress??raw?.data?.contract_address;
  if(!isAddress(address))throw new Error('Finalized deployment address unavailable');
  const config=await read(address,'get_config');if(config.protocol!=='PARITY_OPTION_V1'||config.price_gen!=='1')throw new Error('Deployed config mismatch');
  await save(resolve(evidence,'deployment.json'),{network:'studio-dev',chainId:61997,endpoint,walletEndpoint,sourceHash,sourceCommit,runner,api:'v0.3.0',
    sdk:'genlayer-js@2.0.0-rc.1',contractAddress:address,deployHash:proof.hash,explorer:`${explorer}/address/${address}`,verifiedAt:new Date().toISOString()});
  emit({deployedAddress:address,explorer:`${explorer}/address/${address}`,config});
}
try{
  const command=process.argv[2]??'inspect';
  if(command==='inspect')await inspect();else if(command==='smoke')await smoke();else if(command==='deploy')await deploy();else if(command==='metadata-smoke')await metadataSmoke();else if(command==='estimate-review')await estimateReview();else if(command==='lifecycle')await lifecycle(process.argv[3]??'match');
  else throw new Error('Unknown command');
}catch(error){emit({command:process.argv[2]??'inspect',failed:true,errorType:error?.name??'Error',rpcErrorCode:error?.safeCode??null,reason:['Network identity mismatch','Required authorized role unavailable','Exact-source smoke failed','Pending finality; inspect before any retry','Finalized deployment address unavailable','Contract must match committed source','Deployed config mismatch','Confirmed unsuccessful execution'].includes(error?.message)?error.message:'Operation did not complete; inspect safely before retrying.'});process.exitCode=1;}
