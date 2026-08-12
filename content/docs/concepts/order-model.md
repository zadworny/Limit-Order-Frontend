---
title: "Order Model"
description: "A mandate is the signed unit of the protocol: one asset pair, a ceiling on input, a floor on output, an epoch, and an expiry."
section: "Concepts"
order: 6
---

A mandate is the signed unit of the protocol. It authorizes one invocation of `execute(order)` and is consumed by at most one fill.

## Fields

| Field | Type | Meaning |
|---|---|---|
| `maker` | `Address` | The account whose authorization entry authorizes the mandate, and the source of the input asset |
| `token_in` | `Address` | SEP-41 contract address of the asset the maker sells |
| `token_out` | `Address` | SEP-41 contract address of the asset the maker receives |
| `amount_in` | `i128` | Ceiling on the input. The contract pulls this amount and refunds whatever the fill does not use |
| `min_out` | `i128` | Floor the fill must clear. Asserted after routing, before any payout |
| `epoch` | `u32` | Must equal the maker's current on-chain epoch, or the fill reverts |
| `expiry` | `u32` | Ledger sequence after which the mandate is dead |
| `yield_source` | `Option<Address>` | Optional allowlisted vault. `None` means funds stay in the maker's account until settlement |
| `surplus_bps` | `u32` | Share of surplus paid to the keeper that finds the fill |

Every asset Seltra touches moves through the [SEP-41 token interface](https://developers.stellar.org/docs/tokens/token-interface), so any asset with a Soroban token contract is tradeable, including classic Stellar assets through their Stellar Asset Contract.

## What each field protects

`amount_in` and `min_out` together define the price the maker will accept. A fill is legal only if the realized output is at least `min_out`; there is no separate slippage parameter and no oracle in the settlement path. The price comes from the venue quote or from the crossing mandate, and it is checked against the number the maker signed.

`epoch` is the cancel handle. Incrementing it invalidates every outstanding mandate for that maker at once - see [Cancellation, Expiry and Pause](./cancellation-expiry-and-pause.md).

`expiry` is the contract-level deadline. It is checked independently of the authorization entry's own signature expiration ledger, and the effective lifetime of a mandate is the earlier of the two. See [Soroban Authorization](./soroban-authorization.md).

`yield_source` changes the risk profile of the mandate and is opt-in for that reason. See [Yield on Resting Capital](./yield-on-resting-capital.md).

`surplus_bps` is signed, not chosen by the keeper, so a keeper cannot widen its own share after the fact. See [Surplus, Fees and Incentives](./surplus-fees-and-incentives.md).

## Amounts are integers

Every amount is an `i128` in the token's smallest unit, scaled by that token's decimals. Integrations must never use floating-point arithmetic to construct or compare order amounts. Crossing checks, surplus arithmetic, and the refund calculation are all integer operations, and rounding is specified rather than incidental.

## What is deliberately absent

| Not in the mandate | Why |
|---|---|
| A route, a venue, or an adapter id | The keeper picks the route in its own call frame; the maker's terms are unaffected because `min_out` is asserted after routing |
| A counterparty address | Each maker must be able to sign without knowing who will cross them, which is what makes the P2P path work |
| A price feed or oracle reference | Settlement reads no oracle. Price comes from the venue quote or the crossing mandate |
| An upgrade or migration hook | The settlement contract has no upgrade entrypoint |

## Validation before signing

An orderbook service should reject a mandate before it ever reaches the chain if the epoch is stale, the expiry has passed, the token contracts are not both allowlisted, `min_out` is zero, or `amount_in` exceeds the maker's balance. This is a courtesy check for interface quality, not a security boundary - the contract re-checks everything it depends on, and the host re-checks the authorization.
