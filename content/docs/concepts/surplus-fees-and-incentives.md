---
title: "Surplus, Fees & Incentives"
description: "Surplus is value realized above the maker's signed minimum. It is split between the maker and the keeper that found the fill, and the split is part of what the maker signs."
section: "Concepts"
order: 10
---

Surplus is value realized above the maker's signed minimum. It exists because a mandate names a floor, not a target: a keeper that finds a better route or a better cross produces output the maker did not demand.

```
surplus       = amount_out - min_out
keeper_share  = floor(surplus * surplus_bps / 10_000)
maker_share   = surplus - keeper_share
```

The maker receives `min_out + maker_share`. The keeper receives `keeper_share` as its reward for discovering and executing the fill.

## The split is signed, not chosen

`surplus_bps` is a field of the mandate, so it is covered by the maker's authorization entry. A keeper cannot widen its own share after the fact, and a service that stores mandates cannot alter the split without invalidating the signature. The default policy is a **70/30 split in the maker's favour**, matching the live EVM implementation, and a client may sign a different split when it has reason to.

## Why the keeper gets anything

Keepers are permissionless and unpaid unless they succeed. Each one spends RPC calls and simulation on candidates it may lose to another keeper, and pays the transaction fee for the fills it wins. A keeper share that is too small means marginal mandates never get filled; a share that is too large takes value from the maker for work the maker could not do anyway. The split is the parameter that decides which retail-size orders are worth filling at all.

Stellar's fee model and five-second finality help here: small fills stay profitable for keepers on Soroban at sizes that would not clear on a chain with higher execution cost.

## Rounding

Integer division rounds down, and the keeper share is the rounded quantity, so any division dust stays with the maker. On P2P fills the crossed spread is divided between the two makers first, with odd-unit dust assigned deterministically, before the keeper reward is calculated. No path can round a maker below `min_out`, because `min_out` is asserted before any surplus arithmetic runs.

## What surplus is not

| Not this | Why |
|---|---|
| A protocol rebate paid by Seltra | Surplus is value the fill itself produced, not a subsidy |
| A guarantee of price improvement | A mandate that fills exactly at `min_out` produces zero surplus, which is a correct outcome |
| Something a keeper can manufacture | Reporting more output than was delivered fails the balance check and reverts the fill |

Reported average surplus per order is a measured operating statistic rather than a protocol promise. Current measured figures for the live EVM deployment are in [Traction](../traction.md).
