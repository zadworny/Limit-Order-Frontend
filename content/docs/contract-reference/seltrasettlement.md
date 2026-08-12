---
title: "SeltraSettlement"
description: "The single contract in the custody path. Deployed without an upgrade entrypoint."
section: "Contract Reference"
order: 25
---

`SeltraSettlement` is the only contract in the custody path, and the only entry point for both fill paths. It is deployed **without an upgrade entrypoint**, so the code a maker's signature points at cannot be changed by anyone, including Seltra.

## Maker and keeper functions

| Function | Access | Behaviour |
|---|---|---|
| `execute(order)` | Requires maker auth | The invocation the maker authorizes. Checks epoch and expiry, pulls the input ceiling. Called internally by the fill entrypoints, never directly by a keeper |
| `fill_dex(order, route, keeper)` | Permissionless | Calls `execute`, routes the input through `SeltraRouter`, asserts output is at least `min_out`, refunds the unused input, splits surplus, pays the keeper, sends the remainder to the maker |
| `fill_p2p(order_a, order_b, keeper)` | Permissionless | Calls `execute` for both makers, checks the two mandates cross, settles both sides, splits the crossed spread |
| `increment_epoch()` | Requires maker auth | Invalidates every outstanding mandate for that maker in one transaction |
| `current_epoch(maker)` | Read-only | The maker's current epoch, used by the orderbook to reject stale mandates before they reach the chain |
| `is_filled(order_hash)` | Read-only | Fill status for one order hash |

The split between `execute` and the fill entrypoints exists because a Soroban authorization entry commits to exact arguments. The maker signs `execute(order)`, whose only argument is the order; the keeper's route lives in its own call frame. See [Soroban Authorization](../concepts/soroban-authorization.md).

## Emergency and policy functions

| Function | Access |
|---|---|
| `pause_fills()` | Guardian |
| `unpause_fills()` | Admin, intended behind delayed governance |
| `set_guardian(address)` | Admin |
| `set_surplus_params(...)` | Admin |
| `set_token_allowed(token, allowed)` | Admin |

`pause_fills` blocks `fill_dex` and `fill_p2p`. It **deliberately cannot block** `increment_epoch` or natural expiry, so no incident and no compromised guardian can trap a maker in an active mandate.

## Key state

- The router address and the registry address are set at deployment.
- `current_epoch[maker]` powers cancel-all and is held in persistent storage, bumped on write.
- Allowlisted token contracts gate both sides of every mandate.
- Fill records are held in temporary storage keyed by order hash, with a TTL past the mandate's expiry, so a filled mandate cannot be replayed and the entry disappears once it can no longer matter.
- Settlement holds no discretionary balance between invocations. Anything it receives during a fill is paid out or refunded within that same invocation.

## Invariants the contract maintains

1. A maker receives at least `min_out`, or the fill reverts.
2. Input above what the fill required is refunded to the maker in the same invocation.
3. A mandate's nonce cannot be consumed twice - enforced by the host, not by Seltra.
4. A mandate with a stale epoch or a passed expiry cannot fill.
5. Settlement retains no intended token residue after a successful fill.
6. Pausing blocks fills but never cancellation or expiry.
7. Output is measured from balances, not taken from an adapter's return value.

Soroban forbids reentrancy at the host level, so these invariants do not depend on a reentrancy guard.
