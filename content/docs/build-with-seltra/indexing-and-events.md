---
title: "Indexing & Events"
description: "The indexer consumes Soroban contract events and reconciles off-chain mandate status against authoritative on-chain state."
section: "Build with Seltra"
order: 21
---

The indexer ingests `SeltraSettlement` and registry events from Soroban RPC and updates off-chain mandate status. Orderbook state is a convenience; contract events are the record.

| Event | Indexer action |
|---|---|
| `fill_dex` | Mark the mandate filled; record venue, amounts, surplus split, keeper reward, refund, and transaction hash |
| `fill_p2p` | Mark both order hashes filled; record the crossed spread distribution |
| `epoch_incremented` | Cancel every resting mandate signed under an older epoch for that maker |
| `fills_paused` / `fills_unpaused` | Update protocol availability and alert operators |
| `adapter_activated` / `adapter_paused` | Update venue availability used by quoting |
| `yield_deposit` / `yield_redeem` | Track capital routed into and out of allowlisted vaults |

Expiry produces no event. Mandates that pass their expiry ledger without filling are aged out by the indexer against ledger sequence, not discovered from the chain.

## Ingestion requirements

- **Persist a checkpoint** by ledger sequence and resume from it, so a restart cannot silently skip a window.
- **Use idempotent event keys.** Reprocessing the same event must not double-count a fill.
- **Keep up with retention.** Soroban RPC retains events for a limited window; an indexer that falls behind loses history permanently and must be backfilled from an archive or a data provider.
- **Reconcile, do not infer.** Confirm status against `is_filled(order_hash)` and `current_epoch(maker)` rather than assuming an absent event means an absent fill.

## Storage and archival

Fill records live in temporary storage with a TTL set past the mandate's expiry: long enough to prevent replay, short enough that state growth tracks active makers rather than lifetime order count. An indexer must therefore treat the absence of an on-chain fill record as *expired or never filled*, and rely on its own database - not on chain state - for historical reporting.

Persistent state that the protocol depends on, such as epoch counters and the adapter registry, is bumped on write and by a maintenance job. An indexer is a good place to monitor how close those entries are to archival and to alert before they lapse.

## Reporting

Anything user-facing that claims a fill, a volume, or a price improvement should be traceable to a transaction hash. Keeping the hash on every fill record is what makes a public stats page checkable rather than asserted.
