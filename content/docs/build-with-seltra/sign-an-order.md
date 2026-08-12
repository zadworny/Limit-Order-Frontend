---
title: "Sign an Order"
description: "The service package exposes the maintained typed-data helpers used by tests and order validation."
section: "Build with Seltra"
order: 12
---

The service package exposes the maintained typed-data helpers used by tests and order validation.

```typescript
import { typedDataForSigning } from "./permit2.js";

const order = {
  maker: maker.address,
  receiver: maker.address,
  makerAsset: BASE_TOKEN,
  takerAsset: QUOTE_TOKEN,
  makingAmount: 1n * 10n ** 18n,
  takingAmount: 40n * 10n ** 6n,
  salt: 1n,
  epoch: await settlement.currentEpoch(maker.address),
  expiry: BigInt(Math.floor(Date.now() / 1000) + 3600),
  allowedSender: "0x0000000000000000000000000000000000000000",
  flags: 0,
};

const permit = {
  permitted: {
    token: order.makerAsset,
    amount: order.makingAmount,
  },
  nonce: 42n,
  deadline: order.expiry,
};

const { domain, types, value } = typedDataForSigning(
  order,
  permit,
  SETTLEMENT,
  43113,
  PERMIT2,
);

const signature = await maker.signTypedData(domain, types, value);
```

Before signing, validate token decimals, balances, Permit2 allowance, current epoch, expiry, and the receiver. The maker grants ERC-20 allowance to Permit2—not to Seltra contracts or keepers.
