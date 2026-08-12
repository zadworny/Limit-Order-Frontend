---
title: "SeltraSettlement"
description: "SeltraSettlement is the immutable entry point for both fill paths."
section: "Contract Reference"
order: 19
---

`SeltraSettlement` is the immutable entry point for both fill paths.

### User and keeper functions

| Function                                           | Access         | Behavior                                                   |
| -------------------------------------------------- | -------------- | ---------------------------------------------------------- |
| `hashOrder(order)`                                 | Public view    | Returns the bare Order struct hash used as Permit2 witness |
| `fillOrderDEX(order, permit, signature, route)`    | Permissionless | Executes one order through a registered adapter            |
| `fillOrderP2P(a, permitA, sigA, b, permitB, sigB)` | Permissionless | Atomically matches two crossing orders                     |
| `incrementEpoch()`                                 | Any maker      | Invalidates that maker's older-epoch orders                |
| `keeperSurplusBps()`                               | Public view    | Returns `10,000 - makerSurplusBps`                         |

### Emergency and policy functions

| Function                                       | Access   |
| ---------------------------------------------- | -------- |
| `pauseFills()`                                 | Guardian |
| `unpauseFills()`                               | Owner    |
| `setGuardian(address)`                         | Owner    |
| `setSurplusParams(makerBps, feeBps, treasury)` | Owner    |
| `setTokenAllowed(token, allowed)`              | Owner    |

### Key state

* `PERMIT2` and `ROUTER` are immutable.
* `currentEpoch[maker]` powers cancel-all.
* `allowedTokens[token]` gates both sides of every order.
* `makerSurplusBps` defaults to 7,000.
* `protocolFeeBps` is capped at 1,000 bps of the keeper side.
* `fillsPaused` blocks fills but not cancellation.
* Every payout verifies the recipient's exact balance increase.

All fill entry points are protected by non-reentrancy.
