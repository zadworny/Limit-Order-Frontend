---
title: "Configuration Reference"
description: "Example pair registry:"
section: "Build with Seltra"
order: 16
---

| Variable                    |        Required | Purpose                                   |
| --------------------------- | --------------: | ----------------------------------------- |
| `RPC_URL`                   |              No | Avalanche RPC; defaults to Fuji           |
| `CHAIN_ID`                  |              No | Network chain ID; defaults to `43113`     |
| `PERMIT2`                   |              No | Canonical Permit2 address                 |
| `SETTLEMENT`                |             Yes | SeltraSettlement address                  |
| `ROUTER`                    |             Yes | Aggregation router address                |
| `PAIRS`                     | Yes in practice | JSON pair registry                        |
| `API_PORT`                  |              No | REST/WS port; defaults to `8080`          |
| `KEEPER_PRIVATE_KEY`        |     Keeper only | Transaction signer                        |
| `DATABASE_URL`              |              No | PostgreSQL connection                     |
| `DEX_ADAPTER_ID`            |              No | Adapter selected by the watcher/keeper    |
| `KEEPER_MIN_PROFIT`         |              No | Minimum keeper reward in token base units |
| `KEEPER_MAX_ORDER_NOTIONAL` |              No | Per-order rollout cap                     |
| `KEEPER_DAILY_NOTIONAL_CAP` |              No | UTC-day rollout cap                       |
| `POLL_INTERVAL_MS`          |              No | Service polling interval                  |

Example pair registry:

```bash
PAIRS='{"WAVAX/USDC":{"base":"0x...","quote":"0x..."}}'
```

All numeric values are integer strings in token base units. A zero keeper cap disables that cap.
