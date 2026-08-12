---
title: "Events & Errors"
description: "Contract events an indexer consumes, and the error categories an integration should expect — including the failures that are normal rather than exceptional."
section: "Contract Reference"
order: 28
---

## Settlement events

| Event | Purpose |
|---|---|
| `fill_dex` | Venue attribution, input used, refund, output, surplus split, keeper reward |
| `fill_p2p` | Both order hashes and the crossed-spread distribution |
| `epoch_incremented` | Maker cancel-all state |
| `fills_paused` / `fills_unpaused` | Global availability |
| `guardian_set` | Guardian rotation |
| `surplus_params_set` | Incentive parameters |
| `token_allowed` | Token policy changes |

## Registry and adapter events

| Event | Purpose |
|---|---|
| `adapter_proposed` | Timelock started for a new venue |
| `adapter_activated` | Venue became routable |
| `adapter_paused` / `adapter_unpaused` | Venue availability |
| `vault_allowed` / `vault_paused` | Yield vault availability |

## Yield events

| Event | Purpose |
|---|---|
| `yield_deposit` | Resting capital routed into an allowlisted vault |
| `yield_redeem` | Shares redeemed inside a settling invocation |

Expiry emits nothing. A mandate that passes its expiry ledger without filling simply stops being fillable, and an indexer ages it out against ledger sequence.

## Error categories

| Category | Examples |
|---|---|
| Mandate validity | Stale epoch, expired mandate, zero amount, unsupported token |
| Economics | Output below `min_out`, mandates that do not cross, asset mismatch on a P2P pair |
| Policy | Token not allowlisted, adapter unknown, adapter paused, fills paused |
| Authorization | Caller is not the guardian, caller is not settlement, caller is not the router |
| Route validation | Endpoints do not match the mandate, route too deep, adapter not active |
| Yield | Vault not allowlisted, exposure cap exceeded, redemption below `min_assets` |

## Failures that are normal

Some failures are expected operating outcomes and should not be alerted on as defects:

| Failure | Why it is normal |
|---|---|
| Authorization entry already consumed | Two keepers raced the same mandate; the loser fails on the nonce |
| Host rejects an authorization entry | The keeper rebuilt an invocation tree that does not match what was signed. Caught in simulation |
| Output below `min_out` at submission time | Price moved between simulation and inclusion. The maker is protected, which is the point |
| Mandate skipped for vault liquidity | Yield-mode capital cannot currently be redeemed; the keeper skips rather than reverting |

An integration should decode contract errors where possible, treat the four rows above as ordinary, and reserve alerting for revert-rate spikes, pause events, and streaks of fills clearing at exactly `min_out`.
