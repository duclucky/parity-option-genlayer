// Offline project-adapter regression with the installed real SDK. No keys or broadcasts.
import assert from 'node:assert/strict';
import test from 'node:test';
import { abi, createFeesDistribution } from 'genlayer-js';
import { studioDevnet } from 'genlayer-js/chains';
import { decodeFunctionData, fromRlp, toHex, hexToBytes } from 'viem';
import { createSDKAdapter } from '../frontend/src/sdk-adapter.ts';
import { forwardRpc } from '../frontend/server/rpc.ts';

const owner='0x1111111111111111111111111111111111111111';
const holder='0x2222222222222222222222222222222222222222';
const buyer='0x3333333333333333333333333333333333333333';
const target='0x4444444444444444444444444444444444444444';
const hash=`0x${'55'.repeat(32)}`,blockHash=`0x${'66'.repeat(32)}`;
const clauses={purpose:'Research reading',deliverables:'One reading reservation',restrictions:'No redistribution'};
const now=Math.floor(Date.now()/1000);
const canonical={id:'offline-option',title:'Research reading',slot:'reading-slot',provider:owner,holder,buyer:'',
  scope:clauses,offer:null,scope_digest:'a'.repeat(64),offer_digest:'',deadline:now+3600,window:30,
  exercise_deadline:0,redeem_deadline:0,winner:'',status:'ACTIVE',review_count:0};
const fee=10n**17n;
const distribution=createFeesDistribution();
const json=(value)=>JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v);
const config={contractAddress:target,icRpc:'https://offline.invalid/ic',walletRpc:'https://offline.invalid/wallet'};

test('real SDK project adapter preserves selected account, GEN value, fee quote and final state', {timeout:15000},async(t)=>{
  const originalFetch=globalThis.fetch,requests=[],sends=[],updates=[];
  t.after(()=>{globalThis.fetch=originalFetch;});
  globalThis.fetch=async(url,options)=>{
    assert.match(String(url),/^https:\/\/offline\.invalid\//);
    const request=JSON.parse(options.body);requests.push(request);
    const answer=(r)=>{
      if(r.method==='gen_call'){
        assert.equal(r.params[0].transaction_hash_variant,'latest-final');
        const encoded=fromRlp(r.params[0].data,'hex');
        const call=abi.calldata.decode(hexToBytes(encoded[0]));
        const views={get_option:canonical,get_history:[],get_credit:'1',list_options:{options:[canonical],next_offset:1,total:1}};
        const method=call instanceof Map?call.get(''):call[''];
        assert.ok(Object.hasOwn(views,method),`Unexpected canonical view: ${method}`);
        return toHex(abi.calldata.encode(views[method]));
      }
      const fixtures={
        eth_chainId:'0xf22d',eth_getTransactionCount:'0x0',eth_estimateGas:'0x30d40',eth_gasPrice:'0x0',eth_blockNumber:'0x1',
        sim_getFeeConfig:{enabled:true,policy:{genPerTimeUnit:'0',storageUnitPrice:'0',receiptGasPrice:'0'}},
        sim_estimateTransactionFees:{recommendedPreset:{distribution,feeValue:fee,messageAllocations:[]}},
        eth_getTransactionReceipt:{transactionHash:hash,transactionIndex:'0x0',blockHash,blockNumber:'0x1',from:buyer,to:studioDevnet.consensusMainContract.address,
          cumulativeGasUsed:'0x5208',gasUsed:'0x5208',contractAddress:null,logs:[],logsBloom:`0x${'00'.repeat(256)}`,status:'0x1',effectiveGasPrice:'0x0',type:'0x0'},
        eth_getTransactionByHash:{hash,status:'FINALIZED',from:buyer,to:studioDevnet.consensusMainContract.address,blockHash,blockNumber:'0x1',transactionIndex:'0x0',gas:'0x30d40',gasPrice:'0x0',input:'0x',nonce:'0x0',value:'0x0',type:'0x0',
          consensus_data:{leader_receipt:{execution_result:'SUCCESS',result:'AAA='}}},
      };
      assert.ok(Object.hasOwn(fixtures,r.method),`Unexpected offline RPC: ${r.method}`);
      return fixtures[r.method];
    };
    const envelope=(r)=>({jsonrpc:'2.0',id:r.id,result:answer(r)});
    return new Response(json(Array.isArray(request)?request.map(envelope):envelope(request)),{headers:{'content-type':'application/json'}});
  };
  const provider={request:async(request)=>{
    if(request.method==='eth_chainId')return '0xf22d';
    if(request.method==='eth_accounts')return [buyer];
    if(request.method==='eth_sendTransaction'){sends.push(request.params[0]);return hash;}
    throw new Error(`Unexpected wallet method: ${request.method}`);
  }};
  const adapter=createSDKAdapter(config),connection={account:buyer,wallet:{id:'fixture',name:'Offline test provider',provider}};
  assert.equal((await adapter.get(canonical.id)).status,'ACTIVE');
  await adapter.act('submit_offer',canonical,connection,u=>updates.push(u),clauses);
  assert.equal(sends.length,1);
  assert.equal(sends[0].from.toLowerCase(),buyer);
  assert.equal(sends[0].to.toLowerCase(),studioDevnet.consensusMainContract.address.toLowerCase());
  const decoded=decodeFunctionData({abi:studioDevnet.consensusMainContract.abi,data:sends[0].data});
  assert.equal(decoded.functionName,'addTransaction');
  const params=decoded.args[0];
  assert.equal(params.sender.toLowerCase(),buyer);
  assert.equal(params.recipient.toLowerCase(),target);
  assert.equal(params.userValue,10n**18n);
  assert.equal(BigInt(sends[0].value),10n**18n+fee);
  assert.deepEqual(params.feesDistribution,distribution);
  assert.ok(updates.some(u=>u.stage==='submitted'&&u.hash===hash));
  assert.equal(updates.at(-1).stage,'finalized');
  assert.ok(requests.some(r=>r.method==='sim_estimateTransactionFees'));
  assert.equal(await adapter.credit(buyer),'1');
  assert.equal((await adapter.list())[0].id,canonical.id);
  await adapter.withdraw(connection,u=>updates.push(u));
  const zero=decodeFunctionData({abi:studioDevnet.consensusMainContract.abi,data:sends[1].data}).args[0];
  assert.equal(zero.userValue,0n);assert.equal(BigInt(sends[1].value),fee);
  assert.equal(zero.sender.toLowerCase(),buyer);
  assert.deepEqual(zero.feesDistribution,distribution);
  const before=sends.length;
  await assert.rejects(adapter.act('submit_offer',canonical,{...connection,account:holder},()=>{},clauses));
  assert.equal(sends.length,before,'a stale selected account must not send');
  await assert.rejects(createSDKAdapter({}).get(canonical.id),/not configured/);
});

test('RPC projection excludes private runtime configuration and refuses signing methods',async(t)=>{
  const original=globalThis.fetch; t.after(()=>{globalThis.fetch=original;});
  let called=0;
  globalThis.fetch=async()=>{called++;return new Response(json({result:{hash,status:'FINALIZED',node_config:{secret:'PRIVATE'},
    consensus_data:{validator_config:{secret:'PRIVATE'},leader_receipt:{execution_result:'ERROR',result:Buffer.from([1,...Buffer.from('PRIVATE')]).toString('base64'),stdout:'PRIVATE',node_config:{secret:'PRIVATE'}}}}}));};
  const result=await forwardRpc('ic',{jsonrpc:'2.0',id:1,method:'eth_getTransactionByHash',params:[hash]});
  assert.ok(!json(result).includes('PRIVATE'));
  assert.deepEqual(result.result.consensus_data.leader_receipt,{execution_result:'ERROR',result:'AQ=='});
  const rejected=await forwardRpc('wallet',{jsonrpc:'2.0',id:2,method:'eth_sendRawTransaction',params:['0x00']});
  assert.equal(rejected.error.code,-32600); assert.equal(called,1);
});

test('fee simulation uses current UTC time and preserves calldata, GEN value and quoted fees',async(t)=>{
  const original=globalThis.fetch;t.after(()=>{globalThis.fetch=original;});
  let forwarded;
  globalThis.fetch=async(_url,options)=>{forwarded=JSON.parse(options.body);return new Response(json({result:{recommendedPreset:{distribution,feeValue:fee,messageAllocations:[]}}}));};
  const params=JSON.parse(json({type:'write',from:buyer,to:target,data:'0x1234',value:toHex(10n**18n),fees:{distribution,feeValue:fee.toString()},sim_config:{genvm_datetime:'1970-01-01T00:00:00Z'}}));
  const before=Date.now();
  const result=await forwardRpc('wallet',{jsonrpc:'2.0',id:1,method:'sim_estimateTransactionFees',params:[params]});
  const clock=Date.parse(forwarded.params[0].sim_config.genvm_datetime);
  assert.ok(clock>=before&&clock<=Date.now(),'simulation clock must be current UTC rather than historical runtime default');
  assert.deepEqual({...forwarded.params[0],sim_config:undefined},{...params,sim_config:undefined});
  assert.deepEqual(result.result.recommendedPreset,JSON.parse(json({distribution,feeValue:fee.toString(),messageAllocations:[]})));
  await forwardRpc('ic',{jsonrpc:'2.0',id:2,method:'gen_call',params:[{type:'read',data:'0x1234'}]});
  assert.equal(forwarded.params[0].sim_config,undefined,'canonical reads are not overridden');
});
