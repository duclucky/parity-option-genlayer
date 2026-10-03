import { studioDevnet } from 'genlayer-js/chains';
import { isAddress } from 'viem';
import type { Provider } from './types';

export const IC_RPC_PATH='/api/ic-rpc';
export const WALLET_RPC_PATH='/api/wallet-rpc';
export const STUDIO_WALLET_RPC=studioDevnet.rpcUrls.default.http[0];
export function studioChain(endpoint?: string) {
  if (!studioDevnet.consensusMainContract || !isAddress(studioDevnet.consensusMainContract.address)) {
    throw new Error('The Studio Dev system address is not configured correctly.');
  }
  // The SDK changes rpcUrls when endpoint is supplied. Isolate each read/write client.
  return {...studioDevnet,rpcUrls:{...studioDevnet.rpcUrls,default:{http:[endpoint??STUDIO_WALLET_RPC]}}};
}
export async function ensureStudioNetwork(provider: Provider): Promise<void> {
  const expected=`0x${studioDevnet.id.toString(16)}`;
  const current=await provider.request({method:'eth_chainId'});
  if (typeof current==='string' && BigInt(current)===BigInt(studioDevnet.id)) return;
  try { await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:expected}]}); }
  catch(error) {
    if (!(error && typeof error==='object' && 'code' in error && error.code===4902)) {
      throw new Error('Switch to Studio Dev in your selected wallet before continuing.');
    }
    await provider.request({method:'wallet_addEthereumChain',params:[{
      chainId:expected,chainName:studioDevnet.name,nativeCurrency:studioDevnet.nativeCurrency,
      rpcUrls:[STUDIO_WALLET_RPC],
    }]});
    await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:expected}]});
  }
  const verified=await provider.request({method:'eth_chainId'});
  if (typeof verified!=='string' || BigInt(verified)!==BigInt(studioDevnet.id)) {
    throw new Error('The selected wallet did not switch to Studio Dev.');
  }
}
export async function verifyBrowserRpc(): Promise<boolean> {
  try {
    for (const path of [IC_RPC_PATH,WALLET_RPC_PATH]) {
      const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})});
      const json=await response.json();
      if (!response.ok || json.error || BigInt(json.result)!==BigInt(studioDevnet.id)) return false;
    }
    return true;
  } catch { return false; }
}
