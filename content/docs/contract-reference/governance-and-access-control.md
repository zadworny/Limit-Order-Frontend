---
title: "Governance & Access Control"
description: "The intended topology separates fast emergency response from delayed recovery and policy changes."
section: "Contract Reference"
order: 23
---

The intended topology separates fast emergency response from delayed recovery and policy changes.

```mermaid
flowchart LR
    Safe[Safe] -->|proposer / executor / canceller| Timelock[48h Timelock]
    Safe -->|guardian| Settlement
    Safe -->|guardian| Router
    Timelock -->|owner| Settlement
    Timelock -->|owner| Router
    Keepers[Permissionless keepers] --> Settlement
    Makers -->|cancel| Permit2
    Makers -->|increment epoch| Settlement
```

| Capability                | Principal             |    Delay |
| ------------------------- | --------------------- | -------: |
| Fill valid orders         | Any keeper            |     None |
| Cancel one order          | Maker through Permit2 |     None |
| Cancel all maker orders   | Maker                 |     None |
| Pause all fills           | Settlement guardian   |     None |
| Pause one adapter         | Router guardian       |     None |
| Unpause                   | Owner/Timelock        | 48 hours |
| Change token policy       | Owner/Timelock        | 48 hours |
| Change surplus parameters | Owner/Timelock        | 48 hours |
| Register adapter          | Owner/Timelock        | 48 hours |
| Rotate guardians          | Owner/Timelock        | 48 hours |

Fuji uses a 1-of-1 Safe to exercise this topology. Mainnet requires a separately reviewed distributed signer threshold and operating policy.
