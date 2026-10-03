# ParityOption readiness audit

Status: implementation, Studio Dev lifecycle and Chrome/OKX buyer offer/refund
are verified. This is a copy-ready submission packet, not a submitted or accepted
contribution. Category is Projects. Official acceptance is not claimed.

## Verified facts

- One contract: ParityOptionContract, 10 writes and 8 views. ASCII, the verified
  Studio runtime header and current semantic lint pass.
- `npm run check`: 91 direct cases, 5 Node SDK/transfer regressions and 51 frontend
  tests pass. TypeScript includes browser, API and server sources; production build passes.
- `gltest tests/`: direct cases and one real read-only integration pass. Across
  the distinct suites there are 148 executed cases, with no critical skip/xfail.
- Studio Dev chain 61997; deployed source commit 4dd8ecc and SHA256
  ddc536b5d5cc405add971d497a206d33e1809499d6f33d9d16fad979c6397689.
- Deployment Result: SUCCESS; all recorded MATCH lifecycle transactions have
  retained successful execution and FINALIZED status.
- One 1 GEN buyer offer and one 1 GEN holder exercise produce holder allocation
  and one redemption. Provider and buyer each withdraw exactly 1 GEN, proven by
  finalized outgoing native message binding and independent native balance decreases.
  Locked value, credits and native contract balance end at 0 GEN.
- Vercel production is READY; HTTP 200, project identity and React root pass.
  Browser deep links read seven canonical events, REDEEMED and three MATCH dimensions.
  The observed production browser console contains no error/warning entries.
- Chrome/OKX buyer offer and withdrawal both finalize successfully and reload
  canonical state. Withdrawal proves an exact 1 GEN native decrease and
  0.999873694999999177 GEN recipient net increase. The second MATCH case ends
  REDEEMED; global received/withdrawn are 4 GEN each, with zero liability.
  Provider and holder counterparty transactions are script-signed.
- The public repository preserves reviewed commit history and only allowlisted
  deliverables. Ignored env, runtime and local control files remain private.

The Projects checker runs both npm and gltest dynamically. Its static checks
find zero BLOCKER. Its rubric is a heuristic, not an official score or proof of
semantic trust. It misses the custom validator because it recognizes only the
literal run_nondet( or def validator_fn; the implemented run_nondet_default calls
an independent semantic validator and has malicious-leader replay tests.
It also flags the unsigned fee simulation helper as simulated frontend evidence;
that helper only timestamps fee estimation and cannot create a wallet signature,
transaction hash, balance or finality. Source and tests verify these distinctions.

## Consequential evidence trace

The full eleven-column Evidence Authority Matrix, ten write-method safety cards,
value destinations, temporal intervals and claim mappings are in [the specification](README.md).

| Claim | Deterministic provenance and invariant | Semantic boundary | Canonical proof | Negative tests and evidence |
| --- | --- | --- | --- | --- |
| Ratified reservation scope | Transaction-origin provider/holder, fixed entity/slot/revision, exact retained ratified digest, contract/chain/objective bindings | No external capability or legal truth inferred | get_option, get_history | direct/test_initial_safety.py, direct/test_adversarial.py; attempts.json create/accept |
| Endorsed outside offer | Authorized buyer deposit and provider endorsement, exact offer and ratified digests, fixed clause IDs, timestamps and anti-replay | Independent three-dimension meaning comparison in review_offer | get_review, get_option | forged/replayed/wrong-binding and valid-digest untrusted provenance tests; match-review.json |
| Holder purchase priority | Exact coverage, valid enum/root alignment, canonical derived outcome; malformed result changes no value | MATCH is material preservation of all three clauses | get_option, get_history | malformed semantic settlement and validator replay tests; finalized match-review and match-exercise |
| Provider payment and buyer refund | Role/state/time gates, 1 GEN fixed price, debit-first credits and one-time withdrawals; no validator-chosen amount/payee | Allocation derived from validated MATCH and holder exercise | get_accounting, get_credit, get_option | recovery/duplicate/temporal/payability tests; both exact native decreases in attempts.json and match-lifecycle.json |

Paths in the last column are under tests/ or docs/evidence/studio-dev/.
Additional DIFFERENT, UNCLEAR and expiry demonstrations are local-only; no live
claim is made for those branches. Withdrawal credit does not expire.

## Browser lifecycle coverage

All ten writes have real SDK wrappers, contextual controls, tests, successful
finality handling and canonical reload paths. The chosen provider/account is
configured on the actual SDK client, with no raw-string per-call override.
Discovery, EVM chain switch/add, picker, account menu and logout have focused tests.
Production Chrome wallet selection uses the owner's explicit OKX choice. Actual
buyer submit_offer and withdraw_credit signatures, successful finality and
canonical reload are retained in evidence/production/browser-wallet.json. The
account menu's logout clears the account and write controls; OKX reconnection
works. The old IAB missing-wallet screenshot is historical. Script signatures
and offline SDK ABI checks are not counted as browser signatures. Counterparty
actions are script-signed; live browser rejection/retry is not claimed.

## Copy-ready packet

Recommended category: Projects.

Title: ParityOption: Validator-Reviewed First-Choice Reservations.

Description (965 characters; plain text field):

ParityOption protects protocol-created first-choice reservations. A provider locks three scope clauses; a holder ratifies their digest; an outside buyer commits 1 GEN and the provider endorses the exact offer. GenLayer validators independently compare purpose, deliverables and restrictions from authenticated onchain declarations. Deterministic provenance and settlement invariants precede consequences. MATCH opens holder exercise; DIFFERENT awards the buyer; UNCLEAR stays non-allocating with recovery. One reusable contract owns allocation, redemption and pull credits. Studio Dev proves finalized MATCH, 1 GEN exercise, redemption, exact 1 GEN withdrawals and zero liability. Chrome/OKX proves buyer offer and refund; provider/holder actions are script-signed. Lint, 91 direct, 5 SDK/transfer, 51 frontend and one live read-only case pass. Public Vercel read/write paths work. External delivery, legal enforceability, integrations and adoption are not claimed.

Evidence:

- [Repository](https://github.com/duclucky/parity-option-genlayer).
- [Primary contract](https://explorer-studio-dev.genlayer.com/address/0x6bA8F313f2040E7774978aF37f8adAd875a3AF54).
- Consumer contract: N/A; the primitive directly owns the consequence.
- [Lifecycle evidence](https://github.com/duclucky/parity-option-genlayer/tree/main/docs/evidence/studio-dev).
- [CI workflow](https://github.com/duclucky/parity-option-genlayer/actions/workflows/check.yml):
  select the successful run for the current public commit; an older run is not current-tip proof.
- [Live frontend](https://parity-option-genlayer.vercel.app): canonical read proof;
  [Chrome/OKX buyer write proof](https://github.com/duclucky/parity-option-genlayer/blob/main/docs/evidence/production/browser-wallet.json).

Why Projects: the contribution includes the complete user-facing reservation
product and reusable contract. Its real wallet adapter, canonical reads and buyer
offer/refund journey belong to that product. It is not an already-accepted project
milestone and official acceptance remains pending.

## Honest remaining uncertainty

The production function builder emitted type-library lookup diagnostics despite
READY and working RPC functions. Independent TypeScript checks pass, but the
builder warning's exact cause is unproven. The exact default write-simulation
fallback timestamp and intermittent unsigned review fee-estimate failures are
also unproven. Actual successful signed review and transaction-time guards are
separately evidenced. External adoption, gateway enforcement, delivery and legal
enforceability remain outside this contribution's claims.

No portal submission or steward acceptance is claimed. Future milestone scope
may include multiple ranked holders, deterministic cascading exercise windows
and a real consumer gateway after this version is accepted and those additions
receive their own specifications and evidence.
