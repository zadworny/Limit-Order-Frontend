---
title: "P2P Settlement"
description: "The P2P path matches two opposite orders without an AMM. V1 requires exact size on the base leg."
section: "Concepts"
order: 7
---

The P2P path matches two opposite orders without an AMM. V1 requires exact size on the base leg.

Let order A sell token X for token Y and order B sell token Y for token X:

* `A.makerAsset == B.takerAsset`
* `A.takerAsset == B.makerAsset`
* `A.makingAmount == B.takingAmount`
* B's offered Y amount must cross A's minimum price

Because the base leg is exact and both order amounts must be nonzero, the
crossing condition reduces without multiplication:

```
B.makingAmount >= A.takingAmount
```

This comparison is equivalent to the rational price check under the exact-size
constraint and cannot overflow for valid `uint256` order amounts.

### Distribution

All X from A is delivered to B's receiver. From B's Y:

1. A receives its signed minimum.
2. The maker share of the crossed spread is divided between A and B.
3. The keeper receives the remaining keeper-side surplus, less any protocol fee.

Both Permit2 nonces are consumed in the same transaction. If either signature, nonce, epoch, balance, allowance, or order check fails, neither order fills.

<Callout type="success">

P2P execution avoids AMM price impact while preserving the same signed minimum and cancellation model as DEX execution.

</Callout>
