---
title: "Strategies: Grid & DCA"
description: "A grid or a DCA schedule is a batch of mandates sharing one epoch. No bot contract, no custodial service, and one action cancels the whole thing."
section: "Concepts"
order: 12
---

A standing strategy on Seltra is not a bot you trust with funds. It is a batch of ordinary mandates that share one epoch counter, signed in one wallet interaction, and cancelled by one epoch increment.

There is no separate strategy contract, no scheduler holding a key, and no custodial service sitting between the maker and settlement. Every child order goes through exactly the same path as a single limit order.

## Lifecycle

```mermaid
flowchart LR
    C[Configure: size, spacing, count] --> S[Sign once: batch covers every child mandate]
    S --> R[Rest: children wait off-chain under one shared epoch]
    R --> F[Fill independently: each level fills on its own, DEX or P2P]
    R --> X[Cancel as one: a single epoch increment kills the strategy]
```

1. **Configure.** Choose a grid - size, spacing, and number of levels around a price - or a DCA schedule of equal-size mandates spread over time.
2. **Compile.** The strategy engine turns the configuration into a set of mandates that all carry the maker's current epoch.
3. **Sign once.** The wallet collects signatures for the whole batch in one interaction rather than one prompt per level.
4. **Rest.** Each child mandate is an independent resting order in the orderbook.
5. **Fill independently.** Levels fill on their own as price reaches them, through whichever settlement path pays more.
6. **Cancel as one.** `increment_epoch()` invalidates every unfilled child at once - one transaction, not N cancellations.

## Why this shape, on this platform

An authorization entry carries a single-use nonce, so one mandate fills at most once. The usual pattern of a single large resting order drawn down over many partial fills is therefore not available. Slicing is not a workaround here - it is the native shape of the protocol, and the strategy engine is the thing that makes slicing ergonomic.

Two consequences follow, and both are handled client-side:

- **Presentation.** The orderbook presents a set of child mandates as one logical order, so a user who signed a ten-level grid sees a grid, not ten unrelated orders.
- **Cancellation.** A partially executed slice set still needs exactly one cancel action, which the epoch mechanism already provides.

## Filling less than the full size

`amount_in` is a ceiling, not an exact spend. A child mandate can fill for less than its signed size, with the unused remainder refunded to the maker in the same invocation. So a mandate is single-shot but not necessarily full-size, and a strategy does not fail because one level's liquidity was thin.

## What a strategy cannot do

Every child mandate is bound by the same rules as any other mandate, so the strategy engine - like a keeper, like an agent - cannot exceed what was signed:

| A strategy cannot | Because |
|---|---|
| Trade a pair the maker did not sign | Both token contracts are arguments of the signed invocation |
| Exceed the total the maker signed for | Each child has its own `amount_in` ceiling, and the set is finite |
| Accept a price below a level's floor | `min_out` is asserted per fill, after routing |
| Keep running after cancellation | Every child carries the epoch that the increment invalidates |
| Act after expiry | Both the contract expiry and the entry's expiration ledger apply per child |

That is what makes it reasonable to let an [AI agent](./agents-and-mcp.md) configure or manage a strategy: the worst case is wasted mandates, not a drained account.
