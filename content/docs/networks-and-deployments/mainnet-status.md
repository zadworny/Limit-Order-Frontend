---
title: "Mainnet Status"
description: "Seltra is not deployed on the Stellar Public Network. This page is the single source of truth for that, and for what has to be true before it is."
section: "Networks & Deployments"
order: 33
---

**Seltra is not deployed on the Stellar Public Network.** No Stellar mainnet address exists, no independent audit has been completed, and no production keeper network is running on Stellar.

This page is the single source of truth for Stellar mainnet status. Do not infer deployment state from contract source, from an adapter name, from a testnet transaction, or from any other page in this documentation.

## Where things actually stand

| Item | State |
|---|---|
| Soroban contracts implemented | In progress |
| Stellar Testnet deployment | Not yet |
| Independent security audit | Not started; SCF audit credits are earmarked for it |
| Stellar mainnet deployment | Not yet; gated on audit remediation |
| Production keeper network on Stellar | Not yet |
| Signer policy and key custody for mainnet | Not established |
| Same design, EVM implementation | Live on Avalanche C-Chain mainnet with verified source - see [Traction](../traction.md) |

## What has to be true before mainnet

1. **Independent audit and remediation**, with a public summary mapping each finding to the commit that fixed it.
2. **Immutable settlement and router deployed** with published addresses and Wasm hashes, and the first venue adapter allowlisted behind the timelock.
3. **A distributed signer threshold** with separated key custody, replacing the minimal staging set.
4. **Production operations at steady state**: RPC with failover, keeper network, indexer, monitoring, and a documented incident path.
5. **Rehearsed pause and unpause drills** against a live stack, including the proof that cancellation still works while paused.
6. **Controlled rollout limits** - per-fill and daily notional caps - held in place until real traffic has been observed.
7. **A published TTL and bump process**, so that no piece of protocol state can archive unnoticed.

The yield path adds its own gate: a per-vault exposure cap enforced on-chain, a documented liquidity-constrained fallback, and the vault allowlisted through the same timelock. See [Yield on Resting Capital](../concepts/yield-on-resting-capital.md).

## What existing evidence does and does not carry over

The Avalanche deployment is real evidence that the settlement design works with real capital, and that the team can ship and operate it. It is **not** evidence about the Soroban implementation: different language, different authorization model, different storage semantics, different venues, and a separate audit obligation.

An internal automated review of the EVM contracts returned zero active findings. That is not an independent audit, it does not cover Rust, and it does not transfer to a contract that has not been written yet.

## When this page changes

This page is updated when a deployment happens, not when one is planned. Planned dates live in [Roadmap](../roadmap.md); shipped evidence lives in [Traction](../traction.md).
