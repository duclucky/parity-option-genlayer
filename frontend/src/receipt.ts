import { transactionsStatusNumberToName } from 'genlayer-js/types';
import type { TxUpdate } from './types';

const object = (value: unknown): Record<string,unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string,unknown> : {};
function returnStatus(value: unknown): 'return'|'failure'|'unknown' {
  const decoded = object(value);
  if (typeof decoded.status === 'string') return decoded.status === 'return' ? 'return' : 'failure';
  if (typeof value !== 'string' || !value || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) return 'unknown';
  try { const bytes=atob(value); if (!bytes.length) return 'unknown'; return bytes.charCodeAt(0)===0 ? 'return' : 'failure'; }
  catch { return 'unknown'; }
}

/** Deliberately never return receipt bodies, VM errors, traces or validator configuration. */
export function receiptUpdate(value: unknown): TxUpdate {
  const tx=object(value), lifecycle=object(tx.lifecycle);
  const rawStatus=tx.statusName ?? tx.status;
  const status=typeof rawStatus==='number' || typeof rawStatus==='string' && /^\d+$/.test(rawStatus)
    ? transactionsStatusNumberToName[String(rawStatus) as keyof typeof transactionsStatusNumberToName]
    : typeof rawStatus==='string' ? rawStatus.toUpperCase() : '';
  const hash=typeof tx.hash==='string' && /^0x[0-9a-fA-F]{64}$/.test(tx.hash) ? tx.hash : undefined;
  const result=(stage: TxUpdate['stage'],message: string): TxUpdate => ({stage,hash,message});
  if (lifecycle.state==='canceled' || ['CANCELED','CANCELLED','UNDETERMINED','VALIDATORS_TIMEOUT','LEADER_TIMEOUT'].includes(status)
      || ['undetermined','validators-timeout','leader-timeout'].includes(String(lifecycle.outcome))) {
    return result('failed','The transaction did not produce an accepted execution. Refresh canonical state before retrying.');
  }
  const consensus=object(tx.consensus_data), receipts=consensus.leader_receipt;
  const receipt=Array.isArray(receipts) ? receipts.length===1 ? object(receipts[0]) : {} : object(receipts);
  const execution=receipt.execution_result;
  const returned=returnStatus(receipt.result);
  const retained=tx.txExecutionResultName ?? tx.tx_execution_result_name;
  const retainedCode=tx.txExecutionResult ?? tx.tx_execution_result;
  // v0.6 retains the final train execution result. Legacy receipt arrays include
  // prior rotations; a failed historical leader does not override the final train.
  if(retained!==undefined||retainedCode!==undefined){
    if(retained&& !['FINISHED_WITH_RETURN','NOT_VOTED'].includes(String(retained))
       ||retainedCode!==undefined&&![0,1].includes(Number(retainedCode)))return result('failed','Contract execution failed. No successful finalized action is confirmed.');
    const success=(retained==='FINISHED_WITH_RETURN'&&(retainedCode===undefined||Number(retainedCode)===1))
      ||Number(retainedCode)===1&&(retained===undefined||retained==='FINISHED_WITH_RETURN');
    if(success&&(lifecycle.state==='finalized'||status==='FINALIZED'))return result('finalized','Successfully finalized. Canonical state is being refreshed.');
    if(success&&(lifecycle.state==='decided'&&lifecycle.outcome==='accepted'||['ACCEPTED','DECIDED'].includes(status)))return result('accepted','Accepted decision. Waiting for successful finalization.');
    return result('pending','Transaction is processing. Refresh status before sending another action.');
  }
  if (execution && execution!=='SUCCESS' || returned==='failure'
      || retained && !['FINISHED_WITH_RETURN','NOT_VOTED'].includes(String(retained))
      || retainedCode!==undefined && Number(retainedCode)!==0 && Number(retainedCode)!==1) {
    return result('failed','Contract execution failed. No successful finalized action is confirmed.');
  }
  const retainedSuccess=(retained==='FINISHED_WITH_RETURN'&&(retainedCode===undefined||Number(retainedCode)===1))
    || retainedCode!==undefined&&Number(retainedCode)===1&&(retained===undefined||retained==='FINISHED_WITH_RETURN');
  const proven=execution==='SUCCESS' && returned==='return' || retainedSuccess;
  if (Array.isArray(receipts) && (receipts.length>1||receipts.length===0&&!retainedSuccess)) return result('pending','Execution proof is ambiguous. Refresh transaction status.');
  const finalized=lifecycle.state==='finalized' || status==='FINALIZED';
  if (finalized && proven) return result('finalized','Successfully finalized. Canonical state is being refreshed.');
  if (finalized) return result('pending','Finality is recorded, but execution success still needs verification.');
  if (lifecycle.state==='decided' && lifecycle.outcome==='accepted' || ['ACCEPTED','DECIDED'].includes(status)) {
    return result('accepted','Accepted decision. Waiting for successful finalization.');
  }
  return result('pending','Transaction is processing. Refresh status before sending another action.');
}
