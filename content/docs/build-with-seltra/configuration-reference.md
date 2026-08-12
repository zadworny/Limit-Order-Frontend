---
title: "Configuration Reference"
description: "Environment variables for the orderbook service, the keeper, and the indexer."
section: "Build with Seltra"
order: 22
---

| Variable | Required | Purpose |
|---|---|---|
| `NETWORK_PASSPHRASE` | Yes | Selects the network. Testnet is `Test SDF Network ; September 2015` |
| `SOROBAN_RPC_URL` | Yes | Soroban RPC endpoint used for simulation and event ingestion |
| `SOROBAN_RPC_FALLBACK_URL` | No | Secondary endpoint used on failure |
| `SETTLEMENT_ID` | Yes | `SeltraSettlement` contract address |
| `ROUTER_ID` | Yes | `SeltraRouter` contract address |
| `REGISTRY_ID` | Yes | Adapter and vault registry contract address |
| `PAIRS` | Yes in practice | JSON pair registry mapping a pair id to its two token contracts |
| `API_PORT` | No | REST and WebSocket port; defaults to `8080` |
| `DATABASE_URL` | No | PostgreSQL connection for the orderbook, fills, and indexed events |
| `REDIS_URL` | No | Quote cache and keeper coordination |
| `KEEPER_SECRET_KEY` | Keeper only | Transaction signer. Never set this on the API or the MCP server |
| `KEEPER_CHANNEL_SECRETS` | Keeper only | Comma-separated channel account secrets for parallel submission |
| `KEEPER_ADAPTER_ID` | No | Venue adapter the watcher and keeper prefer |
| `KEEPER_MIN_PROFIT` | No | Minimum keeper reward, in token base units, below which a fill is skipped |
| `KEEPER_MAX_ORDER_NOTIONAL` | No | Per-fill rollout cap |
| `KEEPER_DAILY_NOTIONAL_CAP` | No | Rolling daily rollout cap |
| `POLL_INTERVAL_MS` | No | Service polling interval |
| `MPP_RECEIVER` | No | Account that receives per-request quote payments |
| `MPP_PRICE_USDC` | No | Per-request price for the metered quote endpoint |

All numeric values are **integer strings in token base units**. A cap set to zero disables that cap.

Example pair registry:

```bash
PAIRS='{"XLM/USDC":{"base":"C...","quote":"C..."}}'
```

## Secret handling

`KEEPER_SECRET_KEY` and `KEEPER_CHANNEL_SECRETS` belong to the keeper process alone. The orderbook API does not need them, the indexer does not need them, and the MCP server must never have them - it has no signing capability by design.

**Never place a secret in a `NEXT_PUBLIC_*` variable.** Those are compiled into the browser bundle and are visible to every user.

## Network selection is a passphrase, not a chain id

An authorization entry commits to the network passphrase. Pointing a service at a different network is therefore not a configuration nuance: mandates signed for one network are not valid on another, and a passphrase mismatch shows up as authorization failures rather than as a clear error. Keep `NETWORK_PASSPHRASE`, `SOROBAN_RPC_URL`, and the contract addresses consistent as one set.
