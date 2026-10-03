import { describe, it, expect } from 'vitest';
import { eligibleActions, validateCreate, validateScope } from '../src/model';
import type { Option, CreateInput } from '../src/types';
const provider='0x1111111111111111111111111111111111111111';
const holder='0x2222222222222222222222222222222222222222';
const buyer='0x3333333333333333333333333333333333333333';
const scope={purpose:'Read newspaper articles',deliverables:'One reading reservation',restrictions:'No distribution; source attribution required'};
const option: Option={id:'o1',title:'Reading reservation',slot:'reading-1',provider,holder,buyer:'',scope,offer:null,scopeDigest:'digest',offerDigest:'',deadline:200,window:30,exerciseDeadline:180,redeemDeadline:400,winner:'',status:'DRAFT',reviewCount:0,history:[],comparison:[]};
describe('role, phase and time independently gate product actions',()=>{
  it('allows the named holder to accept, without leaking that control to the provider',()=>{expect(eligibleActions(option,holder,100)).toContain('accept_option');expect(eligibleActions(option,provider,100)).not.toContain('accept_option');});
  it('blocks acceptance at exact deadline with deliberately stale draft state',()=>{expect(eligibleActions(option,holder,200)).not.toContain('accept_option');});
  it('admits a distinct outside buyer only during an active unexpired option',()=>{expect(eligibleActions({...option,status:'ACTIVE'},buyer,100)).toContain('submit_offer');expect(eligibleActions({...option,status:'ACTIVE'},holder,100)).not.toContain('submit_offer');});
  it('gives endorsement only to provider and comparison only after endorsement',()=>{expect(eligibleActions({...option,status:'OFFERED',buyer},provider,100)).toContain('endorse_offer');expect(eligibleActions({...option,status:'OFFERED',buyer},buyer,100)).not.toContain('review_offer');});
  it('offers review retry to actual participants only',()=>{expect(eligibleActions({...option,status:'RETRYABLE',buyer},buyer,100)).toContain('review_offer');expect(eligibleActions({...option,status:'RETRYABLE',buyer},'0x4444444444444444444444444444444444444444',100)).toEqual([]);});
  it('stops technical retry after three attempts while preserving expired recovery',()=>{const o: Option={...option,status:'RETRYABLE',buyer,reviewCount:3};expect(eligibleActions(o,buyer,199)).toEqual([]);expect(eligibleActions(o,buyer,200)).toEqual(['recover_offer']);});
  it('never retries semantic uncertainty and allows its buyer to recover only at expiry',()=>{const o: Option={...option,status:'UNVERIFIABLE',buyer};expect(eligibleActions(o,buyer,199)).toEqual([]);expect(eligibleActions(o,buyer,200)).toEqual(['recover_offer']);expect(eligibleActions(o,provider,200)).toEqual([]);});
  it('changes holder exercise into participant finalization exactly at the window boundary',()=>{const o: Option={...option,status:'MATCH',buyer}; expect(eligibleActions(o,holder,179)).toContain('exercise_option');expect(eligibleActions(o,holder,180)).not.toContain('exercise_option');expect(eligibleActions(o,buyer,180)).toContain('finalize_option');});
  it('permits expired unresolved refund to buyer, but never awarded payment recovery',()=>{expect(eligibleActions({...option,status:'ENDORSED',buyer},buyer,200)).toContain('recover_offer');expect(eligibleActions({...option,status:'AWARDED',buyer,winner:buyer},buyer,201)).not.toContain('recover_offer');});
  it('allows winner-only redemption, before its boundary and never twice',()=>{expect(eligibleActions({...option,status:'AWARDED',winner:buyer,buyer},buyer,300)).toContain('redeem');expect(eligibleActions({...option,status:'AWARDED',winner:buyer,buyer},holder,300)).not.toContain('redeem');expect(eligibleActions({...option,status:'REDEEMED',winner:buyer,buyer},buyer,300)).not.toContain('redeem');});
});
describe('constitutive form validation',()=>{
  const input: CreateInput={id:'o1',title:'Reading',slot:'slot1',holder,scope,deadline:200,window:30};
  it('rejects a provider holding its own priority and expired dates',()=>{expect(validateCreate({...input,holder:provider,deadline:100},provider,100)).toHaveProperty('holder');expect(validateCreate({...input,deadline:100},provider,100)).toHaveProperty('deadline');});
  it('requires bounded meaning for every scope dimension',()=>{expect(validateScope({...scope,purpose:''})).toHaveProperty('purpose');expect(validateScope({...scope,restrictions:'x'.repeat(1201)})).toHaveProperty('restrictions');});
  it('accepts a complete bounded valid input',()=>{expect(validateCreate(input,provider,100)).toEqual({});});
  it('rejects an offer deadline beyond the maximum 30-day reservation horizon',()=>{expect(validateCreate({...input,deadline:100+2592001},provider,100)).toHaveProperty('deadline');expect(validateCreate({...input,deadline:100+2592000},provider,100)).toEqual({});});
});
