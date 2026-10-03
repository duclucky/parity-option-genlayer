import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeTransferMessageProof} from './native-transfer.mjs';
const contract='0x4444444444444444444444444444444444444444',recipient='0x1111111111111111111111111111111111111111',GEN=10n**18n;
const receipt={status:'FINALIZED',txExecutionResult:1,txExecutionResultName:'FINISHED_WITH_RETURN',to_address:contract,from_address:recipient,value:0,
  messages:[{messageType:'0',recipient,value:GEN.toString(),data:'0x',onAcceptance:false}],triggered_transactions:[]};
test('finalized external EVM transfer is bound to its parent without an IC child transaction',()=>{
  const proof=nativeTransferMessageProof(receipt,contract,recipient,GEN);
  assert.equal(proof.bound,true);
  assert.deepEqual(proof.messages,[{messageType:'external',recipient,valueGEN:'1',emptyData:true,onAcceptance:false}]);
});
test('wrong phase, execution, caller, target, amount, recipient, calldata and duplicate messages cannot prove transfer',()=>{
  const mutations=[r=>r.status='ACCEPTED',r=>r.txExecutionResult=0,r=>r.txExecutionResultName='FINISHED_WITH_ERROR',r=>r.from_address=contract,
    r=>r.to_address=recipient,r=>r.messages[0].value='1',r=>r.messages[0].recipient=contract,r=>r.messages[0].data='0x1234',
    r=>r.messages[0].onAcceptance=true,r=>r.messages[0].messageType='1',r=>r.messages.push({...r.messages[0]}),r=>delete r.messages];
  for(const mutate of mutations){const r=structuredClone(receipt);mutate(r);assert.equal(nativeTransferMessageProof(r,contract,recipient,GEN).bound,false);}
});
