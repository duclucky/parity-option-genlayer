# ParityOption

A reusable first-choice reservation primitive and its wallet-enabled product.

## Live App

[Open ParityOption](https://parity-option-genlayer.vercel.app).
[Read the finalized demonstration](https://parity-option-genlayer.vercel.app/reservation/demo-match-v1).

## Deployed Contract

Studio Dev: `0x6bA8F313f2040E7774978aF37f8adAd875a3AF54`.
[Contract Explorer](https://explorer-studio-dev.genlayer.com/address/0x6bA8F313f2040E7774978aF37f8adAd875a3AF54).
[Public source](https://github.com/duclucky/parity-option-genlayer).

## Problem and architecture

Providers create an exact scope and name a holder. The holder ratifies the terms.
An outside buyer commits 1 GEN and the provider endorses that exact offer.
GenLayer validators compare purpose, deliverables and restrictions by meaning.
A materially matching offer opens the holder's purchase window; a different
offer allocates the reservation to its buyer. Unclear or unavailable evidence
does not allocate money. Expired unresolved offers have a buyer recovery path.

The contract creates a protocol reservation right. It does not prove external
ownership, capability, delivery, legal enforceability or gateway adoption.

The React frontend reads finalized views through a same-origin, read-only IC
RPC proxy. A centered wallet picker discovers EVM providers; the selected
wallet signs transactions over the Studio Dev EVM-compatible path. The single
contract owns ratification, independent semantic consensus, allocation,
redemption and pull-payment accounting. Its validator re-evaluates meaning;
deterministic checks bind origin, exact clause coverage and consequence before
any rights or GEN change. A backend does not choose the verdict or payee.

## Verification status

One Intelligent Contract, 10 write methods and 8 canonical views. Local
semantic lint, 91 direct tests, 3 real-SDK offline adapter/proxy regressions,
2 external-transfer proof regressions, 51 frontend tests, TypeScript and the production build pass. Browser-local
same-origin IC/wallet RPC requests pass with no CORS errors. An unsigned
simulation of the exact contract source succeeds on Studio Dev.

The exact committed source is deployed successfully on Studio Dev:
[contract](https://explorer-studio-dev.genlayer.com/address/0x6bA8F313f2040E7774978aF37f8adAd875a3AF54),
[deployment](https://explorer-studio-dev.genlayer.com/tx/0xa44709cfda951f7d59fee5f511fe7846d03bd8bf4035af1cc954e5940376994e).
The finalized MATCH lifecycle creates and ratifies priority, deposits an outside
buyer's 1 GEN, independently reviews the endorsed offer, accepts the holder's
1 GEN exercise, redeems once, pays the provider and refunds the buyer. Both
withdrawals have exact 1 GEN native decreases and bound finalized external
message proofs. All credits, locked value and native contract balance end at
zero. One read-only live integration test passes and generates measured fees.

The public [CI workflow](https://github.com/duclucky/parity-option-genlayer/actions/workflows/check.yml)
runs the full local check on pushes and pull requests. A successful run must be
matched to the current public commit when reviewing readiness.
Production HTTP checks and browser canonical reads pass on the live app.
Browser-wallet signatures remain pending: the available test browser has no
wallet extension. The successful network lifecycle was signed by the local
deployment script, which is separate evidence from browser signing.
No simulated transaction, fee, balance or finality is presented as real state.

DIFFERENT, UNCLEAR, expired-window allocation, adversarial and recovery branches
have local tests; they are not claimed as completed live demonstrations.
The measured fee profile is evidence, while writes request current SDK quotes.
The production function builder emitted type-library lookup diagnostics but
completed with READY; both RPC functions and canonical browser reads were then
verified. The independent TypeScript check includes API/server sources and passes.
There is no external gateway integration, user adoption or accepted milestone.

## Local development

Use Python 3.12 in `.venv`, install `requirements.txt`, then `npm ci`.
Run `npm run check` for semantic lint, direct tests, the actual SDK adapter,
frontend tests, TypeScript and the production build. Run `npm run dev` to
start the frontend. Configure only the public deployed address with
`VITE_CONTRACT_ADDRESS`; missing configuration is displayed honestly.

```sh
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
npm ci
npm run check
npm run dev
```

On Linux use `.venv/bin/python`. Copy `frontend/.env.example` to
`frontend/.env` for the public address. Never place signing keys in frontend
environment variables. The committed CI installs the pinned source requirements;
`requirements-lock.txt` also records this Windows development environment.

## Studio Dev deployment and lifecycle

1. Configure an ignored project `.env` with authorized provider, holder and buyer
   keys in `STUDIONET_PRIVATE_KEY`, `STUDIONET_INTEGRATOR_PRIVATE_KEY` and
   `STUDIONET_STEWARD_PRIVATE_KEY`. These legacy variable names do not select a
   network: the script verifies Studio Dev chain 61997 before any write. Existing
   finalized records are resumed; never replay an ambiguous transaction.
2. Run `npm run check`, commit the reviewed contract source, then
   `node scripts/studio.mjs inspect` to verify public roles, GEN and recorded state.
3. Run `node scripts/studio.mjs smoke` and `node scripts/studio.mjs deploy`.
   The deployment record binds network, source commit, runner and address.
4. Run `node scripts/studio.mjs metadata-smoke` before sending value. This uses
   unsigned simulation to check payable metadata and unchanged accounting on rejection.
5. Run `node scripts/studio.mjs lifecycle match` for the resumable 1 GEN offer
   and 1 GEN exercise demonstration. It checks successful finalization, canonical
   allocation/redemption, exact native transfer decreases and zero liability.
6. Set `VITE_CONTRACT_ADDRESS` to the verified deployment, build the frontend,
   and inspect finalized reservations. Browser signing requires a real EVM wallet.

For read-only live verification run
`.venv/Scripts/gltest tests/integration --fee-profile frontend/fee-profile.json`.
These operations use the authorized Studio Dev account; no faucet is involved.

## Hosting

Vercel project `parity-option-genlayer` uses root `frontend/`, Vite,
`npm run build`, output `dist`, Node 24 and the public production address.
The upload ignore file excludes secrets and local control/runtime files.
SPA rewrites retain direct reservation URLs; read-only RPC functions use the
same origin. See [hosting proof](docs/evidence/production/hosting.json).

`node scripts/studio.mjs inspect` is read-only. It safely discovers authorized
roles from the project `.env`, then the parent `.env`, and prints public
addresses, GEN balances and transaction status. `smoke` runs an unsigned
exact-source constructor simulation. `deploy` requires successful smoke proof
and committed contract source; it resumes a recorded transaction rather than
replaying it. Every deploy/write uses the current SDK's fee quote unchanged.

The full specification and safety matrices are in [docs/README.md](docs/README.md).
The frontend verification record is in [docs/FRONTEND-REVIEW.md](docs/FRONTEND-REVIEW.md).
Network evidence is isolated under `docs/evidence/studio-dev/`.
