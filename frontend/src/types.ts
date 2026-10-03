export type Address = `0x${string}`;
export type Status = 'DRAFT'|'ACTIVE'|'OFFERED'|'ENDORSED'|'RETRYABLE'|'UNVERIFIABLE'|'MATCH'|'AWARDED'|'RECOVERED'|'REDEEMED'|'EXPIRED';
export interface Scope { purpose: string; deliverables: string; restrictions: string }
export interface Event { label: string; at: number }
export interface Option {
  id: string; title: string; slot: string; provider: Address; holder: Address;
  buyer: Address | ''; status: Status; scope: Scope; offer: Scope | null;
  scopeDigest: string; offerDigest: string; deadline: number; window: number;
  exerciseDeadline: number; redeemDeadline: number; winner: Address | '';
  reviewCount: number;
  history: Event[]; comparison: {dimension: keyof Scope; result: 'MATCH'|'DIFFERENT'|'UNCLEAR'}[];
}
export interface CreateInput { id: string; title: string; slot: string; holder: string; scope: Scope; deadline: number; window: number }
export type Action = 'accept_option'|'submit_offer'|'endorse_offer'|'review_offer'|'exercise_option'|'finalize_option'|'recover_offer'|'redeem';
export interface Provider { request(args: {method: string; params?: unknown[] | object}): Promise<unknown>; on?(name: string, fn: (...args: unknown[]) => void): void; removeListener?(name: string, fn: (...args: unknown[]) => void): void }
export interface Wallet { id: string; name: string; provider: Provider }
export interface Connection { account: Address; wallet: Wallet }
export type TxStage = 'submitted'|'accepted'|'finalized'|'failed'|'pending';
export interface TxUpdate { stage: TxStage; hash?: string; message?: string }
export interface ContractAdapter {
  configured: boolean;
  list(): Promise<Option[]>; get(id: string): Promise<Option | null>; credit(account: Address): Promise<string>;
  create(input: CreateInput, connection: Connection, progress: (u: TxUpdate)=>void): Promise<void>;
  act(action: Action, option: Option, connection: Connection, progress: (u: TxUpdate)=>void, offer?: Scope): Promise<void>;
  withdraw(connection: Connection, progress: (u: TxUpdate)=>void): Promise<void>;
  refreshTransaction(hash: string): Promise<TxUpdate>;
}
