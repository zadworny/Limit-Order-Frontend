---
title: "Orderbook API"
description: "REST and WebSocket surface for submitting, reading, and streaming mandates. JSON with decimal strings for every integer value."
section: "Build with Seltra"
order: 19
---

The reference service uses JSON, with **decimal strings for every integer value** so that `i128` amounts survive a round trip through JavaScript.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/orders` | Validate and store a signed mandate |
| `GET` | `/orders` | List mandates; filter by maker, status, or pair |
| `GET` | `/orders/:hash` | Read one mandate |
| `DELETE` | `/orders/:hash` | Soft-hide a mandate from the book |
| `GET` | `/orderbook/:pair` | Aggregated resting bids and asks |
| `GET` | `/fills` | Fill records, optionally filtered by order hash |
| `GET` | `/quote` | Price a candidate trade against current venue liquidity |
| WebSocket | `/stream` | Mandate, fill, and cancellation events |

## Submit payload

```json
{
  "order": {
    "maker": "G...",
    "token_in": "C...",
    "token_out": "C...",
    "amount_in": "1000000000",
    "min_out": "40000000",
    "epoch": "0",
    "expiry": "58412900",
    "yield_source": null,
    "surplus_bps": 3000
  },
  "auth_entry": "AAAAAQ..."
}
```

`auth_entry` is the base64 XDR of the maker's signed Soroban authorization entry. A successful submission returns the order hash and `resting` status.

## What the service validates

Before accepting a mandate the service re-checks it against chain state rather than trusting the client:

- `epoch` equals `current_epoch(maker)`;
- `expiry` is in the future, and the authorization entry's expiration ledger has not passed;
- both token contracts are allowlisted;
- amounts are positive integers within `i128` range;
- the maker's balance covers `amount_in`.

None of this is a security boundary. The contract and the host re-check everything they depend on; the service checks early so that keepers do not waste simulations and users do not see orders that were never fillable.

## Quote endpoint and metered agent access

`GET /quote` is the endpoint agents call most, and it is the one that costs the operator real RPC work. It is metered with Stellar's Machine Payments Protocol and charged per request in USDC, so machine callers pay for what they consume. Human sessions in the app are unaffected. See [Agents and MCP](../concepts/agents-and-mcp.md).

## Cancellation is not an API action

`DELETE /orders/:hash` hides a mandate from the book. **It is not binding.** The mandate remains valid on-chain until the maker increments their epoch or it expires, and a service that ignored the deletion could still hand it to a keeper.

Interfaces must not present a soft delete as a completed cancellation. See [Cancellation, Expiry and Pause](../concepts/cancellation-expiry-and-pause.md).

## Streaming

`/stream` publishes mandate lifecycle events: accepted, filled, epoch-cancelled, expired, and — for yield-mode mandates — waiting on liquidity. Clients should reconnect with backoff and reconcile against `GET /orders` on reconnect rather than assuming a gapless stream.

Authoritative status comes from contract events, not from this API. See [Indexing and Events](./indexing-and-events.md).
