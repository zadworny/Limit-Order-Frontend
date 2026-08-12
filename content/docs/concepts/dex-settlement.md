---
title: "DEX Settlement"
description: "The DEX path fills one maker order through a registered adapter."
section: "Concepts"
order: 6
---

The DEX path fills one maker order through a registered adapter.

```mermaid
sequenceDiagram
    participant K as Keeper
    participant S as Settlement
    participant P as Permit2
    participant R as Router
    participant A as Adapter
    K->>S: fillOrderDEX(order, permit, sig, route)
    S->>P: verify witness and pull makerAsset
    S->>R: swap(adapterId, assets, amounts, extra)
    R->>A: exact registered venue call
    A-->>R: realized takerAsset
    R-->>S: takerAsset
    S->>S: verify output and exact recipient delivery
    S-->>K: keeper reward
```

The keeper chooses only `adapterId` and venue-specific `extra`. Token addresses, input size, minimum output, and proceeds receiver come from the signed order.

Settlement measures the taker token balance before and after routing. It does
not trust a venue's return value for maker accounting. Each payout must also
increase its recipient's balance by the exact nominal amount; unsupported
transfer behavior reverts the fill atomically.

### Preconditions

* Fills are globally unpaused.
* Both tokens are allowlisted.
* The order is unexpired and on the current maker epoch.
* The Permit2 payload matches the order.
* The adapter exists and is not paused.
* Realized output is at least `takingAmount`.

The entire flow is atomic. Any failed check reverts the token pull, swap, nonce consumption, and transfers.
