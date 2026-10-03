import type { Action, CreateInput, Option, Scope } from './types';
export const isAddress = (v: string) => /^0x[0-9a-fA-F]{40}$/.test(v) && !/^0x0{40}$/i.test(v);
export const same = (a: string, b: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
export const short = (v: string) => v ? `${v.slice(0,6)}…${v.slice(-4)}` : 'Not assigned';
export const labels: Record<Option['status'],string> = {DRAFT:'Awaiting acceptance',ACTIVE:'Open for an offer',OFFERED:'Awaiting endorsement',ENDORSED:'Ready for review',RETRYABLE:'Review needs another try',UNVERIFIABLE:'Scope remains unclear',MATCH:'First choice is open',AWARDED:'Reservation allocated',RECOVERED:'Payment returned as credit',REDEEMED:'Reservation redeemed',EXPIRED:'Window ended'};
export const actionLabels: Record<Action,string> = {accept_option:'Accept first choice',submit_offer:'Make an offer',endorse_offer:'Endorse this offer',review_offer:'Compare scopes',exercise_option:'Use my first choice · 1 GEN',finalize_option:'Complete expired choice',recover_offer:'Recover offer payment',redeem:'Redeem reservation'};
export function eligibleActions(o: Option, account: string, now: number): Action[] {
  if (!isAddress(account)) return [];
  const holder = same(account,o.holder), provider = same(account,o.provider), buyer = same(account,o.buyer);
  const participant = holder || provider || buyer;
  if (o.status === 'AWARDED') return same(account,o.winner) && now < o.redeemDeadline ? ['redeem'] : [];
  if (o.status === 'MATCH') return now < o.exerciseDeadline ? holder ? ['exercise_option'] : [] : participant ? ['finalize_option'] : [];
  if (['DRAFT','ACTIVE','OFFERED','ENDORSED','RETRYABLE','UNVERIFIABLE'].includes(o.status) && now >= o.deadline) {
    return buyer || (!o.buyer && provider) ? ['recover_offer'] : [];
  }
  if (now >= o.deadline) return [];
  if (o.status === 'DRAFT' && holder) return ['accept_option'];
  if (o.status === 'ACTIVE' && !holder && !provider) return ['submit_offer'];
  if (o.status === 'OFFERED' && provider) return ['endorse_offer'];
  if (['ENDORSED','RETRYABLE'].includes(o.status) && participant && o.reviewCount < 3) return ['review_offer'];
  return [];
}
export function validateScope(scope: Scope): Record<string,string> {
  const errors: Record<string,string> = {};
  for (const key of ['purpose','deliverables','restrictions'] as const) if (!scope[key].trim() || scope[key].length > 1200) errors[key] = 'Use 1–1,200 characters to state the exact terms.';
  return errors;
}
export function validateCreate(v: CreateInput, account: string, now: number): Record<string,string> {
  const errors = validateScope(v.scope);
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(v.id)) errors.id = 'Use a unique ID of 1–64 letters, numbers, underscores or dashes.';
  if (!v.title.trim() || v.title.length > 120) errors.title = 'Give this reservation a title of 1–120 characters.';
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(v.slot)) errors.slot = 'Use a slot ID of 1–64 letters, numbers, underscores or dashes.';
  if (!isAddress(v.holder) || same(v.holder,account)) errors.holder = 'Enter a different holder’s valid wallet address.';
  if (!Number.isSafeInteger(v.deadline) || v.deadline <= now || v.deadline > now + 2592000) errors.deadline = 'Choose an offer deadline within the next 30 days.';
  if (!Number.isSafeInteger(v.window) || v.window < 30 || v.window > 604800) errors.window = 'The purchase window must be between 30 seconds and 7 days.';
  return errors;
}
