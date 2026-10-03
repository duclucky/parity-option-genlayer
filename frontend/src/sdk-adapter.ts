import { createClient } from 'genlayer-js';
import { TransactionHashVariant } from 'genlayer-js/types';
import type { CalldataEncodable, TransactionHash } from 'genlayer-js/types';
import { formatUnits, isAddress as validAddress, getAddress } from 'viem';
import { eligibleActions, isAddress, validateCreate, validateScope } from './model.ts';
import { receiptUpdate } from './receipt.ts';
import { ensureStudioNetwork, studioChain, IC_RPC_PATH, WALLET_RPC_PATH } from './network.ts';
import type { Address, Connection, ContractAdapter, CreateInput, Option, Scope, Status, TxUpdate } from './types';

export const configurationMessage='Contract connection is not configured yet. No onchain reservation or payment is shown. Please try again after deployment.';
const GEN=10n**18n;
const statuses: Status[]=['DRAFT','ACTIVE','OFFERED','ENDORSED','RETRYABLE','UNVERIFIABLE','MATCH','AWARDED','RECOVERED','REDEEMED','EXPIRED'];
const record=(value: unknown): Record<string,unknown> => {if(!value || typeof value!=='object' || Array.isArray(value))throw new Error('Canonical reservation data could not be verified.');return value as Record<string,unknown>;};
const text=(value: unknown): string => {if(typeof value!=='string')throw new Error('Canonical reservation text could not be verified.');return value;};
const integer=(value: unknown): number => {const n=typeof value==='bigint'?Number(value):value;if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0)throw new Error('Canonical reservation timing could not be verified.');return n;};
const account=(value: unknown): Address => {if(typeof value!=='string'||!isAddress(value))throw new Error('Canonical participant address could not be verified.');return getAddress(value);};
const optionalAccount=(value: unknown): Address|'' => value===''?'':account(value);
const scope=(value: unknown): Scope => {const r=record(value);const s={purpose:text(r.purpose),deliverables:text(r.deliverables),restrictions:text(r.restrictions)};if(Object.keys(validateScope(s)).length)throw new Error('Canonical scope is incomplete.');return s;};
function option(value: unknown): Option {
  const o=record(value), status=text(o.status) as Status;
  if(!statuses.includes(status))throw new Error('Unknown canonical reservation state.');
  return {id:text(o.id),title:text(o.title),slot:text(o.slot),provider:account(o.provider),holder:account(o.holder),buyer:optionalAccount(o.buyer),
    status,scope:scope(o.scope),offer:o.offer===null?null:scope(o.offer),scopeDigest:text(o.scope_digest),offerDigest:text(o.offer_digest),
    deadline:integer(o.deadline),window:integer(o.window),exerciseDeadline:integer(o.exercise_deadline),redeemDeadline:integer(o.redeem_deadline),
    winner:optionalAccount(o.winner),reviewCount:integer(o.review_count),history:[],comparison:[]};
}
export interface AdapterConfig { contractAddress?: string; icRpc?: string; walletRpc?: string }
export function createSDKAdapter(config: AdapterConfig): ContractAdapter {
  const configured=typeof config.contractAddress==='string' && isAddress(config.contractAddress);
  const address=configured?getAddress(config.contractAddress!):undefined;
  const reader=createClient({chain:studioChain(config.icRpc??IC_RPC_PATH)});
  const requireConfigured=(): Address => {if(!address)throw new Error(configurationMessage);return address;};
  const read=async(name: string,args: CalldataEncodable[]=[])=>{
    const target=requireConfigured();
    try{return await reader.readContract({address:target,functionName:name,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});}
    catch {throw new Error('The finalized contract state could not be read. Check the Studio Dev connection and try again.');}
  };
  const get=async(id: string): Promise<Option|null>=>{
    const raw=await read('get_option',[id]);if(raw===null)return null;
    const o=option(raw);
    const history=await read('get_history',[id]);if(!Array.isArray(history))throw new Error('Reservation history could not be verified.');
    o.history=history.map(v=>{const e=record(v);return {label:text(e.label),at:integer(e.at)};});
    if(o.reviewCount>0){
      const r=record(await read('get_review',[id,o.reviewCount]));
      if(!Array.isArray(r.decisions))throw new Error('Scope comparison could not be verified.');
      o.comparison=r.decisions.map(v=>{const d=record(v),dimension=text(d.id),result=text(d.class);
        if(!['purpose','deliverables','restrictions'].includes(dimension)||!['MATCH','DIFFERENT','UNCLEAR'].includes(result))throw new Error('Scope comparison could not be verified.');
        return {dimension:dimension as keyof Scope,result:result as 'MATCH'|'DIFFERENT'|'UNCLEAR'};});
    }
    return o;
  };
  const refresh=async(hash: string): Promise<TxUpdate>=>{
    if(!/^0x[0-9a-fA-F]{64}$/.test(hash))throw new Error('Invalid transaction identifier.');
    try{return {...receiptUpdate(await reader.getTransaction({hash:hash as TransactionHash})),hash};}
    catch{throw new Error('Transaction status is unavailable. Refresh before sending another action.');}
  };
  const write=async(name: string,args: CalldataEncodable[],value: bigint,connection: Connection,progress: (u: TxUpdate)=>void)=>{
    const target=requireConfigured();
    if(!isAddress(connection.account)||!validAddress(target))throw new Error('A valid connected wallet and contract address are required.');
    try{
      await ensureStudioNetwork(connection.wallet.provider);
      const accounts=await connection.wallet.provider.request({method:'eth_accounts'});
      if(!Array.isArray(accounts)||typeof accounts[0]!=='string'||accounts[0].toLowerCase()!==connection.account.toLowerCase())throw new Error('Reconnect the selected wallet account before continuing.');
      const selectedProvider={request:async(request: {method: string;params?: unknown[]|object})=>{
        const result=await connection.wallet.provider.request(request);
        if(request.method==='eth_sendTransaction' && typeof result==='string' && /^0x[0-9a-fA-F]{64}$/.test(result)){
          progress({stage:'submitted',hash:result,message:'Transaction submitted. Waiting for an accepted decision and successful finalization.'});
        }
        return result;
      }};
      const writer=createClient({chain:studioChain(config.walletRpc??WALLET_RPC_PATH),account:connection.account,provider:selectedProvider});
      const fees=await writer.estimateTransactionFeesForWrite({address:target,functionName:name,args,value,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
      progress({stage:'pending',message:`Review ${formatUnits(value,18)} GEN and the quoted network fee budget of ${formatUnits(fees.feeValue,18)} GEN in your wallet. Unused fee budget is handled by the network.`});
      const hash=await writer.writeContract({address:target,functionName:name,args,value,fees:{distribution:fees.distribution,feeValue:fees.feeValue,messageAllocations:fees.messageAllocations}});
      if(typeof hash!=='string'||!/^0x[0-9a-fA-F]{64}$/.test(hash))throw new Error('Transaction identifier unavailable.');
      for(let count=0;count<60;count++){
        const update=await refresh(hash);progress(update);
        if(update.stage==='finalized')return;
        if(update.stage==='failed')throw new Error('The action did not execute successfully. Refresh canonical state before retrying.');
        await new Promise(resolve=>setTimeout(resolve,2000));
      }
      throw new Error('Confirmation is still processing. Refresh transaction status before retrying.');
    }catch{throw new Error('The action could not be confirmed. Check your selected wallet and refresh transaction status before trying again.');}
  };
  return {
    configured,list:async()=>{const out: Option[]=[];let offset=0;for(let page=0;page<7;page++){
      const result=record(await read('list_options',[offset,20]));if(!Array.isArray(result.options))throw new Error('Reservation list could not be verified.');
      out.push(...result.options.map(option));const next=integer(result.next_offset),total=integer(result.total);
      if(next>=total)return out;if(next<=offset||total>128)throw new Error('Canonical reservation page could not be verified.');offset=next;
    }throw new Error('Reservation page limit exceeded.');},get,
    credit:async(owner)=>{const value=text(await read('get_credit',[account(owner)]));if(!/^\d+$/.test(value))throw new Error('GEN credit could not be verified.');return value;},
    create:async(input: CreateInput,connection,progress)=>{
      if(Object.keys(validateCreate(input,connection.account,Math.floor(Date.now()/1000))).length)throw new Error('Complete the reservation terms and time bounds before submitting.');
      await write('create_option',[input.id,input.title,input.slot,input.holder,input.scope.purpose,input.scope.deliverables,input.scope.restrictions,input.deadline,input.window],0n,connection,progress);
    },act:async(action,shown,connection,progress,offer)=>{
      const o=await get(shown.id);if(!o||!eligibleActions(o,connection.account,Math.floor(Date.now()/1000)).includes(action))throw new Error('This action is no longer available. Refresh the reservation.');
      let args: CalldataEncodable[]=[o.id],value=0n;
      if(action==='accept_option')args.push(o.scopeDigest);
      if(action==='endorse_offer')args.push(o.offerDigest);
      if(action==='review_offer')args.push(o.reviewCount+1);
      if(action==='submit_offer'){if(!offer||Object.keys(validateScope(offer)).length)throw new Error('Complete all offer scope clauses.');args.push(o.scopeDigest,offer.purpose,offer.deliverables,offer.restrictions);value=GEN;}
      if(action==='exercise_option')value=GEN;
      await write(action,args,value,connection,progress);
    },withdraw:async(connection,progress)=>{if(BigInt(text(await read('get_credit',[account(connection.account)])))<=0n)throw new Error('No withdrawable GEN credit.');await write('withdraw_credit',[],0n,connection,progress);},
    refreshTransaction:refresh,
  };
}
