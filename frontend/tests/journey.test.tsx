// Explicit test boundary only. These fixtures are never bundled or presented as live state.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/App';
import { WalletProvider } from '../src/wallet';
import { configurationMessage, createSDKAdapter } from '../src/sdk-adapter';
import type { Address, ContractAdapter, Option } from '../src/types';
const provider: Address='0x1111111111111111111111111111111111111111',holder: Address='0x2222222222222222222222222222222222222222',buyer: Address='0x3333333333333333333333333333333333333333';
const now=Math.floor(Date.now()/1000);
const option: Option={id:'test-option',title:'Research reading slot',slot:'research-slot',provider,holder,buyer:'',scope:{purpose:'Read research',deliverables:'One reading reservation',restrictions:'No redistribution'},offer:null,scopeDigest:'test-scope',offerDigest:'test-offer',deadline:now+86400,window:3600,exerciseDeadline:now+3600,redeemDeadline:now+172800,winner:'',status:'DRAFT',reviewCount:0,history:[{label:'Priority created',at:now}],comparison:[]};
beforeEach(()=>{
  sessionStorage.clear();
  window.scrollTo=vi.fn();
  HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
});
afterEach(()=>{cleanup();delete window.ethereum;sessionStorage.clear();});
function harness(route: string,o: Option=option){
  let current={...o};
  const adapter: ContractAdapter={configured:true,list:vi.fn(async()=>[current]),get:vi.fn(async()=>current),credit:vi.fn(async()=> '1'),create:vi.fn(async(input,_connection,progress)=>{current={...current,...input,status:'DRAFT',holder:input.holder as Address};progress({stage:'submitted'});progress({stage:'accepted'});progress({stage:'finalized'});}),act:vi.fn(async(action,_option,connection,progress,offer)=>{progress({stage:'submitted'});progress({stage:'accepted'});if(action==='accept_option')current={...current,status:'ACTIVE'};if(action==='submit_offer')current={...current,status:'OFFERED',buyer:connection.account,offer:offer??null};if(action==='endorse_offer')current={...current,status:'ENDORSED'};if(action==='review_offer')current={...current,status:'MATCH'};if(action==='exercise_option')current={...current,status:'AWARDED',winner:holder};if(action==='finalize_option')current={...current,status:'AWARDED',winner:buyer};if(action==='recover_offer')current={...current,status:'RECOVERED'};if(action==='redeem')current={...current,status:'REDEEMED'};progress({stage:'finalized'});}),withdraw:vi.fn(async(_connection,progress)=>{adapter.credit=vi.fn(async()=> '0');progress({stage:'finalized'});}),refreshTransaction:vi.fn(async()=>({stage:'pending' as const}))};
  render(<MemoryRouter initialEntries={[route]}><WalletProvider><App adapter={adapter}/></WalletProvider></MemoryRouter>);
  return adapter;
}
async function connect(account: Address){const user=userEvent.setup();window.ethereum={request:vi.fn(async({method})=>method==='eth_chainId'?'0xf22d':[account]),isMetaMask:true}; // Install before mount through callers; discovery rechecks at explicit open.
  await user.click(screen.getByRole('button',{name:'Connect wallet'}));
  await user.click(screen.getByRole('button',{name:/MetaMask/}));
  await waitFor(()=>expect(screen.getByRole('button',{name:`${account.slice(0,6)}…${account.slice(-4)}`})).toBeDefined());return user;
}
describe('multi-page product and honest adapter boundary',()=>{
  it('restores only a previously selected wallet after a fresh eth_accounts check, without a permission request',async()=>{
    sessionStorage.setItem('parityoption-wallet-selection',JSON.stringify({id:'injected-0',account:holder}));
    const request=vi.fn(async({method})=>method==='eth_accounts'?[holder]:[]);window.ethereum={request,isMetaMask:true};
    harness('/account');await screen.findByRole('button',{name:'0x2222…2222'});
    expect(request).toHaveBeenCalledWith({method:'eth_accounts'});
    expect(request).not.toHaveBeenCalledWith({method:'eth_requestAccounts'});
  });
  it('navigates entry, discovery, creation, help and account through persistent links',async()=>{harness('/');const user=userEvent.setup();await user.click(screen.getByRole('link',{name:/Explore reservations/}));await screen.findByRole('heading',{name:'Reservations'});await user.click(within(screen.getByRole('navigation',{name:'Main navigation'})).getByRole('link',{name:'Create priority'}));await screen.findByRole('heading',{name:'Create a priority reservation'});await user.click(screen.getByRole('link',{name:'Help'}));await screen.findByRole('heading',{name:'The first-choice guide'});await user.click(screen.getByRole('link',{name:'Account'}));await screen.findByRole('heading',{name:'My account'});});
  it('shows unconfigured reads as an error with retry, never a fake empty canonical list',async()=>{render(<MemoryRouter initialEntries={['/reservations']}><WalletProvider><App adapter={createSDKAdapter({})}/></WalletProvider></MemoryRouter>);await screen.findByText(configurationMessage);expect(screen.queryByText('Your first reservation starts here.')).toBeNull();expect(screen.getByRole('button',{name:'Try loading again'})).toBeDefined();});
  it('searches and clears filters over canonical adapter summaries',async()=>{harness('/reservations');const user=userEvent.setup();await screen.findByText('Research reading slot');await user.type(screen.getByLabelText('Search reservations'),'not-matching');await screen.findByText('No reservations match these filters.');await user.click(screen.getByRole('button',{name:'Clear filters'}));expect(screen.getByText('Research reading slot')).toBeDefined();});
  it('chooses a wallet explicitly, accepts priority, reloads finalized state, disconnects and disables writes',async()=>{const a=harness('/reservation/test-option');await screen.findByRole('heading',{name:'Research reading slot'});expect(screen.queryByRole('button',{name:'Accept first choice'})).toBeNull();const user=await connect(holder);await user.click(screen.getByRole('button',{name:'Accept first choice'}));await screen.findByText('Open for an offer');expect(a.get).toHaveBeenCalledTimes(2);await user.click(screen.getByRole('button',{name:'0x2222…2222'}));await user.click(screen.getByRole('button',{name:'Disconnect'}));expect(screen.queryByRole('button',{name:'Accept first choice'})).toBeNull();expect(screen.getByRole('button',{name:'Connect wallet'})).toBeDefined();});
  it('validates all creation steps and submits the exact reviewed scope then routes to detail',async()=>{const a=harness('/new');const user=await connect(provider);await user.click(screen.getByRole('button',{name:'Continue →'}));await screen.findByText('Please check these details');await user.type(screen.getByLabelText('Reservation title'),'New reading slot');await user.type(screen.getByLabelText('Service slot ID'),'new-reading-slot');await user.type(screen.getByLabelText('First-choice holder’s wallet'),holder);await user.click(screen.getByRole('button',{name:'Continue →'}));await user.type(screen.getByLabelText('Purpose'),'Read research');await user.type(screen.getByLabelText('What the reservation includes'),'One reservation');await user.type(screen.getByLabelText('Limits and obligations'),'No sharing');await user.click(screen.getByRole('button',{name:'Continue →'}));await user.type(screen.getByLabelText('Offer deadline'),new Date((now+86400)*1000).toISOString().slice(0,16));await user.click(screen.getByRole('button',{name:'Create priority · 0 GEN'}));await screen.findByRole('heading',{name:'New reading slot'});expect(a.create).toHaveBeenCalledOnce();});
  it('takes an outside buyer through the dedicated offer route and retains exact terms at the adapter boundary',async()=>{const a=harness('/reservation/test-option',{...option,status:'ACTIVE'});await screen.findByRole('heading',{name:'Research reading slot'});const user=await connect(buyer);await user.click(screen.getByRole('link',{name:'Make an offer · 1 GEN'}));await screen.findByRole('heading',{name:'Make your reservation offer'});await user.type(screen.getByLabelText('Purpose'),'Read research');await user.type(screen.getByLabelText('What the reservation includes'),'One reservation');await user.type(screen.getByLabelText('Limits and obligations'),'No redistribution');await user.click(screen.getByRole('button',{name:'Submit offer · 1 GEN'}));await screen.findByText('Awaiting endorsement');expect(a.act).toHaveBeenCalledWith('submit_offer',expect.anything(),expect.objectContaining({account:buyer}),expect.any(Function),expect.objectContaining({restrictions:'No redistribution'}));});
  it.each([
    ['OFFERED',provider,'Endorse this offer','Ready for review'],
    ['ENDORSED',holder,'Compare scopes','First choice is open'],
    ['RETRYABLE',buyer,'Try scope review again','First choice is open'],
    ['MATCH',holder,'Use my first choice · 1 GEN','Reservation allocated'],
    ['AWARDED',holder,'Redeem reservation','Reservation redeemed'],
  ] as const)('routes %s legal actions through finality and canonical reload',async(status,account,control,result)=>{const a=harness('/reservation/test-option',{...option,status,buyer,winner:status==='AWARDED'?holder:''});await screen.findByRole('heading',{name:'Research reading slot'});const user=await connect(account);await user.click(screen.getByRole('button',{name:control}));await screen.findByText(result);expect(a.get).toHaveBeenCalledTimes(2);});
  it('withdraws only an actual positive adapter credit and reloads zero credit',async()=>{const a=harness('/account');const user=await connect(provider);await screen.findByRole('button',{name:'Withdraw credit'});await user.click(screen.getByRole('button',{name:'Withdraw credit'}));await waitFor(()=>expect((screen.getByRole('button',{name:'Withdraw credit'}) as HTMLButtonElement).disabled).toBe(true));expect(a.withdraw).toHaveBeenCalledOnce();});
  it.each([
    ['MATCH','Complete expired choice','Reservation allocated','finalize_option'],
    ['ENDORSED','Recover offer payment','Payment returned as credit','recover_offer'],
  ] as const)('handles expired %s through its recovery control and finalized reload',async(status,control,result,action)=>{const a=harness('/reservation/test-option',{...option,status,buyer,deadline:now-1,exerciseDeadline:now-1});await screen.findByRole('heading',{name:'Research reading slot'});const user=await connect(buyer);await user.click(screen.getByRole('button',{name:control}));await screen.findByText(result);expect(a.act).toHaveBeenCalledWith(action,expect.anything(),expect.anything(),expect.any(Function));expect(a.get).toHaveBeenCalledTimes(2);});
  it('blocks duplicate writes after submission when receipt lookup is uncertain, while leaving status refresh usable',async()=>{const a=harness('/reservation/test-option');a.act=vi.fn(async(_action,_option,_connection,progress)=>{progress({stage:'submitted',hash:`0x${'a'.repeat(64)}`});throw new Error('Test timeout');});await screen.findByRole('heading',{name:'Research reading slot'});const user=await connect(holder);await user.click(screen.getByRole('button',{name:'Accept first choice'}));await screen.findByText('Confirmation is still uncertain. Refresh transaction status before trying again.');expect((screen.getByRole('button',{name:'Accept first choice'}) as HTMLButtonElement).disabled).toBe(true);expect((screen.getByRole('button',{name:'Refresh transaction status'}) as HTMLButtonElement).disabled).toBe(false);expect(a.act).toHaveBeenCalledOnce();});
  it('retains a proven failed execution and allows a new attempt instead of calling it uncertain',async()=>{
    const a=harness('/reservation/test-option');
    a.act=vi.fn(async(_action,_option,_connection,progress)=>{progress({stage:'failed',hash:`0x${'b'.repeat(64)}`,message:'Execution failed.'});throw new Error('Confirmed failure');});
    await screen.findByRole('heading',{name:'Research reading slot'});const user=await connect(holder);
    await user.click(screen.getByRole('button',{name:'Accept first choice'}));
    await screen.findByText('Action not completed');
    expect(screen.getByText('Execution failed.')).toBeDefined();
    expect((screen.getByRole('button',{name:'Accept first choice'}) as HTMLButtonElement).disabled).toBe(false);
  });
});
