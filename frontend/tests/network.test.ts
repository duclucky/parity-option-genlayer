import { afterEach, expect, it, vi } from 'vitest';
import { studioDevnet } from 'genlayer-js/chains';
import { ensureStudioNetwork, studioChain, verifyBrowserRpc, STUDIO_WALLET_RPC } from '../src/network';
afterEach(()=>vi.unstubAllGlobals());
it('switches, adds the current official wallet chain when missing, and verifies the result',async()=>{
  let chain='0x1';const request=vi.fn(async(r)=>{
    if(r.method==='eth_chainId')return chain;
    if(r.method==='wallet_switchEthereumChain'){if(chain==='0x1')throw {code:4902};return null;}
    if(r.method==='wallet_addEthereumChain'){chain='0xf22d';return null;}
  });
  await ensureStudioNetwork({request});
  expect(request).toHaveBeenCalledWith({method:'wallet_addEthereumChain',params:[{chainId:'0xf22d',chainName:studioDevnet.name,nativeCurrency:studioDevnet.nativeCurrency,rpcUrls:[STUDIO_WALLET_RPC]}]});
  expect(request.mock.calls.filter(([r])=>r.method==='wallet_switchEthereumChain')).toHaveLength(2);
});
it('rejects a wallet that refuses or does not actually switch chains',async()=>{
  await expect(ensureStudioNetwork({request:async({method})=>{if(method==='eth_chainId')return '0x1';throw {code:4001};}})).rejects.toThrow('Switch to Studio Dev');
  await expect(ensureStudioNetwork({request:async({method})=>method==='eth_chainId'?'0x1':null})).rejects.toThrow('did not switch');
});
it('isolates IC and wallet SDK client endpoints without mutating the official chain',()=>{
  const original=studioDevnet.rpcUrls.default.http[0];
  const read=studioChain('/api/ic-rpc'),write=studioChain('/api/wallet-rpc');
  read.rpcUrls.default.http[0]='/changed';
  expect(write.rpcUrls.default.http[0]).toBe('/api/wallet-rpc');
  expect(studioDevnet.rpcUrls.default.http[0]).toBe(original);
});
it('probes both browser same-origin POST paths and fails honestly for an unavailable network',async()=>{
  const fetch=vi.fn(async(_path: string,_options?: RequestInit)=>new Response(JSON.stringify({result:'0xf22d'})));vi.stubGlobal('fetch',fetch);
  expect(await verifyBrowserRpc()).toBe(true);
  expect(fetch.mock.calls.map(c=>c[0])).toEqual(['/api/ic-rpc','/api/wallet-rpc']);
  fetch.mockImplementation(async()=>{throw new TypeError('Failed to fetch');});
  expect(await verifyBrowserRpc()).toBe(false);
});
