---
title: "Testnet Quickstart"
description: "Toolchain, build, test, and deploy loop for the Soroban contracts and the off-chain services on Stellar Testnet."
section: "Build with Seltra"
order: 17
---

This is the workflow for running Seltra against Stellar Testnet. The Soroban contracts are under active implementation, so treat the command shapes here as the intended loop rather than as a record of something already published - see [Roadmap](../roadmap.md) for what lands when.

## Prerequisites

| Requirement | Notes |
|---|---|
| Rust toolchain with the `wasm32v1-none` target | Soroban contracts compile to Wasm |
| `stellar-cli` | Build, deploy, invoke, and manage identities and networks |
| Node.js 22 or newer | Orderbook service, keeper, SDK, and frontend |
| A Soroban RPC endpoint for Testnet | Self-hosted or a provider; the keeper needs one it can simulate against |
| A funded Testnet account | Friendbot funds it; the keeper also needs channel accounts |

## Network configuration

| Setting | Testnet value |
|---|---|
| Network passphrase | `Test SDF Network ; September 2015` |
| Horizon | `https://horizon-testnet.stellar.org` |
| Friendbot | `https://friendbot.stellar.org` |

Configure the CLI once:

```bash
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

stellar keys generate deployer --network testnet --fund
```

## Clone, build, test

```bash
git clone --recurse-submodules https://github.com/Seltra-Finance/Limit-Order.git
cd Limit-Order

cd contracts
cargo test                       # contract unit and adversarial suites
stellar contract build           # optimized Wasm for each crate in the workspace

cd ../services
npm ci
npm test
npm run typecheck
```

## Deploy

Deployment and TypeScript client generation go through Scaffold Stellar and `stellar-cli`:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/seltra_settlement.wasm \
  --source deployer \
  --network testnet
```

Deploy the router and at least one venue adapter, then register the adapter through the timelocked registry. Generated bindings - not this documentation - are the authority on the deployed interface:

```bash
stellar contract bindings typescript \
  --contract-id <SETTLEMENT_CONTRACT_ID> \
  --network testnet \
  --output-dir ./packages/bindings
```

## Run the services

Copy the testnet environment template into your secret-managed runtime. Supply the keeper's secret key **only** to the keeper process - see [Configuration Reference](./configuration-reference.md).

```bash
cd services
npm run dev
```

The API listens on port `8080` by default, and the WebSocket stream is available at `/stream`.

## Verify the loop

A working testnet stack should let you do all of the following, in order:

1. Sign a mandate in a wallet and see it appear as resting over the public endpoint.
2. Watch a keeper simulate it, submit a `fill_dex`, and produce a fill event with a public transaction hash.
3. Cross two opposing mandates through `fill_p2p`.
4. Cancel a whole strategy with a single `increment_epoch()`.
5. Pause fills as the guardian and confirm that cancellation still works while paused.

## Cautions

**Never commit a secret key, and never place one in a `NEXT_PUBLIC_*` variable.** Frontend variables are visible to every browser user.

**Testnet assets have no value.** Testnet token contracts are unrelated to mainnet assets even when their symbols match, and testnet data is periodically reset.

**Soroban storage expires.** If a stack sits idle past its TTL window, epoch counters and registry entries archive and the protocol stops behaving correctly until they are restored. Exercise the bump strategy deliberately rather than discovering it after a quiet weekend.
