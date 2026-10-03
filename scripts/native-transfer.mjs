import {formatUnits,isAddress} from 'viem';
export function nativeTransferMessageProof(raw,contract,recipient,expected) {
  const none={bound:false,messages:[]};
  const same=(a,b)=>typeof a==='string'&&isAddress(a)&&typeof b==='string'&&isAddress(b)&&a.toLowerCase()===b.toLowerCase();
  if(!raw||raw.status!=='FINALIZED'||raw.txExecutionResult!==1||raw.txExecutionResultName!=='FINISHED_WITH_RETURN'
    ||!same(raw.to_address,contract)||!same(raw.from_address,recipient)||typeof expected!=='bigint'||expected<=0n
    ||!Array.isArray(raw.messages)||raw.messages.length!==1)return none;
  const message=raw.messages[0];
  if(!message||![0,'0'].includes(message.messageType)||message.onAcceptance!==false
    ||!same(message.recipient,recipient)||!['','0x'].includes(message.data))return none;
  try{
    if(BigInt(raw.value??0)!==0n||BigInt(message.value)!==expected)return none;
    return {bound:true,messages:[{messageType:'external',recipient:message.recipient,valueGEN:formatUnits(expected,18),emptyData:true,onAcceptance:false}]};
  }catch{return none;}
}
