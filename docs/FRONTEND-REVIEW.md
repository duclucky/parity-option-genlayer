# Frontend baseline and self-review

Local verification date: 2026-10-03. Category: Projects. Phases 3A and 3B are
complete at the typed-adapter boundary. Actual SDK, deployed views, browser RPC,
wallet signing and finality evidence are pending later phases.

## Design and coverage

The project-local ui-ux-pro-max engine was invoked before authored frontend
source. Its first result was an unrelated restaurant profile and was rejected.
The single narrower `B2B procurement professional spacious` query returned
Category B2B Service, Accessible & Ethical style, Trust & Authority pattern,
navy/blue tokens and EB Garamond/Lato fonts. React controlled forms/async-error
guidance and UX focus guidance were verified separately.

All eight routes in the product blueprint exist: home, reservations, creation,
detail, offer, account, help and not-found. Persistent navigation, canonical
summary search/filter, three-step creation, role-specific actions, exact terms,
history, credit retrieval and help are implemented. Production uses an explicitly
unconfigured adapter until integration; it shows an error rather than fixtures
or an invented empty onchain list. Fixtures exist only inside automated tests.

## Command and real output

`npm run check` exited 0 after the final self-review corrections:

```text
typecheck: tsc --noEmit (exit 0)
Test Files 3 passed (3)
Tests 26 passed (26)
vite v8.3.2 building client environment for production...
27 modules transformed.
dist/index.html 0.51 kB
dist/assets/index-DT1OMCRH.css 15.19 kB
dist/assets/index-DQ4G5Tb0.js 297.78 kB
built in 234ms
```

This phase's check is frontend-only. Phase 6 must extend the root check to
contract lint, direct tests, parser/metadata/validator tests and the frontend.
It is not yet the final workspace acceptance check.

Test-first model work observed nine meaningful RED failures before implementing
role/deadline and form rules. A later regression also observed RED when an
uncertain submitted transaction left writes enabled. The correction blocks
duplicates while keeping status refresh usable. Tests cover navigation,
creation/offer journeys, legal state controls, finalized adapter reload,
withdrawal, explicit wallet selection and disconnect.

## Browser observations

The actual local app was opened in the in-app browser at 127.0.0.1:5178.
Entry-to-list navigation showed the explicit unconfigured-state error. The
centered native wallet dialog showed no detected wallet in that browser;
no provider was auto-selected and no wallet signature was produced. Invalid
creation focused a linked error summary while retaining inline errors.

Measured creation viewport / document width:

```text
375x812 -> scrollWidth 360
768x1024 -> scrollWidth 753
1024x768 -> scrollWidth 1009
1440x900 -> scrollWidth 1425
812x375 -> scrollWidth 797
```

Widths account for the browser scrollbar; none exceeds its viewport. Temporary
viewport overrides were reset. The final 375px home check also measured
scrollWidth 360. Local evidence: `evidence/local/frontend-responsive.json` and
`evidence/local/frontend-home.png`.

Self-review preserved the design and corrected keyboard order of the wallet
button, skipped heading levels, field error descriptions and input boundaries.
Visible focus, labels, native dialog escape/focus handling, 44px-plus controls
and reduced-motion rules are present. No key, canonical localStorage state,
simulated gas/balance or fake successful transaction is included.

## Remaining acceptance evidence

Phase 7 now verifies the installed genlayer-js 2.0.0-rc.1 adapter through actual
SDK calls with intercepted offline RPC/provider I/O (not a writeContract mock).
The selected account, zero-value and 1 GEN writes, unchanged fee quote,
finalized-success parsing and canonical finalized reads pass. Proxy projection
rejects signing methods and excludes private VM configuration and rollback text.

`npm run check` (2026-10-03 19:56 local) exits 0: semantic lint recognizes
ParityOptionContract and 18 methods (8 view, 10 write); 91 direct tests pass;
2 offline SDK/proxy tests pass; TypeScript passes; 47 frontend tests pass in
5 files; production Vite build succeeds. No critical test is skipped. The SDK
bundle produces a >500 kB size advisory, not a build error.

CUA browser verification at `http://localhost:5178/` observes
`Studio Dev connection verified.` after actual POST requests through both
`/api/ic-rpc` and `/api/wallet-rpc`. Browser error-log filters report
`corsErrors: 0, fetchErrors: 0`. Missing contract configuration produces an
explicit unavailable-state message, never a fake empty list. Evidence screenshots:
`evidence/local/frontend-rpc-home.png`, `evidence/local/frontend-wallet-missing.png`.
The existing IAB tab failed on numeric 127.0.0.1 while a fresh tab on localhost
works; Windows itself returns HTTP 200 on both host forms.

Only IAB and MCP Apps browsers are currently exposed by the browser inventory.
IAB's real wallet picker observes `No browser wallet detected.`. No browser
signature is claimed. Deployed canonical state, live fee/execution proof,
all real lifecycle signatures and native withdrawals remain PENDING_REAL_EVIDENCE.

## Deployed frontend readback — 2026-10-03

Phase 9 `npm run build` from frontend exits 0 after the public deployed address
is configured in ignored frontend/.env. The built asset contains that exact
address. Browser detail /reservation/demo-match-v1 reads the real protected and
offered scopes, three MATCH dimensions, finalized seven-event history and
REDEEMED state. Screenshot: evidence/local/frontend-deployed-read.png.
A fresh browser session reports corsErrors 0 and fetchErrors 0. The earlier
session retained one failed request during the owned Vite server restart;
that historical error was not silently counted as a clean session.

Phase 10 reviewed static copy and scanned 19 deliverable files with zero
non-English letter flags. Holder-vs-outsider allocation copy was made precise.
After deployment configuration, the missing-config test initially inherited the
real .env and failed. It now explicitly uses an unconfigured real SDK adapter;
no production network behavior was changed to satisfy that test.
`npm run check` at 21:27 local passes: 91 direct tests, 5 Node regressions
(3 SDK/proxy and 2 transfer), 51 frontend tests, TypeScript and production build.
One read-only live integration test also passes separately and generates fees.

Browser-wallet signatures remain PENDING_REAL_EVIDENCE. No provider is injected,
no private key is exposed to the browser, and script signatures remain distinct.

## Production verification — 2026-10-03

Vercel production deployment dpl_5MbNxAZGB4PWiu4A9oX5LmiMVTtC is READY
at https://parity-option-genlayer.vercel.app. Root frontend/, Vite, npm run build,
dist, Node 24 and the actual public address are confirmed by project API reads.
`vercel deploy --dry --format=json` exposes 65 regular allowlisted upload files,
with no env, wallet, vendor runtime or private control files. Shared RPC code
moved into server/ so it is not treated as an extra public function route.

`curl -I` returns HTTP 200; the first 4000 HTML characters contain ParityOption
and div id="root". Both /api/ic-rpc and /api/wallet-rpc health checks return HTTP
200 with verified Studio Dev chain 61997. The production browser deep link reads
REDEEMED, seven canonical history events and three MATCH dimensions; its error
log contains no entries. Screenshot: evidence/production/frontend-canonical-read.png.

The function transpiler emitted type-library lookup diagnostics while the
deployment completed. This is retained as an unresolved builder warning;
successful function probes and canonical reads do not prove the warning's root
cause. Independent TypeScript now includes api/ and server/; npm run check passes
91 direct, 5 Node and 51 frontend tests with the production build. Source visuals
remain unchanged. The enabled browser inventory is still IAB/MCP Apps only,
so actual browser-wallet signing remains pending.
