---
title: "Indexing & Events"
description: "The indexer consumes Settlement and Permit2 events, then updates off-chain order status."
section: "Build with Seltra"
order: 15
---

The indexer consumes Settlement and Permit2 events, then updates off-chain order status.

| Event                                | Indexer action                                                             |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `OrderFilledDEX`                     | Mark one order filled and record adapter, amounts, reward, and transaction |
| `OrderFilledP2P`                     | Mark both order hashes filled                                              |
| `EpochIncremented`                   | Cancel resting orders signed under an older epoch                          |
| Permit2 `UnorderedNonceInvalidation` | Cancel known orders whose nonce bit was invalidated                        |
| `FillsPaused` / `FillsUnpaused`      | Update protocol availability and alert operators                           |

### Event signatures

```solidity
event OrderFilledDEX(
    bytes32 indexed orderHash,
    address indexed maker,
    address indexed keeper,
    uint8 adapterId,
    uint256 makingAmount,
    uint256 amountOut,
    uint256 makerImprovement,
    uint256 keeperReward
);

event OrderFilledP2P(
    bytes32 indexed hashA,
    bytes32 indexed hashB,
    uint256 surplus,
    uint256 makerShareA,
    uint256 makerShareB,
    uint256 keeperReward
);

event EpochIncremented(address indexed maker, uint256 newEpoch);
```

Use confirmation depth, persisted checkpoints, idempotent event keys, and replay-safe ingestion. Recover unknown order payloads from fill transaction calldata when required.
