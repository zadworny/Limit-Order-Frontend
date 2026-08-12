---
title: "Order Model"
description: "A V1 order is exact-size and all-or-nothing."
section: "Concepts"
order: 4
---

A V1 order is exact-size and all-or-nothing.

| Field           | Type      | Meaning                                             |
| --------------- | --------- | --------------------------------------------------- |
| `maker`         | `address` | Signer and token source                             |
| `receiver`      | `address` | Destination for purchased assets; cannot be zero    |
| `makerAsset`    | `address` | Token the maker sells                               |
| `takerAsset`    | `address` | Token the maker receives                            |
| `makingAmount`  | `uint256` | Exact amount sold                                   |
| `takingAmount`  | `uint256` | Minimum amount accepted                             |
| `salt`          | `uint256` | Off-chain uniqueness and bookkeeping                |
| `epoch`         | `uint256` | Must equal the maker's current on-chain epoch       |
| `expiry`        | `uint40`  | Unix timestamp after which the order cannot fill    |
| `allowedSender` | `address` | Zero for any keeper; otherwise restricts submission |
| `flags`         | `uint8`   | Reserved and required to be zero in V1              |

### Permit consistency

The accompanying Permit2 payload is checked against the order:

* `permitted.token == makerAsset`
* `permitted.amount == makingAmount`
* `permit.deadline == order.expiry`

Both assets must be enabled by the Settlement token allowlist.

<Callout type="warning">

`takingAmount` is expressed in the taker token's smallest unit. Integrations must never use floating-point arithmetic for order construction.

</Callout>
