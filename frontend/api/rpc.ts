import type { IncomingMessage, ServerResponse } from 'node:http';
import { studioDevnet } from 'genlayer-js/chains';
import { studioSimulationParams } from '../src/simulation-clock.ts';

const targets={ic:'https://studio-next.genlayer.com/api',wallet:studioDevnet.rpcUrls.default.http[0]};
const allowed=new Set(['eth_chainId','eth_getBalance','eth_getTransactionCount','eth_estimateGas','eth_gasPrice',
  'eth_blockNumber','eth_getBlockByNumber','eth_getTransactionReceipt','eth_getTransactionByHash',
  'gen_call','gen_getContractSchema','sim_getFeeConfig','sim_estimateTransactionFees']);
const obj=(value: unknown): Record<string,unknown> => value!==null && typeof value==='object' && !Array.isArray(value)?value as Record<string,unknown>:{};
function pick(value: unknown,keys: readonly string[]): Record<string,unknown> {
  const source=obj(value),out: Record<string,unknown>={};for(const key of keys)if(key in source)out[key]=source[key];return out;
}
const policyKeys=['genPerTimeUnit','storageUnitPrice','receiptGasPrice','timeUnitOverlayBps','intrinsicGas','bootloaderOverhead',
  'gasPerChangedSlot','calldataGasPerByte','fixedProposeReceiptGas','fixedMessageRevealGas','messageFeeParamsBudgetFloor'];
function safeResult(method: string,result: unknown): unknown {
  if(method==='sim_getFeeConfig')return {...pick(result,['enabled']),policy:pick(obj(result).policy,policyKeys)};
  if(method==='sim_estimateTransactionFees'){
    const preset=obj(result).recommendedPreset;
    return {recommendedPreset:pick(preset,['distribution','messageAllocations','feeValue'])};
  }
  if(method==='gen_call'){
    if(typeof result==='string')return result;
    const r=obj(result);
    return {...pick(r,['data','result','execution_result']),...(r.status?{status:{code:obj(r.status).code,message:'Contract call status'}}:{})};
  }
  if(method==='eth_getTransactionByHash'){
    if(result===null)return null;
    const r=obj(result),c=obj(r.consensus_data),receipts=c.leader_receipt;
    const receipt=(value: unknown)=>{
      const source=obj(value),raw=source.result;
      // Rollback text may contain private runtime details. Retain its code only.
      let projected=raw;
      if(typeof raw==='string')try{const bytes=Buffer.from(raw,'base64');if(bytes[0]!==0)projected=Buffer.from([bytes[0]??4]).toString('base64');}catch{projected=undefined;}
      return {...pick(source,['execution_result','vote','mode']),result:projected};
    };
    return {...pick(r,['hash','status','result','from_address','to_address','value','nonce','type','gaslimit','created_at',
      'blockHash','blockNumber','from','to','gas','gasPrice','input','transactionIndex','v','r','s','chainId','txExecutionResult','txExecutionResultName']),
      consensus_data:{...pick(c,['final','votes']),leader_receipt:Array.isArray(receipts)?receipts.map(receipt):receipt(receipts)}};
  }
  if(method==='eth_getTransactionReceipt'){
    if(result===null)return null;
    return pick(result,['transactionHash','transactionIndex','blockHash','blockNumber','from','to','cumulativeGasUsed','gasUsed',
      'contractAddress','logs','logsBloom','status','effectiveGasPrice','type']);
  }
  return result;
}
function failure(id: unknown,code=-32000){return {jsonrpc:'2.0',id:typeof id==='number'||typeof id==='string'?id:null,error:{code,message:'RPC request could not be completed safely.'}};}
export async function forwardRpc(mode: keyof typeof targets,input: unknown): Promise<unknown> {
  const request=obj(input),method=request.method,id=request.id;
  if(typeof method!=='string'||!allowed.has(method)||request.jsonrpc!=='2.0'||!Array.isArray(request.params??[]))return failure(id,-32600);
  try{
    const response=await fetch(targets[mode],{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({jsonrpc:'2.0',id,method,params:studioSimulationParams(method,(request.params??[]) as unknown[])}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)return failure(id);
    const body=await response.text();if(body.length>2097152)return failure(id);
    const rpc=obj(JSON.parse(body));if(rpc.error)return failure(id,typeof obj(rpc.error).code==='number'?obj(rpc.error).code as number:-32000);
    return {jsonrpc:'2.0',id,result:safeResult(method,rpc.result)};
  }catch{return failure(id);}
}
export function rpcHandler(mode: keyof typeof targets){return async(request: IncomingMessage&{body?:unknown},response: ServerResponse)=>{
  response.setHeader('Content-Type','application/json');response.setHeader('Cache-Control','no-store');
  if(request.method==='GET'){
    const proof=obj(await forwardRpc(mode,{jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]}));
    const verified=proof.result===`0x${studioDevnet.id.toString(16)}`;
    response.statusCode=verified?200:503;response.end(JSON.stringify({network:'Studio Dev',chainId:studioDevnet.id,verified}));return;
  }
  if(request.method!=='POST'){response.statusCode=405;response.end(JSON.stringify(failure(null,-32600)));return;}
  try{
    let input=request.body;
    if(input===undefined){let body='';for await(const chunk of request){body+=chunk.toString();if(body.length>65536)throw new Error('Body limit');}input=JSON.parse(body);}
    else if(typeof input==='string'){if(input.length>65536)throw new Error('Body limit');input=JSON.parse(input);}
    if(Array.isArray(input)){
      if(input.length<1||input.length>10)throw new Error('Batch limit');
      response.end(JSON.stringify(await Promise.all(input.map(r=>forwardRpc(mode,r)))));
    }else response.end(JSON.stringify(await forwardRpc(mode,input)));
  }catch{response.statusCode=400;response.end(JSON.stringify(failure(null,-32600)));}
};}
