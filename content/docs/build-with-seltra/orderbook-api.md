---
title: "Orderbook API"
description: "The reference service uses JSON with decimal strings for all integer values."
section: "Build with Seltra"
order: 13
---

The reference service uses JSON with decimal strings for all integer values.

| Method    | Route              | Purpose                                         |
| --------- | ------------------ | ----------------------------------------------- |
| `POST`    | `/orders`          | Validate and store a signed order               |
| `GET`     | `/orders`          | List orders; filter by maker, status, or pair   |
| `GET`     | `/orders/:hash`    | Read one order                                  |
| `DELETE`  | `/orders/:hash`    | Soft-hide an order from the book                |
| `GET`     | `/orderbook/:pair` | Aggregated resting asks and bids                |
| `GET`     | `/fills`           | Fill records, optionally filtered by order hash |
| WebSocket | `/stream`          | Order, fill, and cancellation events            |

### Submit payload

```json
{
  "order": {
    "maker": "0x...",
    "receiver": "0x...",
    "makerAsset": "0x...",
    "takerAsset": "0x...",
    "makingAmount": "1000000000000000000",
    "takingAmount": "40000000",
    "salt": "1",
    "epoch": "0",
    "expiry": "1780000000",
    "allowedSender": "0x0000000000000000000000000000000000000000",
    "flags": 0
  },
  "permit": {
    "permitted": {
      "token": "0x...",
      "amount": "1000000000000000000"
    },
    "nonce": "42",
    "deadline": "1780000000"
  },
  "signature": "0x..."
}
```

A successful submission returns the order hash and `resting` status.

<Callout type="warning">

`DELETE /orders/:hash` is an orderbook action only. Binding cancellation requires Permit2 nonce invalidation or an on-chain epoch increment.

</Callout>
