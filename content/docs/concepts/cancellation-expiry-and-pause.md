---
title: "Cancellation, Expiry & Pause"
description: "Seltra has two binding cancellation mechanisms."
section: "Concepts"
order: 9
---

Seltra has two binding cancellation mechanisms.

### Cancel one order

Call Permit2 directly:

```solidity
permit2.invalidateUnorderedNonces(wordPos, mask);
```

The invalidated unordered nonce can never be consumed later.

### Cancel all resting orders

Call `SeltraSettlement.incrementEpoch()`. Every order signed with an earlier epoch becomes invalid. New orders must read and sign the updated `currentEpoch(maker)`.

### Expiry

Settlement rejects an order when the current block timestamp is greater than its signed `expiry`. Order services should remove expired orders proactively, but the on-chain check is authoritative.

### Emergency pause

The guardian can pause all fills immediately. The router guardian can pause one adapter immediately. Unpausing is owner-only and intended to go through delayed governance.

<Callout type="success">

Cancellation remains available while fills are paused. A protocol incident cannot trap a maker in an active order.

</Callout>
