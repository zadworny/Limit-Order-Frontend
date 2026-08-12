---
title: "SeltraRouter"
description: "The router chooses and calls an allowlisted venue adapter. It holds no funds and no user authorization, so a bug here cannot drain a maker."
section: "Contract Reference"
order: 26
---

`SeltraRouter` is the only contract allowed to call adapter swaps, and `SeltraSettlement` is the only contract allowed to call router swaps. The router holds **no funds and no user authorization**, which is what keeps a routing bug from reaching a maker's balance.

## Methods

```rust
// Executes the hop sequence and returns the output amount.
fn route(env: Env, route: Route, amount_in: i128, recipient: Address) -> i128;

// Read-only simulation, used by keepers and by the quote API.
fn quote(env: Env, route: Route, amount_in: i128) -> i128;
```

`route` moves exactly `amount_in` into the selected adapter, invokes its constrained swap, and returns the output to settlement. It never accepts a raw call target and never forwards arbitrary caller-supplied invocation data.

## Route validation

Before dispatching, the router requires that:

- every adapter in the route is registered and not paused;
- the route's endpoints match the mandate's `token_in` and `token_out`;
- route depth is within the configured bound, so the whole fill fits inside Soroban's per-transaction resource limits.

The `min_out` assertion does **not** live here. It lives in settlement, after routing, against the value the maker actually signed. A router that returned an inflated number would fail that check.

## Quotes

`quote` delegates to the adapter's own quote function. Some venue quoters are not read-only in the strict sense and must be evaluated through simulation rather than a plain read call; keepers and the quote API do exactly that, so a quote costs RPC work rather than a transaction.

Quotes are advisory. Nothing about a quote binds the fill — the only binding number is the maker's `min_out`.

## Availability controls

| Action | Access | Delay |
|---|---|---|
| Register a new adapter | Admin, through the registry | Timelocked |
| Pause one adapter | Guardian | Immediate |
| Unpause one adapter | Admin | Delayed |

Pausing an adapter removes one venue without stopping the protocol: fills continue to route through the remaining venues, and P2P crossing is unaffected because it uses no venue at all.

See [Adapters & Registry](./dex-adapters.md) for the adapter interface and the registry's timelock.
