---
title: "DEX Adapters"
description: "Adapter IDs, route encodings, and execution safeguards."
section: "Contract Reference"
order: 21
---

| ID | Adapter          | Route `extra`                               | Status                    |
| -: | ---------------- | ------------------------------------------- | ------------------------- |
|  0 | MockDEXAdapter   | Empty bytes                                 | Fuji test stack only      |
|  1 | LFJLBAdapter     | Deadline and one direct LB route              | Production implementation |
|  2 | BlackholeAdapter | Deadline and one fully allowlisted route tuple | Reserved; not registered   |
|  3 | PharaohAdapter   | `abi.encode(uint256 deadline, int24 spacing)`  | Production implementation |

### LFJ Liquidity Book

```solidity
abi.encode(
    uint256 deadline,
    uint256[] pairBinSteps,
    uint8[] versions,
    address[] tokenPath
)
```

V1 requires exactly two tokens, one bin step, and one version. Path endpoints
must match the order-derived assets. Intermediate-token routes are rejected.
Quotes use LBQuoter best-path discovery; swaps use the LBRouter.

### Blackhole

The pre-production adapter accepts one direct hop. Authorization binds the
pair, both endpoints, the stable flag, and the concentrated flag into one
route key; the receiver must be the Seltra router. ID 2 remains unregistered
while upstream pool resolution receives independent validation.

### Pharaoh

The adapter supports one concentrated-liquidity hop. The keeper supplies a
short deadline and positive tick spacing; expired deadlines revert and the
supplied value is forwarded unchanged. The official QuoterV2 performs an
internal simulated swap, so clients invoke router quotes through `eth_call`.

### Shared safeguards

Every swap is callable only by the Seltra router. Venue approvals are exact-amount and cleared after execution. Output is measured by balance delta.
