import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isAddress, short } from './model';
import type { Address, Connection, Provider, Wallet } from './types';
import { ensureStudioNetwork } from './network';

type Injected = Provider & { providers?: Injected[]; isMetaMask?: boolean; isRabby?: boolean; isCoinbaseWallet?: boolean; isBraveWallet?: boolean; isOkxWallet?: boolean };
declare global { interface Window { ethereum?: Injected; okxwallet?: Injected; rabby?: Injected; coinbaseWalletExtension?: Injected } }
function providerName(p: Injected): string {
  return p.isRabby ? 'Rabby' : p.isOkxWallet ? 'OKX Wallet' : p.isCoinbaseWallet ? 'Coinbase Wallet' : p.isBraveWallet ? 'Brave Wallet' : p.isMetaMask ? 'MetaMask' : 'Browser wallet';
}
export function injectedWallets(browser: Pick<Window,'ethereum'|'okxwallet'|'rabby'|'coinbaseWalletExtension'>): Wallet[] {
  const out: Wallet[] = [];
  const add = (p: Injected | undefined, name?: string) => { if (p && typeof p.request === 'function' && !out.some(w => w.provider === p)) out.push({id:`injected-${out.length}`,name:name ?? providerName(p),provider:p}); };
  for (const p of browser.ethereum?.providers ?? []) add(p);
  add(browser.okxwallet,'OKX Wallet'); add(browser.rabby,'Rabby'); add(browser.coinbaseWalletExtension,'Coinbase Wallet');
  if (!browser.ethereum?.providers?.length) add(browser.ethereum);
  return out;
}
export async function requestConnection(wallet: Wallet): Promise<Connection> {
  const accounts = await wallet.provider.request({method:'eth_requestAccounts'});
  if (!Array.isArray(accounts) || typeof accounts[0] !== 'string' || !isAddress(accounts[0])) throw new Error('This wallet did not return a valid account. Choose a wallet and try again.');
  await ensureStudioNetwork(wallet.provider);
  return {account:accounts[0] as Address,wallet};
}
interface WalletState { connection: Connection | null; open: ()=>void; disconnect: ()=>void; control: ReactNode }
const selectionKey='parityoption-wallet-selection';
const Context = createContext<WalletState | null>(null);
export function useWallet() { const value=useContext(Context); if (!value) throw new Error('Wallet context missing'); return value; }
export function WalletControl(){return useWallet().control;}
export function WalletProvider({children}: {children: ReactNode}) {
  const [wallets,setWallets]=useState<Wallet[]>([]), [connection,setConnection]=useState<Connection|null>(null);
  const [error,setError]=useState(''), [busy,setBusy]=useState(false), [menu,setMenu]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null), trigger=useRef<HTMLButtonElement>(null);
  const restored=useRef(false);
  useEffect(()=>{
    const add=(wallet: Wallet)=>setWallets(old=>old.some(w=>w.provider===wallet.provider)?old:[...old,wallet]);
    const announced=(event: Event)=>{
      const d=(event as CustomEvent).detail;
      if (d?.provider && typeof d.provider.request==='function' && typeof d.info?.uuid==='string' && typeof d.info?.name==='string') add({id:d.info.uuid,name:d.info.name.slice(0,80),provider:d.provider});
    };
    window.addEventListener('eip6963:announceProvider',announced);
    for (const wallet of injectedWallets(window)) add(wallet);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    return ()=>window.removeEventListener('eip6963:announceProvider',announced);
  },[]);
  useEffect(()=>{
    if(restored.current||!wallets.length)return;
    let saved: {id?:unknown;account?:unknown};
    try{saved=JSON.parse(sessionStorage.getItem(selectionKey)??'null');}catch{return;}
    if(!saved||typeof saved.id!=='string'||typeof saved.account!=='string'||!isAddress(saved.account))return;
    const selected=wallets.find(w=>w.id===saved.id);if(!selected)return;
    restored.current=true;let active=true;
    selected.provider.request({method:'eth_accounts'}).then(accounts=>{
      if(active&&Array.isArray(accounts)&&typeof accounts[0]==='string'&&isAddress(accounts[0])&&accounts[0].toLowerCase()===String(saved.account).toLowerCase())setConnection({wallet:selected,account:accounts[0] as Address});
    }).catch(()=>{});return()=>{active=false;};
  },[wallets]);
  useEffect(()=>{
    if (!connection) return;
    const changed=(...args: unknown[])=>{
      const accounts=args[0];
      if (!Array.isArray(accounts) || typeof accounts[0]!=='string' || !isAddress(accounts[0]) || accounts[0].toLowerCase()!==connection.account.toLowerCase()) {try{sessionStorage.removeItem(selectionKey);}catch{}setConnection(null);setMenu(false);setError('Your wallet account changed. Reconnect to choose the account for your next action.');}
    };
    connection.wallet.provider.on?.('accountsChanged',changed);
    connection.wallet.provider.on?.('disconnect',changed);
    return ()=>{connection.wallet.provider.removeListener?.('accountsChanged',changed);connection.wallet.provider.removeListener?.('disconnect',changed);};
  },[connection]);
  const open=()=>{setError('');setMenu(false);for(const w of injectedWallets(window))setWallets(old=>old.some(x=>x.provider===w.provider)?old:[...old,w]);window.dispatchEvent(new Event('eip6963:requestProvider'));dialog.current?.showModal();};
  const close=()=>{dialog.current?.close();trigger.current?.focus();};
  const disconnect=()=>{restored.current=true;try{sessionStorage.removeItem(selectionKey);}catch{}setConnection(null);setMenu(false);};
  const connect=async(wallet: Wallet)=>{setBusy(true);setError('');try{const chosen=await requestConnection(wallet);restored.current=true;setConnection(chosen);try{sessionStorage.setItem(selectionKey,JSON.stringify({id:wallet.id,account:chosen.account}));}catch{}close();}catch{setError('Connection was not completed. Check your wallet, then choose it again.');}finally{setBusy(false);}};
  const control=<div className="wallet-anchor"><button ref={trigger} className="button secondary wallet-trigger" onClick={connection?()=>setMenu(!menu):open} aria-expanded={connection?menu:undefined}>{connection?short(connection.account):'Connect wallet'}</button>
      {menu&&connection&&<div className="account-menu"><strong>{connection.wallet.name}</strong><p className="address">{connection.account}</p><Link to="/account" onClick={()=>setMenu(false)}>My account</Link><button className="button secondary" onClick={disconnect}>Disconnect</button></div>}
    </div>;
  return <Context.Provider value={{connection,open,disconnect,control}}>{children}
    <dialog ref={dialog} className="wallet-modal" aria-labelledby="wallet-title" onCancel={()=>trigger.current?.focus()}><div className="split"><h2 id="wallet-title">Choose your wallet</h2><button className="icon-button" aria-label="Close wallet picker" onClick={close}>×</button></div><p>Select the browser wallet you want to use. You review each transaction in that wallet.</p>
      {wallets.length===0?<div className="notice"><strong>No browser wallet detected.</strong><p>Open this app in a browser with an EVM wallet extension, then try again.</p></div>:<div className="wallet-list">{wallets.map(w=><button key={w.id} disabled={busy} onClick={()=>void connect(w)}><span className="wallet-mark" aria-hidden="true">{w.name.slice(0,1)}</span><span>{w.name}</span><span aria-hidden="true">↗</span></button>)}</div>}
      {busy&&<p role="status">Check your wallet to connect…</p>}{error&&<p role="alert" className="error-text">{error}</p>}<p className="fine">Disconnecting clears this app’s selected account. Your wallet remains under your control.</p>
    </dialog>
  </Context.Provider>;
}
