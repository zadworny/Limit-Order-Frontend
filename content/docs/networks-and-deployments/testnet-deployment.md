---
title: "Testnet Deployment"
description: "What the Stellar Testnet stack consists of, what has to be demonstrated on it, and what a testnet result does not prove."
section: "Networks & Deployments"
order: 31
---

The Stellar Testnet stack is the first public deployment of Seltra on Soroban. **It is not deployed yet.** This page states what it consists of and what it must demonstrate, so that the claim can be checked when it lands rather than taken on trust.

| Setting | Value |
|---|---|
| Network passphrase | `Test SDF Network ; September 2015` |
| Soroban RPC | `https://soroban-testnet.stellar.org` |
| Horizon | `https://horizon-testnet.stellar.org` |
| Funding | Friendbot |

## Components

- `SeltraSettlement`, deployed without an upgrade entrypoint
- `SeltraRouter`
- The adapter registry, with its timelock configured
- At least one venue adapter for a Soroban AMM
- A guardian account, and a timelocked admin
- The orderbook service, the strategy engine, and an unattended keeper using channel accounts

## What has to be demonstrated

A testnet deployment counts as working when every one of these has a public transaction hash behind it:

1. A mandate signed in a wallet appears as resting and is retrievable over the public endpoint.
2. A keeper fills it through `fill_dex`, routing into a real Soroban AMM.
3. Two crossing mandates settle through `fill_p2p`.
4. A grid compiled by the strategy engine is signed in one wallet interaction and cancelled by a single `increment_epoch()`.
5. The guardian pauses fills, and a cancellation still succeeds **while fills are paused**.
6. State survives past the default TTL window, proving the bump strategy holds.
7. An AI assistant places an order through the MCP server, inside a user-signed mandate, without the server holding a key.

Items 5 and 6 are the ones most likely to be skipped and the ones most worth insisting on. A pause that quietly blocks cancellation, or an epoch counter that archives after a quiet period, are both silent failures that only show up when a user needs them not to.

## What a testnet result does not prove

| Demonstrated on testnet | Still unproven |
|---|---|
| The contracts behave as specified | That they are safe under adversarial economic conditions |
| Both fill paths work | That keeper economics hold at real spreads and real size |
| Guardian pause works | That a production signer policy and key custody exist |
| The stack runs | That it runs unattended, monitored, with an incident path |
| Tests pass | That an independent audit found nothing |

Testnet tokens are open-mint test assets. Their symbols may resemble production assets for interface testing; they are unrelated to any mainnet asset and carry no value.

Progress against these items is tracked in [Traction](../traction.md), and the gate to mainnet is in [Mainnet Status](./mainnet-status.md).
