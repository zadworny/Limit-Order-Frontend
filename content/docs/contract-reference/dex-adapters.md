---
title: "Adapters & Registry"
description: "One small contract per AMM behind a common interface, allowlisted through a timelocked registry and individually pausable. The same registry gates yield vaults."
section: "Contract Reference"
order: 27
---

A venue adapter is one small contract wrapping one AMM behind a common interface. Adding a venue is a governance action with a delay; removing one is immediate.

## Adapter interface

```rust
fn swap(
    env: Env,
    token_in: Address,
    token_out: Address,
    amount_in: i128,
    min_out: i128,
    to: Address,
) -> i128;

fn quote(env: Env, token_in: Address, token_out: Address, amount_in: i128) -> i128;
```

Shared safeguards, enforced by every adapter:

- callable only by `SeltraRouter`;
- exact-amount venue authorization, not an open-ended allowance;
- output measured by balance delta rather than taken from the venue's return value;
- no arbitrary call target and no caller-supplied invocation data.

## Planned venues

| Venue | Role | Status |
|---|---|---|
| Soroswap | First venue adapter, DEX fill path | Target for the first implementation milestone |
| Phoenix | Further venue | Planned, behind the same allowlist and pause pattern |
| Aqua | Second venue on mainnet | Planned |

Every venue is opt-in, timelocked, and revocable. No venue is hardcoded anywhere in the settlement path, and none is assumed available: the quote service polls each configured adapter per pair and omits a venue whose on-chain quote reverts, because a missing pool is real venue availability rather than a display choice.

Seltra routes volume **into** these venues. It is a demand layer, not a competing pool.

## Adapter registry

The registry is the persistent allowlist for venue adapters and for yield vaults.

```rust
fn propose_adapter(env: Env, adapter: Address);   // admin; starts the timelock
fn activate_adapter(env: Env, adapter: Address);  // admin; only after the timelock elapses
fn pause_adapter(env: Env, adapter: Address);     // guardian; immediate
fn is_active(env: Env, adapter: Address) -> bool;
```

The asymmetry is deliberate: **adding capability is slow, removing it is fast.** A guardian that is compromised can only take venues away.

Registry entries live in persistent storage and are bumped on write and by a maintenance job. An archived registry entry would make an otherwise healthy venue unreachable, so its TTL is monitored rather than assumed.

## Yield adapter

Reached only when `order.yield_source` is set. It is gated by the same registry.

```rust
fn deposit(env: Env, vault: Address, maker: Address, token: Address, amount: i128) -> i128;
fn redeem(env: Env, vault: Address, maker: Address, shares: i128, min_assets: i128) -> i128;
fn available_liquidity(env: Env, vault: Address, token: Address) -> i128;
fn exposure_cap(env: Env, vault: Address) -> i128;
```

`redeem` is called inside the settling invocation, so redemption and fill are atomic. `exposure_cap` is enforced on deposit, capping how much protocol-routed capital any single vault can hold. `available_liquidity` exists so a keeper can **skip** a mandate whose capital cannot currently be withdrawn rather than submitting a transaction that reverts.

A default-mode mandate never touches this contract. See [Yield on Resting Capital](../concepts/yield-on-resting-capital.md) for the risk discussion.

## Adding a venue responsibly

A new adapter should clear all of the following before activation, not just the timelock:

1. source review of the adapter and of the venue's calling convention;
2. quote and roundtrip tests against live network state;
3. a full fill through settlement on testnet, and a no-liquidity case;
4. confirmation that the route fits inside per-transaction resource limits; and
5. the governance delay itself, in public.
