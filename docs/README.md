# ParityOption product and contract specification

Projects specification, completed before production contract implementation.
The frontend is locally verified and reads the source-bound Studio Dev deployment.
A consequential MATCH lifecycle and both native withdrawals are verified.
Browser signatures and public delivery evidence remain pending.

## Identity

- Idea ID: IDEA-036
- Project name: ParityOption
- Project slug: parity-option
- Category: Projects
- Status: BUILDING; source-bound Studio Dev MATCH lifecycle and zero-liability closure verified
- Repository: local independent child; public publication pending
- Target network: Studio Dev, per locked workspace D1
- Scaffold: official genlayer-project-boilerplate v2-dev at 816f3b88175032f10242e278c0d13d75f185c882. Sample code, metadata and Git history excluded. React/Vite replaces the sample Next.js stack as required by the Projects master prompt.

## One-sentence product hook

Keep your first choice, even when an offer is worded differently.

## Trust problem

- Decision that must not depend on one party: whether a provider-endorsed outsider offer is materially comparable to the holder's ratified scope.
- Why database/ordinary EVM/backend LLM is insufficient: custody is deterministic, but a provider or private model can evade the prior right by selectively interpreting paraphrases.
- Value/rights/access at risk: one protocol reservation, an exclusive purchase window and fixed 1 GEN purchase/refund credits.

## Fingerprint

- Trust problem: semantic rewording must not bypass a ratified first-choice entitlement.
- Actors/adversary: provider/outside buyer prefer sale without waiting; holder protects the purchase decision; buyer needs bounded recovery.
- Evidence class + authenticity mechanism: authenticated transaction declarations create actual protocol terms; exact holder ratification and provider endorsement bind canonical digests and roles. No external capability or delivery fact is trusted.
- Consensus question: does every expected purpose/deliverable/restriction dimension preserve the reserved scope, materially differ, or remain unclear?
- State machine: co-ratification -> prepaid offer -> endorsement -> semantic review -> exclusive exercise or outsider allocation -> one-time redemption; expiry/recovery and pull credits.
- Direct consequence: code opens holder-only exercise or allocates one buyer; fixed 1 GEN seller price and displaced-buyer refund; no model-selected amount/payee.
- Reuse surface: typed option/offer/review/exercise/finalize/redeem/recovery/credit API for a LangGraph reservation coordinator, DAOhaus renewal workspace and A2A marketplace. Proposed consumers, no adoption claimed.

## Mandatory gate matrix

| Gate | PASS/FAIL | Evidence/reason |
| --- | --- | --- |
| Replacement | PASS admission | A provider/private model can bypass the locked right; deterministic custody cannot interpret scope paraphrases |
| Judgment | PASS admission | Materially preserving purpose, included rights and restrictions needs semantic review |
| Evidence availability | PASS admission | Bounded canonical transaction state; two unsigned GenVM simulations fetched a dated W3C source and returned stable MATCH/DIFFERENT/UNCLEAR examples |
| Evidence authenticity | PASS admission | Complete authority rows below; the declarations create rights rather than assert external facts |
| Equivalence | PASS admission | Independent replay compares full IDs, classes, coverage, roots, bound digests and derived result |
| Consequence | PASS admission | Review controls the purchase window/allocation; exercise and expiry determine fixed payment/refund |
| Adversarial | PASS admission | Three asymmetric actors with conflicting incentives |
| State model | PASS admission | Isolated immutable options, attempt history, local temporal guards, complete terminal value paths |
| Reuse | PASS admission | Three named plausible consumers; integration documented, adoption pending |
| Contract count | PASS admission | One ParityOptionContract owns all independent state and value; no mirror consumer |
| Differentiation | PASS admission | Five or six material seven-field differences from nearest market/consent/delegation primitives, summarized below |
| Claim-to-code | PASS design | All retained claims map to interface, test and pending real-evidence rows below |
| Full lifecycle | PASS design only | Explicit owner-approved admission distinction; real script/browser finalization mandatory before acceptance |
| Scope honesty | PASS admission | Protocol reservation only; no delivery, legal/property or adoption claim |

One FAIL means redesign/reject.

## Actors, roles and incentives

| Actor | Permissions | Value at risk | Incentive to bias |
| --- | --- | --- | --- |
| Provider | Create, endorse exact offer, request review, finalize, close unpaid expired option, withdraw own credit | Fixed earned price after allocation | Prefer outsider and evade holder's purchase window |
| Holder | Ratify, review, exercise exact price, finalize, redeem if winner, withdraw own credit | 1 GEN only when exercising | Prefer broad priority or obstruct a distinct offer |
| Outside buyer | Submit exact offer, review, finalize, recover unresolved expired offer, redeem if winner, withdraw own credit | 1 GEN offer payment | Prefer narrower interpretation and immediate allocation |
| Validators | Independently evaluate exact canonical meaning; cannot set terms/payees | Consensus responsibility, no app-controlled fee | Malicious leader may omit a dimension or forge roots/coverage |

## Scope and non-goals

### In scope

- Co-ratified first-choice scope; one exact outsider offer per option, provider endorsement, independent semantic review, holder exercise or deadline allocation, one-time reservation redemption, bounded recovery and GEN withdrawals.
- V1 fixed price is 1 GEN. Three canonical dimensions: purpose, deliverables and restrictions. Exact slot identity is objective and must match before semantic review.

### Out of scope

- External delivery, ownership, legal enforceability, real agent execution, adoption, multi-tier priorities and variable pricing. A reservation declaration is authoritative only for the right the contract creates.
- Intended next milestone after V1 acceptance: multiple priority tiers with expiry cascades and a real gateway consuming awarded reservation rights.

## Product/frontend blueprint

> Required for Projects. Provisional in Stage 1; finalized in Stage 2 before
> contract implementation.

### Human users and jobs

| User/role | Primary job | Decision or outcome needed |
| --- | --- | --- |
| Provider | Offer one service reservation while honoring an agreed first choice | Define the slot and scope; invite the holder; endorse the outsider's exact offer; withdraw earned price |
| Priority holder | Decide whether to purchase a comparable reservation | Ratify the exact scope; see the meaningful scope comparison; exercise within the protected window or let it lapse |
| Outside buyer | Purchase a reservation with bounded waiting and recovery | Find an eligible option; submit exact terms with 1 GEN; see allocation or refund; redeem or withdraw |

### Provisional contract-capability sketch

Every action needs canonical role, lifecycle state and transaction-time bounds. The UI receives an option summary (ID, title, slot, provider/holder/buyer addresses, exact scope/offer, user status, deadline, purchase window, winner and redemption status), immutable chronological events and the connected user's GEN credit. No storage arrangement is prescribed here.

Provider journey: home -> create (three steps: slot/holder, scope, dates/review) -> detail -> invite/await holder -> inspect and endorse offer -> review/result -> account withdrawal. Holder journey: reservations -> detail -> ratify -> compare exact offer -> buy for 1 GEN during the window -> redeem -> history/account. Outside buyer journey: browse/filter -> detail -> dedicated offer form -> submit 1 GEN -> wait for endorsement/review -> result -> redeem, or recover/withdraw refund. Return via history and exact detail links.

Unconfigured adapters must report missing contract configuration; no displayed fixture or successful transaction substitutes for canonical data. Writes wait for submitted, accepted/decided and finalized SUCCESS, then reload the affected views. Failure retains inputs; uncertainty permits status refresh, never blind resubmission. Review uncertainty moves no money; expiry recovery has explicit caller/state/time conditions. Withdrawal shows real credit only.

### Information architecture

| Screen/view | User purpose | Primary action | Required states | Mobile behavior |
| --- | --- | --- | --- | --- |
| Home / | Explain first-choice protection and fixed price | Browse reservations or create priority | Static truthful explanation, wallet/config availability | Stacked hero and three process steps |
| Reservations /reservations | Find and revisit relevant reservations | Search title/slot/ID and filter active/history/mine | Loading, no items, no matching filter, error/retry, populated canonical list | Full-width rows, wrapping labels |
| Create /new | Grant a named holder first choice | Three-step scope/date review then submit | Draft/validation, disconnected, unavailable, pending, failed, finalized redirect | One column; previous/next buttons |
| Reservation /reservation/:id | Understand terms and make the role's current decision | Ratify, endorse, review/retry, exercise, finalize, recover or redeem contextually | Loading/not found/error; every canonical phase and transaction stage | Action card below exact terms; visible deadline |
| Offer /reservation/:id/offer | Commit exact offered terms | Review price and submit 1 GEN | Validation, unauthorized/late, unavailable, pending, failure/input retention, finalized redirect | One column and explicit price |
| Account /account | Revisit my work and retrieve credit | Withdraw real available GEN credit | Disconnected, loading/error, zero/positive credit, pending/finalized; link to my reservations | Stack account and credit sections |
| Help /help | Learn duties, waiting and recovery | Follow role-specific next steps | Real explanation and navigable links, wallet availability | Readable short sections |
| Not found /* | Recover from a bad link | Return to reservations | No invented entity | Clear single action |

Persistent header: brand/home, Reservations, Create priority, Help and connected Account. Mobile wraps without hiding navigation; active route indicated. Detail links support direct URLs and Back. Search filters canonical summaries in memory; no localStorage canonical data.

### Visibility matrix

Use exactly one visibility class per row: `USER_PRIMARY`,
`USER_CONTEXTUAL`, or `SYSTEM_ONLY`.

| Function/data group | Visibility | Eligible role/state | User need or reason hidden |
| --- | --- | --- | --- |
| Exact scope, meaningful status, price, deadline and winner | USER_PRIMARY | All readers | Understand purchase and result |
| Role's legal next action | USER_PRIMARY | Exact eligible role/state/time only | Complete or recover the job |
| Credit and withdrawal | USER_PRIMARY | Connected credit owner | Retrieve earned payment/refund |
| Transaction stage, failure and status-refresh control | USER_CONTEXTUAL | Transaction initiator | Wait safely; avoid duplicates |
| Full addresses and Explorer link | USER_CONTEXTUAL | Detail/account disclosure | Verify actors and canonical result |
| Digests, raw enums, attempt IDs, validator internals, deployment controls, grader and submission data | SYSTEM_ONLY | No primary UI control | Implementation/reviewer evidence only |

### UI action matrix

In Stage 1, the contract capability/method may be provisional. Stage 2 must
replace it with the finalized public interface before contract code.

| Visible control | Contract capability/method | Eligible role | Legal state | Input/value | Finality | Failure/recovery |
| --- | --- | --- | --- | --- | --- | --- |
| Create priority | create_option | Provider | New unique ID | Title, slot, distinct holder, three scope clauses, deadline/window; 0 GEN | Finalized SUCCESS, detail reload | Retain form; status lookup before retry |
| Accept first choice | accept_option | Named holder | DRAFT, before offer deadline | Exact current scope digest; 0 GEN | Finalized SUCCESS, reload | Refresh changed/stale state |
| Make an offer | submit_offer | Distinct outside buyer | ACTIVE, before deadline | Exact three clauses; 1 GEN | Finalized SUCCESS, detail reload | Retain form; bounded refund recovery |
| Endorse this offer | endorse_offer | Provider | OFFERED, before deadline | Exact canonical offer digest; 0 GEN | Finalized SUCCESS, reload | Never endorse changed bytes |
| Compare scopes / Try review again | review_offer | Participant | ENDORSED/RETRYABLE, before deadline | Option ID; 0 GEN | Finalized SUCCESS, comparison/result reload | Non-penalizing uncertainty; expiry recovery |
| Use my first choice | exercise_option | Holder | MATCH window, before its deadline | 1 GEN | Finalized SUCCESS, winner/credit reload | Late/duplicate reject; status refresh |
| Complete expired choice | finalize_option | Participant | MATCH and window ended | 0 GEN | Finalized SUCCESS, winner/credit reload | No early or duplicate allocation |
| Recover offer payment | recover_offer | Buyer; provider may close unpaid draft | Unresolved expired state | 0 GEN | Finalized SUCCESS, credit/state reload | No recovery of awarded payment |
| Redeem reservation | redeem | Exact winner | AWARDED and redemption period open | 0 GEN | Finalized SUCCESS, redemption reload | Once only; late rights fail closed |
| Withdraw credit | withdraw_credit | Connected credit owner | Positive credit | 0 GEN | Finalized SUCCESS, credit/native balance reload | No double withdrawal; real transfer evidence required |

### User-facing state language

| Canonical status/violation | User-facing label | User consequence/next step |
| --- | --- | --- |
| DRAFT | Awaiting first-choice acceptance | Holder reviews and accepts exact scope |
| ACTIVE | Open for an offer | Outside buyer can commit 1 GEN |
| OFFERED | Awaiting provider endorsement | Provider reviews exact offer |
| ENDORSED | Ready for scope review | Participants request neutral comparison |
| RETRYABLE | Comparison needs another try | Technical unavailability only; bounded retry or expiry recovery |
| UNVERIFIABLE | Scope remains unclear | Same offer cannot be reviewed again; buyer recovers after expiry |
| MATCH | Your first choice is open | Holder exercises before shown deadline; others wait |
| AWARDED | Reservation allocated | Exact winner may redeem; provider can retrieve price |
| RECOVERED | Offer payment returned as credit | Buyer withdraws refund |
| REDEEMED | Reservation redeemed | No second use |
| EXPIRED | Window ended | Refresh state; eligible recovery/finalization only |

### Visual preservation constraints

- Visual language/layout to preserve after Phase 3A: skill-verified Accessible & Ethical / Trust & Authority design; navy primary, blue CTA, near-white surfaces, EB Garamond headings and Lato text. Persistent header, generous readable sections, clear typed form steps, contextual right-side action panel, restrained event history. No unverified logos, certifications or adoption statistics.
- Allowed functional edits: minimal adapter/address/label/control/accessibility corrections under FE-PRESERVE.
- System/reviewer details excluded from the primary UI: digests, raw storage/attempt IDs, consensus configuration, grader/submission controls.
- Wallet behavior: EIP-6963 discovery plus injected fallbacks, centered keyboard-accessible picker with no auto-selection; selected account/provider held in memory, click address for logout; disconnect disables writes. Chain switch/add and separate wallet/IC paths are finalized with the real adapter in Phase 7.
- Design engine: initial service query returned an off-topic restaurant profile and was rejected. Single narrower B2B procurement query returned the relevant professional high-contrast profile; React stack query verified controlled forms/async errors, UX query verified visible modal focus. Local persisted design is ignored; human-readable tokens above are the product source of truth.

## State model

### Stable IDs

- Caller-chosen option and slot IDs: 1–64 ASCII letters/numbers/underscore/dash. IDs are never reused. Each option has immutable revision 1, one offer nonce 1, review attempt sequence 1–3 and event sequence. Keys bind option/sequence with a delimiter excluded from option IDs.
- Digests bind protocol version, actual chain/contract identity, option/slot ID, fixed roles, revision and exact scope bytes. Offer digest additionally binds canonical buyer and nonce. Neither digest authenticates an external claim.

### Structured storage

- Exactly one `ParityOptionContract(gl.contract.Contract)`. Flat `@genlayer.storage.allow @dataclass` OptionState, ReviewRecord and HistoryEvent records; no nested persistent collections constructed as ordinary dataclasses.
- Class-annotated `TreeMap[str, OptionState]`, `DynArray[str]` ordered IDs, `TreeMap[str, ReviewRecord]`, `TreeMap[str, HistoryEvent]`, `TreeMap[str, u256]` credits. Money and clocks use `u256`; no bare-int persistent field and no collection reassignment in constructor.
- OptionState includes exact scope/offer dimensions, roles, ratifier/endorser plus immutable ratified/endorsed digests, chain/contract/revision/nonces/digests, author/accept/offer/endorsement timestamps, deadline/window, state, award/redemption timestamp, winner, locked GEN amount, event count and review count. ReviewRecord stores the complete normalized three-dimension result/coverage/root IDs and bound attempt metadata, not arbitrary unvalidated JSON.
- Global received, locked, credited and withdrawn totals have explicit invariant. Maximum 128 options, three review attempts each, 20 summary items per page, bounded per-option history. No global overwriteable last-result field.

### State machine

```text
DRAFT --accept_option/holder--> ACTIVE
ACTIVE --submit_offer/outside buyer + 1 GEN--> OFFERED
OFFERED --endorse_offer/provider--> ENDORSED
ENDORSED or RETRYABLE --review_offer/participant--> MATCH | AWARDED | UNVERIFIABLE | RETRYABLE
MATCH --exercise_option/holder + 1 GEN before window end--> AWARDED
MATCH --finalize_option/participant at/after window end--> AWARDED to outside buyer
AWARDED --redeem/winner before redemption expiry--> REDEEMED
DRAFT or ACTIVE --recover_offer/provider at/after offer deadline--> EXPIRED
OFFERED or ENDORSED or RETRYABLE or UNVERIFIABLE --recover_offer/buyer at/after deadline--> RECOVERED
positive own credit --withdraw_credit/credit owner--> zero own credit + finalized EOA value message
```

### Temporal entrypoint rules

> Phase and clock are independent. Every time-bounded public write must enforce
> its own exact interval. State the equality boundary and stale-phase behavior
> for each affected method.

- Canonical transaction-time source: current v0.3 `gl.message.raw['datetime']`; parse timezone-aware ISO UTC deterministically. Missing, malformed, naive or impossible time fails closed before mutation. No system clock, caller timestamp, fallback epoch or frontend time as authority.
- Default/exception interval semantics: `created_at <= now < offer_deadline`; equality is late. Creation requires future deadline no farther than 30 days; purchase duration 30 seconds–7 days. Review opens `exercise_deadline = review_time + duration`; this may extend beyond offer deadline to preserve the entire holder window.
- Entrypoint-local guards: accept/submit/endorse/review each re-read transaction time and require offer window; exercise requires `review_time <= now < exercise_deadline`; finalize requires `now >= exercise_deadline`; redemption requires `award_time <= now < award_time + 1 day`. Every guard is independent of stale phase.
- Recovery/cancellation: provider may close only an expired unpaid draft/active option; only its buyer recovers a funded unresolved offer after the offer deadline. MATCH/AWARDED/REDEEMED/RECOVERED/EXPIRED are excluded. No provider early cancellation or diversion of buyer funds. Withdrawal is non-temporal because vested credit has no expiry.

### Illegal transitions

- No overwritten scope, holder, provider, buyer, endorsed offer, deadline or price. No offer before ratification; no review before endorsement; no holder buying a DISTINCT award; no expired exercise; no early finalize/recovery; no second award, redemption or credit. Semantic UNCLEAR is terminal for the exact offer and cannot be re-reviewed; only technical upstream failure permits bounded retry.

### Authorization

- Actual `gl.message.sender_address` is the caller authority. Parse/validate nonzero addresses, keep roles distinct, compare canonical normalized addresses. Ratification/endorsement record the actual role and exact expected digest. Participants means exact provider, holder or submitted buyer, never an address inferred from prose.

### Idempotency and double-action prevention

- Duplicate state transitions revert before mutation/value/accounting effects. Exact digest and next-attempt arguments reject stale/concurrent requests; no overwrites. A successful award zeroes the offer's locked amount once. Withdrawal debits the complete own credit and global liability before the EOA message. No payable argument or model output can choose a destination.

## Write-method safety matrix

> Required before contract implementation. Every state-changing or
> value-affecting write method must have a row. Treat cancel, refund, retry,
> settle, withdraw, close, restore, and recover as high-risk transitions, not
> helper functions.

| Method | Caller | Allowed states | Forbidden states | Temporal/expiry gate | Idempotency | Value/accounting effect | Views affected | Negative tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| create_option | Valid provider wallet; different valid holder | New unique ID, option capacity available; unique provider/slot | Existing ID, invalid roles/terms/clock | `now < deadline <= now + 30 days`; duration 30s–7d | Duplicate ID rejects | 0 GEN; no purse; non-payable metadata | get_option/list_options/get_config/history | Duplicate ID, wrong role/address, malformed/bounded terms, bad clock, expired date, unexpected value |
| accept_option | Exact holder | DRAFT with matching scope digest | Any other state or wrong digest | `created_at <= now < deadline`; equality late | Second acceptance rejects | 0 GEN; no credit/value movement; non-payable | option/history | Wrong caller/state/digest/version, boundary -1/= /+1 stale DRAFT, duplicate, unexpected value; unchanged state/accounting |
| submit_offer | Valid outside buyer distinct from provider/holder | ACTIVE; exact protected-scope digest, no buyer | Other states or existing offer | `accepted_at <= now < deadline`; equality late | One offer nonce; duplicate rejects | Receives exactly 1 GEN; received/locked +1 GEN; payable | option/history/accounting | Wrong caller/state/scope binding, duplicate, 0/2 GEN, boundary -1/= /+1 stale ACTIVE, future origin; unchanged on rejection |
| endorse_offer | Exact provider | OFFERED; exact offer digest, valid buyer origin | Other states/wrong digest | `offered_at <= now < deadline`; equality late | One endorsement; duplicate rejects | 0 GEN; no movement; non-payable | option/history | Wrong caller/state/digest, replay, future/stale binding, deadline trio stale OFFERED, unexpected value |
| review_offer | Exact participant | ENDORSED/technical RETRYABLE; next expected attempt <=3; origin/digests valid | Missing endorsement, semantic UNVERIFIABLE, other/terminal states, exhausted attempts | `endorsed_at <= now < deadline`; equality late | Expected next attempt rejects replay/concurrency; success appends once | MATCH locks same 1 GEN; DIFFERENT converts it to fixed provider credit; UNCLEAR/technical retry no GEN movement; non-payable | option/review/history/accounting | Wrong caller/state/attempt, exhausted retries, valid hash/wrong provenance, malformed output, invalid coverage/root/class/meaning, deadline trio stale state, accounting unchanged on rejected output |
| exercise_option | Exact holder | MATCH; one intact buyer deposit | All other states or settled/empty purse | `review_time <= now < exercise_deadline`; equality late | Second exercise/award rejects | Receives exactly 1 GEN; provider credit +1 GEN; buyer refund +1 GEN; locked -1 GEN; payable | option/history/credit/accounting/can_redeem | Wrong caller/state, early/late boundary trio stale MATCH, duplicate/closed, 0/2 GEN, invariant before/after, no double credit |
| finalize_option | Exact participant | MATCH with intact deposit | Any other/settled state | `now >= exercise_deadline`; equality eligible | Second award rejects | Allocates buyer; locked -1 GEN, provider credit +1 GEN; non-payable | option/history/credit/accounting/can_redeem | Wrong caller/state, early/boundary/+1 stale MATCH, duplicate/closed, unexpected value; unchanged on rejection |
| recover_offer | Provider if no buyer; exact buyer if funded | Expired unpaid DRAFT/ACTIVE; expired funded OFFERED/ENDORSED/technical RETRYABLE/UNVERIFIABLE | MATCH/AWARDED/REDEEMED/RECOVERED/EXPIRED; mismatched interest/purse | `now >= offer_deadline`; equality eligible; no upper bound | One close/refund; duplicate rejects | Unpaid close: 0 GEN; funded: locked -1 GEN, buyer credit +1 GEN; non-payable | option/history/credit/accounting | Wrong caller/state, premature/boundary/+1 with stale phase, actor interest, duplicate/finalized, purse/invariant, no double refund, unexpected value |
| redeem | Exact award winner | AWARDED, unconsumed reservation | Any other state, wrong winner, already redeemed | `award_time <= now < redeem_deadline`; equality late | One use; duplicate rejects | 0 GEN; reservation use only; non-payable | option/history/can_redeem | Wrong caller/state/winner, before/equal/after expiry stale AWARDED, duplicate/closed, unchanged ledger, unexpected value |
| withdraw_credit | Exact own credit owner | Positive credit, any option phase | Zero credit or invalid caller; no arbitrary recipient | N/A: vested pull credit never expires | Complete debit once; second withdrawal rejects | Credit/liability debit first, withdrawn +amount, `@gl.evm.contract_interface` EOA message on finalized; non-payable | credit/accounting | Zero/wrong caller, unexpected value, duplicate/terminal context, exact native contract decrease, successful parent and retained external-message caller/contract/recipient/value/phase binding, no double withdrawal |

No write method may be implemented while its row has a blank or vague safety
cell. A genuinely non-temporal method records `N/A` with a reason in
`Temporal/expiry gate`.

## Frontend lifecycle coverage matrix

> Required for Projects. Every claimed browser workflow step must have a
> frontend wrapper/control/test/finality/canonical-reload path. Script-only
> steps must be marked pending and not claimed as browser-complete.

| Canonical state | User action | Contract write | UI component | Frontend test | Evidence status |
| --- | --- | --- | --- | --- | --- |
| New | Three-step creation | create_option | Create form | journey creation exact-scope/validation | LOCAL adapter test PASS; real browser pending |
| DRAFT | Accept exact first choice | accept_option | Detail action card | holder acceptance/reload/disconnect | LOCAL adapter PASS; real browser pending |
| ACTIVE | Offer exact scope and 1 GEN | submit_offer | Offer route/form | buyer offer journey/value boundary | LOCAL adapter PASS; real SDK/value/browser pending |
| OFFERED | Endorse exact buyer offer | endorse_offer | Provider action card | legal OFFERED action/reload | LOCAL adapter PASS; real browser pending |
| ENDORSED/technical RETRYABLE | Compare/retry | review_offer | Participant action card | legal review/retry/reload and uncertain transaction tripwire | LOCAL adapter PASS; real independent consensus/browser pending |
| MATCH | Buy within first-choice window | exercise_option | Holder action card | exact holder legal action/reload | LOCAL adapter PASS; real SDK/value/browser pending |
| MATCH expired | Allocate outside buyer | finalize_option | Participant action card | model boundary and UI expiry/reload cases PASS locally | PENDING_REAL_EVIDENCE |
| Unresolved expired | Recover deposit/close unpaid | recover_offer | Interested actor action card | model boundary and UI expiry/reload cases PASS locally | PENDING_REAL_EVIDENCE |
| AWARDED | Redeem once | redeem | Winner action card | winner action/reload; boundary/no-repeat tests | LOCAL adapter PASS; real browser pending |
| Own positive credit | Retrieve payment/refund | withdraw_credit | Account credit panel | withdrawal reload to zero | LOCAL adapter PASS; external transfer proof/browser pending |

## Evidence policy

- Authoritative sources: public canonical contract state and actual authenticated role transactions. W3C dated ODRL page is a feasibility anchor only, never an authority for service delivery or external property.
- Provenance/authentication: sender authentication authorizes constitutive declarations themselves; provider authors priority, holder ratifies its digest, outside buyer authors offer, provider endorses its digest. Registered ratifier/endorser fields must match expected roles before review.
- Authorized attestor/signer: exact provider/holder/buyer for their own actions, bound by network signature/caller. No app operator or external self-report attestation.
- Anti-replay: domain-separated SHA-256 over deterministic JSON with sorted keys/compact separators/ASCII escapes, exact original strings, chain/contract, entity/slot/roles/revision; offer includes buyer/nonce. No text trimming changes committed bytes.
- Timestamps: runtime-authored `created <= accepted <= offered <= endorsed <= now`, all relevant pre-review actions before deadline. Missing/future/reversed times reject deterministically. Review attempt nonce must be current.
- Immutable version: PARITY_OPTION_V1, revision 1, immutable three dimension IDs. No fetched URLs/digests in the consequential production path; fetched-content digest rule is N/A with this reason. Stored canonical scope/offer digests must be recomputed from the exact state bytes before prompt or consequence.
- Schemes/domains/paths: production accepts no consequential external source URL. Probe fixed official HTTPS W3C Recommendation dated 2018-02-15, bounded/status markers, not a configurable actor mirror.
- Bounds: 120-character title; 1–1,200 characters per dimension; IDs <=64; exactly three dimensions; one offer; three technical attempts; bounded history/list pages.
- Missing role/digest/objective evidence: revert before LLM and mutation. Conflicting/insufficient meaning: UNVERIFIABLE, no award/payment, no semantic grinding; recover after deadline. Upstream LLM-call unavailability: independently verified technical RETRYABLE, capped attempts. Malformed/structurally inconsistent normalized LLM output: revert before recording an attempt or any value effect.
- Canonical objective: same exact slot under the provider/holder's locked scope; three expected IDs and deterministic payees are always code/state supplied. Artifact prose is quoted untrusted data and cannot redefine IDs, authority, price or winner.
- Excluded: private logs, claimant-hosted JSON, screenshots, fabricated service execution, legal ownership, delivered capability, signatures assessed by an LLM. Hash stability is not authenticity.

A commit hash or SHA-256 digest proves byte stability only. It does not prove
the underlying real-world fact is authentic.

### Evidence Authority Matrix

| Consequential claim/fact | Evidence/artifact | Data controller | Authoritative source/issuer | Deterministic verification | Canonical objective/entity/actor binding | Freshness/anti-replay | Semantic role after verification | Non-penalizing failure state | Consequence blocked | Required negative test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Provider grants named holder priority over a protocol reservation | Exact three scope clauses, roles and deadline in state | Provider authors; holder ratifies | Actual provider/holder transactions create the right | Valid distinct addresses/IDs/bounds; exact scope digest ratification; ratifier equals holder; revision/chain/contract fixed | Option/slot/provider/holder, PARITY_OPTION_V1 revision 1, three fixed IDs | Unique ID; immutable activation; canonical ordered time and live deadline | Compare exact protected meaning only | Revert before mutation/LLM | Priority review, award, redemption and credits | Valid bytes/digest with wrong ratifier/role/entity/revision, forged caller, stale/future timestamp or replay; unchanged ledger/state |
| Outside buyer makes the exact offer the provider is willing to honor | Canonical buyer scope, 1 GEN payment and exact provider endorsement | Buyer authors; provider endorses stored bytes | Actual distinct buyer/provider transactions create that offer | Exact 1 GEN, current protected digest, one nonce, buyer role; recompute offer digest; endorser equals provider; all objective bindings before review | Same option/slot/protected scope, fixed buyer/provider/holder, revision/nonce/chain/contract | One immutable offer and endorsement; ordered runtime timestamps; deadline/attempt guards | Scope comparability only after both origins pass | Revert; technical retry or semantic UNVERIFIABLE has no GEN/hard consequence | Exercise window, award, provider credit, redemption | Valid digest but wrong endorser/objective/slot/actor/version; replay/stale/future; artifact redefines authority/payee; unchanged GEN and settlement/access except permitted non-penalizing record |
| Public source is a dated W3C permission model, for viability only | Exact dated HTTPS Recommendation | W3C | www.w3.org fixed official dated URL | Probe status 200, bounded body, Permission/Prohibition/Duty markers | Fixed 2018-02-15 version; never supplies production payee/rights facts | Immutable dated version; failures separate from semantic sample | Feasibility example only | Spike fails; candidate unselected | All production start if spike fails | Wrong host/path/version or actor mirror cannot substitute; matching digest alone is insufficient |

Every actor-controlled evidence path that can affect transfer, payout, credit,
settlement, slashing, quarantine, routing, access, or rights needs one complete
row. No cell may be blank or vague. If an interested actor controls all fetched
bytes and no independent authority verifies the consequential claim, Evidence
authenticity is `FAIL` and implementation must not start.

No consequential fact may rely only on actor-controlled public bytes,
claimant-hosted JSON, screenshots, self-reported logs, commit hashes, SHA-256
digests, or LLM judgment that a signature "looks valid". If deterministic
authentication is absent or invalid, the consequence must be
`UNVERIFIABLE`/`RETRYABLE`/non-penalizing.

At least one negative test per consequential evidence class must keep the
bytes and digest valid while making provenance actor-controlled, incorrectly
bound, replayed, stale, future-dated, or wrong-version. The test must prove that
GEN accounting, settlement, access, routing, quarantine, and other hard state
remain unchanged except for an explicit non-penalizing retry/unverifiable
record allowed by the state machine.

## Consensus design

### Leader task

- Inputs: immutable authenticated scope and endorsed offer; exact option/attempt/chain/contract/digests and three expected IDs. Verify origins/digests before entering nondeterminism.
- Fetch: no external production evidence; independent nondeterministic LLM invocation through current v0.3 sandboxed `gl.vm.run_nondet_default`. Read-only viability fetch is separate.
- Extraction: classify purpose, deliverables and restrictions against their protected counterpart, including any additional permission or removed duty as material difference. Do not infer missing terms or determine a beneficiary.
- Normalization: request JSON; resolve documented lazy return before parsing; permit JSON object or a bounded fenced JSON string only. Reject duplicate JSON keys, missing/extra IDs or fields, invalid classes, root/class inconsistency, unexpected binding/coverage, prose-selected consequence/amount/payee. Sort meaningful sets; retain no model-selected payout.
- Structured successful output: exact option_id, attempt, scope_digest, offer_digest, coverage exactly ['scope','offer'], decisions exactly three `{id,class}` records, root_ids exactly DIFFERENT IDs, outcome MATCH/DIFFERENT/UNCLEAR. Optional reason <=500 characters is non-critical and never supplies authority. Every critical field is deterministically checked. Technical fallback is a distinct fixed internal UPSTREAM_UNAVAILABLE result produced only by an exception around the LLM call, never by malformed parsed output or artifact prose.

### Consensus-critical fields

| Field | Type/bounds | Comparison rule | Why critical |
| --- | --- | --- | --- |
| option/attempt/chain/contract/digests | Locked identifiers | Exact identity; reject stale/extra binding | Prevent cross-entity/replay |
| coverage | Exactly scope + offer | Exact set, no duplicate/extra | No partial evidence consequence |
| decisions | Exactly purpose, deliverables, restrictions; MATCH/DIFFERENT/UNCLEAR | Independent complete normalized ID/class comparison | A differing right or ignored duty must not agree |
| root_ids | Exactly IDs classified DIFFERENT | Derive and compare sorted set | No unsupported material difference |
| outcome | Derived from full classes | UNCLEAR if any UNCLEAR; else DIFFERENT if any DIFFERENT; else MATCH | Code controls the consequence |
| technical availability | Internal UPSTREAM_UNAVAILABLE only | Independent call must encounter same coarse failure, not malformed-model agreement | Non-penalizing retry only |

### Validator

- Independent evidence/replay: validator reruns the same task on exact canonical inputs; require `gl.vm.Return`, normalize leader and independent result, compare every meaningful field. Direct mode leader execution alone is insufficient; explicit malicious leader/replay tests and actual bounded consensus required.
- Semantic rule: exact full three-dimension classes, coverage, root set and derived outcome; ignore rationale wording. Validator cannot bless a plausible-looking shape without another substantive result.
- Rejection: non-Return, disagreement, impossible metadata, incomplete/duplicate/extra IDs, invalid enum, unsupported root or artifact-selected amount/winner. Parsed model schema errors are not treated as technical unavailability.
- UNDETERMINED/network failure: never assume success or reuse a guessed attempt. Read current finalized option/review sequence; distinguish transient failure from structural prompt/parser failure before retrying.

### Rationale policy

- Reason may vary, is bounded and system-only. UI displays normalized meaningful dimension classes and exact party terms, not validator prose as an instruction.

### Settlement invariants (checked before mutation)

| Path | Required coverage/IDs/classes | Root and dependency rule | Derived consequence | Destination/remainder | Invalid output |
| --- | --- | --- | --- | --- | --- |
| MATCH | Complete authenticated scope+offer; exactly three expected IDs, all MATCH | Empty difference roots; downstream/blocked/inherited classes forbidden (no dependency graph exists) | Open holder-only exercise window; keep buyer's 1 GEN locked | No payout/residual | Revert before mutation/attempt/value |
| DIFFERENT | Complete authenticated sources; exact IDs; at least one DIFFERENT, no UNCLEAR | root_ids exactly DIFFERENT IDs; no unrelated/downstream roots accepted | Award outside buyer, zero locked purse, credit provider | Provider exactly 1 GEN; no fees or rounding | Revert before award/credit |
| UNCLEAR | Complete exact-ID mapping containing UNCLEAR | Roots still match any DIFFERENT classes exactly; no invented relations | Terminal semantic UNVERIFIABLE for that exact offer; no new award/access/payment | Buyer recovery after deadline | Revert malformed output; no penalty |
| Technical unavailable | Exact canonical binding plus internal coarse failure, independently reproduced | No dimension/root verdict claimed | Bounded RETRYABLE only, no economic/hard right | Existing buyer purse unchanged | Parser/schema errors cannot enter this path |
| Exercise/finalize/recovery | Recheck canonical origin, safe state, exact time, intact purse and no prior winner/settlement | No model-controlled numeric data | Exactly one award or refund and immutable winner | Fixed state-derived payees; every received GEN -> locked, credit or withdrawn | Revert before mutation |

## Consequence and accounting

| Verdict | Canonical state change | Consumer action | Value movement |
| --- | --- | --- | --- |
| MATCH | Holder-only window; buyer purse remains locked | Holder may exercise; participant may finalize after window | No payment credit yet |
| DIFFERENT | AWARDED to outside buyer | Winner may redeem once | 1 GEN locked -> provider credit |
| UNCLEAR | UNVERIFIABLE; no semantic retry | Buyer waits for bounded recovery | No GEN movement |
| Technical unavailable | RETRYABLE, attempt history only | Retry before deadline, max three | No GEN movement |
| Holder exercise | AWARDED to exact holder | Holder redeems; outsider retrieves refund | Holder's 1 GEN -> provider credit; outsider's 1 GEN -> refund credit |
| Window expiry | AWARDED to exact outsider | Outsider redeems | Outsider's locked 1 GEN -> provider credit |
| Unresolved offer expiry | RECOVERED | Buyer withdraws | Outsider's locked 1 GEN -> buyer refund credit |

- Boundary: contract consequences belong to the validator-accepted transaction and become authoritative to the app only at finalized execution SUCCESS; read finalized storage after each write. External EOA value messages use on='finalized'. Accepted/finalized status without execution SUCCESS is not success evidence.
- Ledger invariant: received = locked + credit_total + withdrawn, with per-option intact 1 GEN or zero and exact credit updates. Native balance must reconcile locked + credit_total before/after completed external messages. No fees/slash/remainder; all prices are exact whole GEN. Any surplus native transfer is disclosed, not silently credited.
- Transfer evidence: exact intended native contract-balance decrease; successful finalized parent bound to contract and credit owner; exactly one retained External message with exact recipient/value, empty calldata and onAcceptance false; zero own credit; recipient native increase allowing gas fees. Current Studio Dev exposes this EVM transfer in parent messages and does not supply an IC child hash. Parent finalization and zero internal credit alone cannot PASS.
- Withdrawals debit ledger before the proper EOA/EVM interface; never `gl.chain.Account.emit_transfer`. Failure before message commit reverts; ambiguous network result triggers status/native-balance recovery, not blind resend. Broken transfer revision is abandoned with explicit evidence and no further funds.
- Cure/appeal/restore: N/A in V1; no punitive judgment or external service restoration. Technical retry and expiry recovery are the only defined recovery mechanisms.

### Value-destination matrix

| Source/payer | Locked state | Release/refund destination | Terminal state | Duplicate/late/retry | Canonical proof |
| --- | --- | --- | --- | --- | --- |
| Outside buyer, 1 GEN | OFFERED/ENDORSED/RETRYABLE/UNVERIFIABLE/MATCH | Provider on outsider award; buyer on holder exercise or unresolved expiry | AWARDED/REDEEMED or RECOVERED | One allocation/refund; no early recovery; invalid review unchanged | option, credit, accounting, native balance |
| Holder exercise, 1 GEN | Accepted only in live MATCH; immediately assigned | Provider exactly 1 GEN | AWARDED to holder | Wrong state/value/late/duplicate rejects; no stranded holder deposit | option, credit, accounting, native balance |
| Earned/refund credits | Claimable until withdrawn, no expiry | Exact credit owner wallet only | Own credit zero after withdrawal | Complete debit once; second call rejects; ambiguity requires receipt lookup | credit/accounting + exact native contract decrease |
| Fees/bonds/reward/residual | N/A; none exist in V1 | N/A; fixed equal price has no rounding | N/A | No artifact/validator can introduce one | config/settlement invariants |

## Reusable interface

### Write methods

- `create_option(id,title,slot,holder,purpose,deliverables,restrictions,deadline,window)`; zero GEN, non-payable.
- `accept_option(id,expected_scope_digest)`; zero GEN, non-payable.
- `submit_offer(id,expected_scope_digest,purpose,deliverables,restrictions)`; exactly 1 GEN, payable.
- `endorse_offer(id,expected_offer_digest)`; zero GEN, non-payable.
- `review_offer(id,expected_next_attempt)`; zero GEN, non-payable.
- `exercise_option(id)`; exactly 1 GEN, payable.
- `finalize_option(id)`, `recover_offer(id)`, `redeem(id)`, `withdraw_credit()`; zero GEN, non-payable. No raw recipient/value argument for settlement or withdrawal.
- Public timing/counter arguments use bounded u256/int calldata; source names/imports match the coherent v0.3 runtime. Runtime enforces non-payable metadata; negative direct/AST/simulation checks supplement it without reading message.value in non-payable methods.

### View methods

- `get_option(id)`: exact user-relevant scope/offer/roles/state/deadlines/winner and integration-only digests/attempt; no fake data for unknown ID.
- `list_options(offset,limit)`: bounded canonical summaries and next cursor; newest relevant history retained, never a single overwritten last entity.
- `get_history(id)`: isolated ordered canonical events.
- `get_review(id,attempt)`: exact normalized review record/current attempt, no hardcoded attempt -1.
- `get_credit(account)`: GEN-denominated own credit, validated address.
- `get_accounting()`: received/locked/credit/withdrawn GEN and invariant.
- `can_redeem(id,account)`: exact winner, unconsumed right, current canonical transaction expiry.
- `get_config()`: protocol/runtime identity, fixed 1 GEN price, bound IDs/limits.

### Consumer/callback

- No separate consumer/callback boundary in V1: another status-mirroring contract is unjustified. Consumers call the primitive's views and winner-only redeem method.
- Future gateway is roadmap only. It must independently authenticate sender/finalized reservation and enforce one-use delivery before being claimed.
- Current idempotency is option ID plus state/winner/redemption flag; technical retry uses exact next attempt. Recovery caller/state/time/value safety is in the write cards above.

## Threat model

| Threat | Attack | Mitigation | Test |
| --- | --- | --- | --- |
| Provider evasion | Reword scope to bypass holder | Complete semantic replay under locked three dimensions; provider cannot write verdict | test_meaning_and_replay; real paraphrase smoke |
| Forged origin | Correct digest with wrong ratifier/endorser, actor or objective | Role/digest/revision/slot/time verification before LLM | test_provenance_tripwires |
| Malicious leader | All-MATCH shape, missing ID, unsupported root or prose-selected payee | Independent substantive replay plus settlement invariants | test_settlement_invariants/test_validator_replay |
| Prompt injection | Offer prose redefines objective/IDs/winner/price | Locked canonical metadata outside untrusted quoted artifacts; enum/ID/payee derivation | test_prompt_boundary and injection corpus |
| Semantic grinding | Repeat UNCLEAR until a favorable answer | UNVERIFIABLE terminal for exact immutable offer; only capped technical retry | test_unclear_terminal/test_retry_limit |
| Stale phase/time | Expired MATCH/DRAFT stays unchanged | Every entrypoint checks its own canonical time bounds | test_temporal_boundaries |
| Double value action | Duplicate exercise/recovery/award/withdraw | Intact-purse/winner/credit/state guards and debit before EOA message | test_accounting_and_recovery |
| Wallet mismatch/uncertainty | Wrong account override or timeout resubmission | Explicit selected provider/account in real SDK client; no per-write raw account; uncertainty blocks duplicate | real-SDK adapter regression + UI tripwire |

## Test plan

- Happy: holder purchase/refund; materially distinct buyer award; expired holder window; unresolved recovery; one-time redemption; all credit withdrawals and zero liability.
- Unauthorized/isolation/locking: every write wrong caller/state; two isolated options; immutable scope/offer/dates/roles; wrong canonical IDs/digests; no overwrites.
- Evidence: valid bytes/hash with forged origin/ratifier/endorser, wrong objective/slot/actor/revision, replay, stale/future timestamps; unchanged GEN/award/access except permitted retry/unverifiable record.
- Leader/invariants: missing/extra/duplicate IDs/keys, invalid class, complete-shape semantic mismatch, wrong root set or unsupported downstream class, wrong binding/coverage/outcome and artifact-chosen value; unchanged accounting before consequence.
- Validator: explicit non-Return rejection, independent replay disagreement, same meaning/different reasons acceptance; leader-only direct mode does not prove this.
- Prompt: malicious instructions remain untrusted data; missing meaning becomes UNCLEAR, not inferred authority or payout.
- Temporal: each time-bounded method boundary -1/exact/+1 with deliberately stale phase, and canonical state/accounting unchanged on rejection; missing/naive/malformed transaction time fail closed.
- Value/recovery: exact 1 GEN vs 0/2 GEN, receiver payability metadata, non-payable value rejection, wrong state/caller/duplicate/finalized, no double credit/refund/settle/withdraw; invariant after each transition. No orphaned deposit when a later actor skips.
- Parsing/tooling: raw and normalized Studio receipts, execution result vs status, retained EVM transfer message projection, safe field allowlist; malicious/unknown shape fails closed.
- Browser: every visible write wrapper/control/test/finality/reload, real SDK provider/account/value regression, actual selected-wallet transactions distinct from script actors, local browser IC proxy/CORS, keyboard/responsive/English review. Synthetic adapter tests are local only.
- Cure/restore: N/A, no punitive states. Consumer enforcement: winner-only redeem/effective view, no gateway adoption. Technical retries capped; structural parser failure diagnosed before retry; UNDETERMINED never invents finality.

## Claim-to-code matrix

| Claim | Contract method/state | View/read | Test | Network evidence |
| --- | --- | --- | --- | --- |
| Exact ratified first choice cannot be rewritten | create/accept, DRAFT -> ACTIVE | option/history | test_entity_isolation_and_immutable_activation; test_valid_digest_wrong_provenance_cannot_reach_consequence; UI create/accept | attempts.json: match-create and match-accept finalized, canonical before/after |
| Paraphrases preserve holder's choice | endorse/review -> MATCH | review/option/history | test_independent_validator_checks_meaning_not_rationale; UI review | match-review.json; attempts.json match-review finalized, MATCH canonical state |
| Different scope allocates outsider | review -> AWARDED, fixed credit | option/review/credit/accounting | test_invalid_settlement_output_reverts_before_attempt_or_credit; test_distinct_scope_allocates_outside_buyer_and_redeems_once | PENDING_REAL_EVIDENCE: distinct scope lifecycle |
| Holder decides, pays 1 GEN and refunds displaced buyer | exercise -> holder award | option/credit/accounting/can_redeem | test_holder_exercise_assigns_fixed_price_refund_once; UI exercise | attempts.json match-exercise finalized, received 2 GEN, credits 2 GEN, holder winner |
| Window expiry allocates exactly once | finalize -> outsider award | option/history/accounting | test_each_temporal_write_enforces_own_boundary_with_stale_phase; test_recovery_never_diverts_a_closed_or_allocated_purse; UI expiry | PENDING_REAL_EVIDENCE: expiry finalization |
| Unresolved offers have bounded refund recovery | recover -> RECOVERED | option/credit/accounting | test_expired_offer_recovery_is_buyer_only_and_cannot_double_credit; test_each_temporal_write_enforces_own_boundary_with_stale_phase; UI recovery | PENDING_REAL_EVIDENCE: expired unresolved refund |
| One reservation can be redeemed only once by winner | redeem, AWARDED -> REDEEMED | option/can_redeem | test_distinct_scope_allocates_outside_buyer_and_redeems_once; test_each_temporal_write_enforces_own_boundary_with_stale_phase; UI redeem | attempts.json match-redeem finalized, REDEEMED; negative repeat verified directly |
| Credits reach exact wallet | withdraw, complete debit + finalized EOA message | credit/accounting + native RPC | test_withdrawal_debits_first_uses_external_eoa_boundary_and_cannot_repeat; native-transfer.test.mjs; receipt parser; UI account | attempts.json match-withdraw-provider/buyer: exact 1 GEN native decrease each, bound retained External message, zero credits; match-lifecycle.json native zero |
| Browser uses chosen wallet and real finalized state | adapter read/write/progress + finalized reload | all relevant canonical views | real-SDK account/value regression; UI disconnect/uncertain tx | PENDING_REAL_EVIDENCE: browser all claimed actions and local CORS |

No important claim may have a blank cell.

## Analogue and differentiation matrix

| Analogue/prior idea | Similar dimensions | Structural difference | Collision decision |
| --- | --- | --- | --- |
| SkillSlot | Canonical promises and possible market/router consumers | Prior asymmetric first choice/holder exercise rather than bipartite matching/delivery escrow; five fields differ | PASS admission, no source copied |
| PactRelay | Possible agent consumers | Buyers exercise a purchase option rather than provider generation/bond succession; six fields differ | PASS admission |
| ConsentDelta | Canonical constitutive text | Offer parity and incumbent purchase rather than affected-party amendment consent/revision adoption; six fields differ | PASS admission |
| TenderSeal | Possible procurement consumers | No sealed tournament/model-selected winner; ratified priority plus optional holder exercise; six fields differ | PASS admission |
| GrantLattice/ConcordBatch | Canonical text and possible agent consumers | No attenuation graph or intent conflict scheduling; purchase-window mechanism; five fields differ each | PASS admission |
| BridgeDraft/ScopeSeal | Constitutive text or possible procurement consumers | No generated compromise/bilateral purse or official post-award amendment negotiation; six fields differ each | PASS admission |
| Generic clause/escrow exclusions | Broad semantic interpretation/agreed terms | Complete three-actor anti-circumvention option/exercise/expiry/reservation mechanism, not bare legal applicability or delivered-work release/refund | PASS admission; no universal novelty/rating claimed |

## Deployment and evidence plan

- Network: Studio Dev only, locked IC endpoint/current v0.6 chain object; verify IC and wallet chain identity before writes. Never mix legacy/localnet/other-network evidence.
- Roles: safely discover project ignored env then authorized parent env; use three existing authorized EOAs for provider, holder and buyer if distinct. Presence only in logs. Do not create a new EOA or use a faucet.
- Deploy: Python 3.12 repo venv, UTF8 lint, exact ASCII coherent pragma/Depends/API, one recognized class, complete npm check; local source commit; unsigned runtime/clock/payable/schema smoke; estimate all current v0.6 fee allocations before safely signing deployment; finalized execution SUCCESS and deployed source/schema equality.
- Lifecycle: primary holder-exercise scenario with 1 GEN outside offer and 1 GEN holder payment; all three roles, endorsement/review, canonical award, winner redemption, both fixed credits withdrawn, exact native balance zero. Additional distinct/timeout/unresolved-recovery scenarios only with resumable IDs and explicit value destinations.
- Canonical reads: option/current attempt/review/history, winner/effective redeem, own credits, aggregate ledger, finalized native contract/recipient balances. Browser proof is separate from script-signed deployment/lifecycle.
- Evidence: sanitized explicit allowlist under docs/evidence/studio-dev; active deployment.json binds chain/source commit/hash/runtime/addresses; superseded revisions archived with reason/attempt/recovery or explicit broken-contract abandonment. Never save raw receipts/traces/config/stdout/stderr.
- Resume: recover IDs/tx hashes and finalized views before sending; query ambiguous transfers/withdrawals and destination balance before retry; never hardcode attempt -1 or guessed deploy address.

## Definition of Done

### Reusable contract requirements (Projects category remains locked)

- [ ] Reusable primitive.
- [ ] Semantic validator judgment.
- [ ] Direct consequence.
- [ ] Reuse proof (documented views/adapter, or a separately justified consumer contract).
- [ ] Adversarial tests.
- [ ] Real network lifecycle.
- [ ] Canonical evidence.

### Projects acceptance

- [ ] Real frontend wallet write.
- [ ] Full lifecycle/failure/retry.
- [ ] Canonical reads.
- [ ] Meaningful user outcome.
- [ ] Browser evidence.
- [ ] Every claimed browser lifecycle action has frontend wrapper/control/test/finality/canonical reload.
- [ ] Primary UI contains only user-relevant data/actions; system/reviewer
      details are contextual or hidden.

## Honest limitations

- Current implementation status: frontend local baseline only; production contract, real SDK/network/browser signatures, public CI, hosted URL and Portal evidence pending. W3C/source/model simulation does not prove final consensus or deployed authenticity.
- Scope: one fixed-price protocol reservation; no legal rights, external delivery/agent performance, third-party gateway, adoption, appeal, slashing, arbitrary amounts or multiple priority tiers. Possible consumers and milestone are plans.

## Kill criteria

- Reject/redesign if any mandatory admission gate ceases to PASS; do not compensate with UI or a renamed contract.
- Stop progression at a failed phase exit; invalid origin/coverage/meaning cannot move GEN/hard rights. No publication with secrets/control files or claims unsupported by the final tree/evidence.
- Final acceptance requires every checklist item with proof, actual Projects checker with zero BLOCKER, real lifecycle/browser/CORS/native-transfer evidence, successful CI/public app and final master-prompt item-by-item reread. Unknown facts remain explicitly pending.
