---
title: "Roadmap"
description: "Three tranches to mainnet on Stellar, with the acceptance criteria that decide whether each one is finished."
section: "Docs"
order: 3
---

Seltra's Soroban delivery is organised into three tranches, each ending in a checkpoint that is either publicly demonstrable or not finished. Dates are targets, not claims about the past — what has actually shipped is in [Traction](./traction.md).

| Tranche | Target | Scope |
|---|---|---|
| 1 · MVP | 15 October 2026 | Settlement contract, router and first adapter, mandate signing flow |
| 2 · Testnet | 30 November 2026 | Full testnet deployment, strategy engine, agent interface, frontend |
| 3 · Mainnet | 15 January 2027 | Audit remediation, mainnet launch, yield routing, second venue |

Total request: **$124,000** across the three tranches. Audit cost is not included in that figure; SCF audit credits are earmarked for it.

## Tranche 1 — Core settlement on Soroban

*As a Stellar trader, I want to sign a limit order once and have it fill later at my price or better, without watching the chart and without giving anyone custody.*

- `SeltraSettlement`, `SeltraRouter`, and the adapter interface implemented in Rust against the Soroban SDK.
- Mandate verification through native Soroban authorization: signature, nonce, and expiry checked by the host before Seltra logic runs.
- Both settlement paths implemented — DEX fill through a venue adapter, and P2P crossing between two mandates.
- `min_out` enforced on every path; surplus split between maker and keeper.
- Epoch-based cancel-all implemented and covered by tests.
- **No upgrade entrypoint present in the deployed Wasm.**
- One venue adapter routing a real fill on testnet, with a public transaction hash.
- Mandate signing wired into the orderbook API: an order signed in a wallet appears as resting and is retrievable over the public endpoint.
- Rust test suite passing in CI, with output public in the repository.

## Tranche 2 — Strategies, agents, and public testnet

*As a trader or an agent acting for one, I want a standing strategy I can cancel in one action, without a custodial bot holding my funds.*

- Full testnet deployment through Scaffold Stellar, both fill paths live.
- Guardian pause operational, with a documented test proving **cancellation still works while fills are paused**.
- Storage TTL and bump strategy implemented for epoch counters and fill records, with a test showing state surviving past the default TTL window.
- Keeper running unattended against testnet using channel accounts.
- Strategy engine compiling grid and DCA configurations into a batch of mandates sharing one epoch, signed in one wallet interaction.
- Cancelling an entire strategy demonstrated as a single epoch increment.
- Seltra MCP server exposing quote, place, and cancel, **with no signing capability**.
- TypeScript SDK published covering the same operations.
- Per-request metering live on the quote endpoint, charged in USDC.
- An AI assistant connecting to the MCP server and placing an order against testnet inside a user-signed mandate.
- A public testnet URL where an outside user connects a wallet, signs, sees mandates resting, and cancels.

## Tranche 3 — Mainnet, yield on resting capital, second venue

*As a maker, I want the capital behind my open order to earn while it waits, on a protocol with an audit behind it.*

- External audit findings resolved, with a public remediation summary mapping each finding to the commit that fixed it.
- Immutable settlement and router deployed to Stellar mainnet, source verified, addresses and Wasm hashes published.
- First venue adapter allowlisted behind the timelock; production keeper network live; real fills through both paths.
- Opt-in yield adapter routing resting capital into an allowlisted vault, redeeming inside the same invocation that settles the fill.
- Per-vault exposure cap enforced on-chain.
- Liquidity check in keeper simulation, with a documented test showing the fallback behaving as specified when redemption is constrained.
- A second venue adapter live on mainnet with a routed fill.
- Published architecture documentation, API reference, keeper guide, and agent integration guide — sufficient for an outside team to run its own keeper and connect its own agent.

## How to check a tranche is actually done

Each tranche is written so that its claims are falsifiable by someone outside the team:

| Claim | Check |
|---|---|
| A contract is deployed | Address plus Wasm hash, and the commit it was built from |
| A fill happened | A public transaction hash on the stated network |
| A strategy was cancelled as one | One `increment_epoch` transaction invalidating N mandates |
| Pause does not trap makers | A cancellation transaction landing while fills are paused |
| State survives archival | A test exercising the bump strategy past the default TTL window |
| An agent placed an order | The order's mandate signed by a user key, not by the server |
| An audit is complete | A published report and a remediation summary per finding |

## Not on the roadmap

Some things are deliberately absent, and their absence is a design position rather than an omission:

- **No upgrade mechanism.** Every fix after launch is a new deployment and a migration.
- **No custody by default.** Yield mode is opt-in, capped, and allowlisted; it does not become the default later.
- **No oracle in the settlement path.** Price comes from the venue quote or the crossing mandate.
- **No signing in the agent interface.** The MCP server never gains a key.
