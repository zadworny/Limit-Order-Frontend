---
title: "Cancellation, Expiry & Pause"
description: "A maker gets out through the epoch counter or through expiry. Neither can be paused, blocked, or reversed by a guardian, a keeper, or Seltra."
section: "Concepts"
order: 11
---

A maker has two ways out of a resting mandate, and neither depends on anyone's cooperation.

## Cancel everything: increment the epoch

```rust
// Requires maker auth. Invalidates every outstanding mandate for that maker.
fn increment_epoch(env: Env);
```

Every mandate carries the epoch it was signed under, and `execute` reverts unless it matches the maker's stored value. One increment therefore invalidates the whole outstanding set in a single transaction — including a forty-level grid, which is why the epoch doubles as the strategy handle.

New mandates must read and sign the updated value, which the orderbook exposes through `current_epoch(maker)`.

## Expiry

A mandate dies at the earlier of two deadlines:

| Deadline | Enforced by |
|---|---|
| `order.expiry`, a ledger sequence in the signed mandate | `SeltraSettlement`, at fill time |
| The authorization entry's signature expiration ledger | The Soroban host, before contract code runs |

Expiry requires no transaction and no fee from the maker. An orderbook service should remove expired mandates proactively, but the on-chain checks are authoritative — a service that keeps serving a dead mandate wastes keeper simulations, it does not create a risk for the maker.

Because the network caps how far ahead a signature expiration ledger can be set, a mandate cannot rest indefinitely. Long-dated orders are re-signed on a rolling basis by the client.

## The granularity tradeoff

The epoch cancels everything, not one thing. Cancelling a single mandate out of forty is done off-chain, by withdrawing it from the orderbook, and that is **not trustless**: a service that ignores the withdrawal can still hand the mandate to a keeper until it expires.

A maker who needs trustless single-mandate cancellation increments the epoch and re-signs the rest. This is a real cost of the design and is stated rather than hidden. It is accepted because per-mandate on-chain cancellation state would be both a storage cost and an archival liability on Soroban, for a case that batch cancellation already covers.

## Emergency pause

```rust
fn pause_fills(env: Env);    // guardian only
fn unpause_fills(env: Env);  // admin, intended to sit behind delayed governance
```

A guardian can stop `fill_dex` and `fill_p2p` immediately, and can pause an individual venue adapter without stopping the rest of the protocol.

**A pause deliberately cannot block `increment_epoch` or natural expiry.** A protocol incident, a compromised guardian, or an unresponsive operator cannot trap a maker in an active mandate. A guardian's power is strictly negative: it can stop fills, it cannot restart them, move funds, change policy, or prevent anyone from cancelling.

| Capability | Guardian | Admin / timelock | Maker |
|---|---|---|---|
| Pause fills | Yes, immediate | — | No |
| Unpause fills | No | Yes, delayed | No |
| Pause one adapter | Yes, immediate | — | No |
| Cancel own mandates | No | No | Yes, immediate |
| Prevent a maker cancelling | No | No | — |
