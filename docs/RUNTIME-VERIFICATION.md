# Studio Dev runtime verification

The source-bound deployment and current canonical views are recorded in
`evidence/studio-dev/deployment.json` and `attempts.json`. The source hash is
checked against `gen_getContractCode`; deployment execution is successful and
finalized. These are script-signed deployment facts, not browser-wallet proof.

## Fee simulation clock compatibility

On 2026-10-03 the current SDK's `estimateTransactionFeesForWrite` call to
`sim_estimateTransactionFees` rejected a future, in-policy create deadline with
the contract's `Invalid reservation time bounds` guard. The same unsigned call,
with unchanged calldata and zero GEN, succeeded when simulation configuration
included the current UTC `genvm_datetime`. Both network endpoints agreed.
Constructor simulations reported current time, so constructor success alone
did not prove the write-simulation clock behavior.

The official Studio `v0.123-dev` source supplies a current timestamp for deploys,
but forwards `None` for simulated writes unless `sim_config.genvm_datetime` is
provided. The exact fallback timestamp was not observed and is not claimed.

The proxy and script now supply current UTC time for write **fee estimates**.
The SDK's returned fee distribution, allocations and fee value remain unchanged.
Actual signed transactions carry no simulation clock configuration. Contract
time guards continue to use authoritative transaction time, with equality late.
Canonical reads are not overridden. The regression first failed on the absent
current clock, then passed; `npm run check` passes with 91 direct tests, three
SDK/proxy regressions and 51 frontend tests.

## Live semantic review

`demo-match-v1` was created, ratified, offered with 1 GEN and endorsed through
distinct authorized provider, holder and buyer accounts. Review transaction
`0x6e0c2b5f2d675c112a2f6789c6f8c59aa12e6f4a242724fab38d9b707920b8a4`
has successful finalized execution. The finalized `get_review` result covers
scope and offer once and classifies purpose, deliverables and restrictions as
MATCH, with no difference roots. Canonical option status becomes MATCH, opening
the holder's exercise window. The exact record is `evidence/studio-dev/match-review.json`.

Some unsigned LLM fee estimates failed while identical estimates succeeded.
The underlying service failure was not conclusively identified. No failed
estimate was represented as consensus, and no adjudication transaction was
submitted until a successful current SDK quote was obtained. The actual review
completed on its first signed attempt. Other semantic branches, transfers and
browser signatures remain pending until their own evidence is recorded.

References: [Studio node](https://github.com/genlayerlabs/genlayer-studio/blob/v0.123-dev/backend/node/base.py),
[simulation endpoints](https://github.com/genlayerlabs/genlayer-studio/blob/v0.123-dev/backend/protocol_rpc/endpoints.py),
[fee profiling](https://docs.genlayer.com/developers/decentralized-applications/fee-profiling-and-estimation).

## Native EOA transfer proof

The first provider withdrawal successfully finalized. Native contract balance
decreased exactly 1 GEN, provider credit became zero, and its wallet increased
0.999873694999999177 GEN after fees. `triggered_transactions` is empty. The
retained parent `messages` field records one External message, to the exact
provider, with 1 GEN, empty calldata and `onAcceptance: false`. This is the
EVM transfer boundary; an IC child transaction receipt is not supplied here.

The initial evidence parser unnecessarily required an IC child hash and
therefore rejected that successful transfer. The corrected parser independently
requires successful finalized parent execution, caller and contract binding,
exact outgoing message recipient/value/phase, the native contract decrease,
recipient native increase and zero internal credit. Negative tests reject
wrong caller, target, recipient, amount, phase, execution, calldata, duplicate
messages and missing message proof. The contract and its transfer code did not
change. See [Studio consensus external message handling](https://github.com/genlayerlabs/genlayer-studio/blob/v0.123-dev/backend/consensus/base.py).
