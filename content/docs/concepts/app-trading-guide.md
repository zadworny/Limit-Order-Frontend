---
title: "App Trading Guide"
description: "How the Seltra app maps Limit, Market, Grid, and DCA onto mandates, how expiry and slippage bounds are computed, and what the app shows before you sign."
section: "Concepts"
order: 15
---

This page covers app-level behaviour that sits on top of the [Order Model](./order-model.md). Everything here is interface policy - the contract enforces only what the mandate says.

## Limit price shortcuts are not slippage

These are two different concepts and the app labels them differently on purpose.

- **Limit orders have no slippage.** The limit price you sign becomes `min_out`, which is already the worst price you will accept - the order simply never fills below it. The price shortcuts row (Mid, −1%, +1%) sets that limit relative to the current reference price. It adds no separate bound.
- **Market orders sign a marketable limit with an explicit slippage bound.** Choose a preset (0.1% / 0.5% / 1.0%) or enter a custom percentage with up to two decimal places. The app converts the input to basis points with exact integer arithmetic - never floating-point multiplication - and rejects empty, non-numeric, zero, negative, or ≥100% input instead of silently adjusting it. 5% or higher shows a visible warning and is accepted only on confirmation.

The order summary always shows both the live executable reference price and the exact worst acceptable output that gets signed. A market order carries a short expiry so an unfilled one does not linger.

## Expiry is bounded by the network, not only by policy

Limit, Grid, and DCA orders share one expiry control: pick a preset or enter a custom value in days. Two limits apply, and the app enforces the tighter one:

| Limit | Source |
|---|---|
| The deployment's configured maximum order lifetime | Seltra policy |
| The maximum signature expiration ledger the network allows | Stellar network configuration |

An over-limit value shows an inline error and blocks the review step rather than being silently clamped. The computed expiry - as a date and time, and as a ledger sequence - is shown under the field.

Because a Soroban authorization entry cannot be set to expire arbitrarily far ahead, **there is no good-till-cancelled order**. The app shows the real expiry, and long-dated positions are maintained by re-signing on a rolling basis rather than by pretending an order is open-ended. See [Soroban Authorization](./soroban-authorization.md).

## Assets and balances

Every asset is moved through its SEP-41 token contract, including classic Stellar assets via their Stellar Asset Contract. The app shows the token contract address for each side of the pair in the order summary, so what you sign is checkable against [Contract Addresses](../networks-and-deployments/contract-addresses.md).

**MAX never spends the reserve you need to keep the account usable.** The app subtracts the account's minimum balance reserve and an allowance for the fees of the transactions that follow before offering the rest as spendable.

## Signing

Wallet connection uses Stellar Wallets Kit, with Freighter and xBull as the first-class targets. What you approve in the wallet is one authorization entry for `execute(order)` - not a transfer, not an approval, and not an open-ended allowance. Placing an order costs no fee; the keeper pays the fee for the fill it wins.

For a Grid or a DCA schedule, the app collects one batch of signatures covering every child mandate, and shows how many mandates are in the batch before you sign. See [Strategies](./strategies-grid-and-dca.md).

## Cancelling from the app

| Action | What actually happens | Trustless |
|---|---|---|
| Cancel one order | The app withdraws it from the orderbook | No - the mandate is dead only when the epoch moves or expiry passes |
| Cancel all / cancel strategy | The wallet signs `increment_epoch()` | Yes |
| Let it expire | Nothing; the mandate dies at its expiry ledger | Yes |

The app states this distinction where the buttons are, rather than presenting a single-order cancel as final.

## Yield toggle

A mandate can opt in to earning while it rests. The toggle sits next to the funding leg, names the vault, shows the per-vault exposure cap, and states plainly that the capital leaves your account and takes on that vault's risk. It is off by default. See [Yield on Resting Capital](./yield-on-resting-capital.md).

A mandate whose vault cannot currently service redemption is shown as *waiting on liquidity* - not as filled, and not as cancelled.

## Venue availability per pair

The chart's venue legend is driven entirely by live quotes: the orderbook API polls every configured adapter for every pair and omits a venue when its on-chain quote reverts, because a missing pool or empty liquidity is real venue availability rather than a display choice. No venue is hardcoded into the legend.
