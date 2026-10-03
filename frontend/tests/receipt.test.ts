import { describe, expect, it } from 'vitest';
import { receiptUpdate } from '../src/receipt';
const hash=`0x${'a'.repeat(64)}`;
const raw={hash,status:'FINALIZED',consensus_data:{leader_receipt:{execution_result:'SUCCESS',result:btoa(String.fromCharCode(0))}}};
describe('raw and normalized finality are separate from execution success',()=>{
  it('accepts finalized raw Studio return bytes',()=>{expect(receiptUpdate(raw).stage).toBe('finalized');});
  it('accepts normalized array receipt and return status',()=>{expect(receiptUpdate({...raw,consensus_data:{leader_receipt:[{execution_result:'SUCCESS',result:{status:'return',payload:{readable:'null'}}}]}}).stage).toBe('finalized');});
  it('accepts retained train execution proof without legacy receipt bytes',()=>{expect(receiptUpdate({hash,lifecycle:{state:'finalized',outcome:'accepted'},statusName:'FINALIZED',txExecutionResultName:'FINISHED_WITH_RETURN'}).stage).toBe('finalized');});
  it('accepts real train finality with an empty legacy receipt array and retained successful execution',()=>{expect(receiptUpdate({hash,status:'FINALIZED',txExecutionResult:1,txExecutionResultName:'FINISHED_WITH_RETURN',consensus_data:{leader_receipt:[]}}).stage).toBe('finalized');});
  it('uses authoritative final train execution over historical leader rotations, matching the official v0.6 SDK',()=>{expect(receiptUpdate({hash,status:'FINALIZED',txExecutionResult:1,txExecutionResultName:'FINISHED_WITH_RETURN',consensus_data:{leader_receipt:[{execution_result:'SUCCESS',result:'AAA='},{execution_result:'ERROR',result:'Ag=='}]}}).stage).toBe('finalized');});
  it.each(['ACCEPTED','DECIDED'])('keeps %s tentative even when execution returns',status=>{expect(receiptUpdate({...raw,status}).stage).toBe('accepted');});
  it('never interprets finalized lifecycle alone as success',()=>{expect(receiptUpdate({hash,status:'FINALIZED'}).stage).toBe('pending');});
  it('keeps a real Studio queued transaction with unexecuted code zero pending',()=>{expect(receiptUpdate({hash,status:'PENDING',txExecutionResult:0,txExecutionResultName:'NOT_VOTED'}).stage).toBe('pending');});
  it('does not accept contradictory retained execution metadata',()=>{expect(receiptUpdate({hash,status:'FINALIZED',txExecutionResult:0,txExecutionResultName:'FINISHED_WITH_RETURN'}).stage).toBe('pending');expect(receiptUpdate({hash,status:'FINALIZED',txExecutionResult:0,txExecutionResultName:'FINISHED_WITH_ERROR'}).stage).toBe('failed');});
  it('rejects normalized rollback despite a contradictory success label',()=>{expect(receiptUpdate({...raw,consensus_data:{leader_receipt:[{execution_result:'SUCCESS',result:{status:'rollback'}}]}}).stage).toBe('failed');});
  it('rejects raw rollback bytes and malformed base64 without displaying payload',()=>{for(const result of [btoa(String.fromCharCode(1)+'private validator details'),'invalid!']){const update=receiptUpdate({...raw,consensus_data:{leader_receipt:{execution_result:'SUCCESS',result}}});expect(update.stage).not.toBe('finalized');expect(JSON.stringify(update)).not.toContain('private validator');}});
  it('reverts to uncertainty for ambiguous receipt arrays',()=>{expect(receiptUpdate({...raw,consensus_data:{leader_receipt:[{execution_result:'SUCCESS'},{execution_result:'ERROR'}]}}).stage).not.toBe('finalized');});
  it('projects only safe public status fields, never node configuration',()=>{const update=receiptUpdate({...raw,node_config:{private_key:'fixture-secret'},consensus_data:{...raw.consensus_data,validators:[{node_config:{token:'fixture-secret'}}]}});expect(Object.keys(update).sort()).toEqual(['hash','message','stage']);expect(JSON.stringify(update)).not.toContain('fixture-secret');});
});
