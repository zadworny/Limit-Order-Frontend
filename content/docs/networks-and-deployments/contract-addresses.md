---
title: "Contract Addresses"
description: "Published contract addresses per Stellar network. Nothing is deployed on Stellar yet; this page is the place it will be published and the shape it will take."
section: "Networks & Deployments"
order: 32
---

**No Seltra contracts are deployed on Stellar Testnet or on the Stellar Public Network yet.** This page is where addresses are published, and it is deliberately empty rather than filled with placeholders that could be mistaken for real ones.

Do not send funds to any address presented as a Seltra Stellar deployment until it appears here and matches the on-chain Wasm hash.

## Stellar Testnet

Network passphrase: `Test SDF Network ; September 2015`

| Contract | Address | Wasm hash |
|---|---|---|
| `SeltraSettlement` | Not deployed | - |
| `SeltraRouter` | Not deployed | - |
| Adapter registry | Not deployed | - |
| First venue adapter | Not deployed | - |

## Stellar Public Network

Network passphrase: `Public Global Stellar Network ; September 2015`

| Contract | Address | Wasm hash |
|---|---|---|
| `SeltraSettlement` | Not deployed | - |
| `SeltraRouter` | Not deployed | - |
| Adapter registry | Not deployed | - |
| Venue adapters | Not deployed | - |
| Yield adapter | Not deployed | - |

Mainnet deployment is gated on audit remediation - see [Mainnet Status](./mainnet-status.md).

## What will be published for each entry

An address on its own is not verifiable. Each row will carry:

| Field | Why it is needed |
|---|---|
| Contract address | Identifies the deployment |
| Wasm hash | Lets anyone confirm the deployed code matches the reviewed source |
| Deployment ledger and transaction hash | Establishes when it appeared, checkable on a block explorer |
| Commit of the source it was built from | Ties the deployment to reviewable code |

Contract addresses and network configuration are also published in the repository so that a service configuration and this page can be diffed against each other.

## Allowlisted assets

Every asset moves through its SEP-41 token contract, including classic Stellar assets through their Stellar Asset Contract. The allowlisted token contracts and the pair registry for each network will be published here alongside the contracts, because a pair that is not allowlisted is not tradeable no matter what an interface shows.

## The existing production deployment

The same settlement design runs today on Avalanche C-Chain with verified source. Those addresses are on a different chain, in a different address format, and are **not** Stellar deployments - they are listed as delivery evidence in [Traction](../traction.md), and nowhere else, so that no reader can confuse them with a Stellar address.
