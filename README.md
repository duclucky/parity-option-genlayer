# ParityOption

A reusable first-choice reservation primitive and its wallet-enabled product.
Providers create an exact scope and name a holder. The holder ratifies the terms.
An outside buyer commits 1 GEN and the provider endorses that exact offer.
GenLayer validators compare purpose, deliverables and restrictions by meaning.
A materially matching offer opens the holder's purchase window; a different
offer allocates the reservation to its buyer. Unclear or unavailable evidence
does not allocate money. Expired unresolved offers have a buyer recovery path.

The contract creates a protocol reservation right. It does not prove external
ownership, capability, delivery, legal enforceability or gateway adoption.

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

Browser-wallet signatures, public CI and production hosting are still pending.
No simulated transaction, fee, balance or finality is presented as real state.

## Local development

Use Python 3.12 in `.venv`, install `requirements.txt`, then `npm ci`.
Run `npm run check` for semantic lint, direct tests, the actual SDK adapter,
frontend tests, TypeScript and the production build. Run `npm run dev` to
start the frontend. Configure only the public deployed address with
`VITE_CONTRACT_ADDRESS`; missing configuration is displayed honestly.

`node scripts/studio.mjs inspect` is read-only. It safely discovers authorized
roles from the project `.env`, then the parent `.env`, and prints public
addresses, GEN balances and transaction status. `smoke` runs an unsigned
exact-source constructor simulation. `deploy` requires successful smoke proof
and committed contract source; it resumes a recorded transaction rather than
replaying it. Every deploy/write uses the current SDK's fee quote unchanged.

The full specification and safety matrices are in [docs/README.md](docs/README.md).
The frontend verification record is in [docs/FRONTEND-REVIEW.md](docs/FRONTEND-REVIEW.md).
Network evidence is isolated under `docs/evidence/studio-dev/`.
