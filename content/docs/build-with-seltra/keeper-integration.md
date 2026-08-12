---
title: "Keeper Integration"
description: "Keepers are permissionless submitters. The loop is quote, check profit, simulate against Soroban RPC, submit through a channel account, reconcile."
section: "Build with Seltra"
order: 20
---

Keepers are permissionless off-chain processes. Anyone can run one, nobody is registered, and a keeper earns only when it wins a fill.

```mermaid
flowchart LR
    Orders[Resting mandates] --> Quote[Quote allowlisted venues]
    Quote --> Profit[Check keeper share and caps]
    Profit --> Sim[Simulate against Soroban RPC]
    Sim --> Submit[Submit via channel account]
    Submit --> Rec[Reconcile result and events]
```

## DEX fills

1. Confirm the adapter is registered and not paused.
2. Quote `amount_in` on each candidate venue through `SeltraRouter.quote`.
3. Require the quoted output to be at least `min_out`.
4. Compute the keeper share of the resulting surplus and enforce a minimum profit threshold.
5. If the mandate is in yield mode, call `available_liquidity` on its vault and **skip** the mandate if redemption cannot be serviced.
6. Simulate `fill_dex(order, route, keeper)` against current state.
7. Submit only if simulation succeeds.

## P2P fills

Match mandates with opposite assets whose prices cross, then simulate the complete `fill_p2p(order_a, order_b, keeper)` call before submission. Both authorization entries must be reconstructed exactly as their makers signed them; a mismatch is rejected by the host and caught in simulation.

## Soroban-specific operating notes

| Concern | What to do |
|---|---|
| **Sequence numbers** | A Stellar account submits one transaction per sequence number, so a single keeper account serialises submissions. Use **channel accounts** to keep several fills in flight. |
| **Simulation is mandatory** | Simulate every candidate. A fill that would miss `min_out`, exceed resource limits, or fail on a consumed nonce should never be submitted. |
| **Resource limits** | CPU, memory, and ledger read/write are capped per transaction. A route plus an optional vault redemption plus settlement must fit in one invocation; bound route depth rather than searching unbounded paths. |
| **Nonce races are normal** | Two keepers racing the same mandate is expected. The loser fails on the consumed nonce, having spent a simulation and a fee. Treat it as an ordinary outcome, not an error spike. |
| **Authorization trees** | Rebuild the invocation tree exactly as signed. A mismatch is a keeper operating cost, not a maker risk. |
| **Event retention** | Soroban RPC keeps events for a limited window. If your keeper also feeds an indexer, ingestion must keep up or history is lost. |

## Production safeguards

- Keep one in-flight submission per mandate or matched pair.
- Enforce a per-fill and a daily notional cap while rolling out.
- Bound quote age and the deviation between the quoted and simulated output.
- Alert on failure-rate spikes, pause events, and streaks of fills clearing at exactly `min_out`.
- Run isolated, funded keeper accounts with explicit RPC failover. A keeper key can lose keeper funds; it can never touch a maker's mandate beyond what was signed.

## What a keeper cannot do

A keeper picks the timing and the allowlisted route. It cannot change the asset pair, the input ceiling, the minimum output, the epoch, the expiry, or the surplus split, because all of those are arguments of the invocation the maker authorized. A hostile keeper's worst outcome for a maker is that the mandate does not get filled.
