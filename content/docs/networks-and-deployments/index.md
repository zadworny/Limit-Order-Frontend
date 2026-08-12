---
title: "Networks & Deployments"
description: "Which networks Seltra targets on Stellar, what is deployed on each today, and where the authoritative configuration lives."
section: "Networks & Deployments"
order: 30
---

Seltra targets Stellar Testnet first and the Stellar Public Network after an independent audit.

| Environment | Network passphrase | Status |
|---|---|---|
| Stellar Testnet | `Test SDF Network ; September 2015` | **Not yet deployed** - first deployment is the testnet milestone |
| Stellar Public Network | `Public Global Stellar Network ; September 2015` | **Not yet deployed** - gated on audit remediation |

Nothing is live on Stellar yet. This section describes what will be published for each network and what has to be true before it is. The same settlement design does run in production on another chain today; that evidence, including its verified contract addresses, is in [Traction](../traction.md).

## A network is a passphrase, not a chain id

A Soroban authorization entry commits to the network passphrase. A mandate signed for Testnet is meaningless on the Public Network, and pointing a service at the wrong one surfaces as authorization failures rather than as a clear configuration error.

Treat the passphrase, the RPC endpoint, and the contract addresses as **one set** that changes together. See [Configuration Reference](../build-with-seltra/configuration-reference.md).

## What gets published per network

| Item | Where |
|---|---|
| Contract addresses for settlement, router, registry, adapters | [Contract Addresses](./contract-addresses.md) |
| Wasm hash for each deployed contract | [Contract Addresses](./contract-addresses.md) |
| Allowlisted token contracts and pairs | [Contract Addresses](./contract-addresses.md) |
| Guardian, admin, and timelock configuration | [Governance and Access Control](../contract-reference/governance-and-access-control.md) |
| What has actually been exercised on the network | [Testnet Deployment](./testnet-deployment.md) |
| Production readiness and what still blocks it | [Mainnet Status](./mainnet-status.md) |

Generated bindings from the deployed contract - not this documentation - are the authority on a live interface. A contract address plus its Wasm hash is what makes a deployment checkable by someone who does not trust these pages.

## Testnet is not a preview of mainnet safety

Testnet assets have no value, testnet data is periodically reset, and a testnet deployment says nothing about signer policy, key custody, monitoring, or audit status. Never send production assets to a testnet address, and never treat a testnet transaction hash as evidence of production readiness.
