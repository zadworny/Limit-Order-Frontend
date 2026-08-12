---
title: "Aggregation Router"
description: "The router is the only contract allowed to call adapter swaps, and Settlement is the only contract allowed to call router swaps."
section: "Contract Reference"
order: 20
---

## SeltraAggregationRouter

The router is the only contract allowed to call adapter swaps, and Settlement is the only contract allowed to call router swaps.

### Registry

`addAdapter(uint8 id, address adapter)` is owner-only and write-once. Replacing an adapter requires a new ID, which preserves event attribution and prevents silent endpoint replacement.

`isRegistered(id)` returns true only when an adapter address exists and the adapter is not paused.

### Execution

```solidity
swap(
    uint8 adapterId,
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 minOut,
    bytes extra
) returns (uint256 amountOut)
```

The router transfers exactly `amountIn` to the adapter, invokes its constrained swap, requires at least `minOut`, and returns output to Settlement.

### Quotes

`quote(adapterId, tokenIn, tokenOut, amountIn, extra)` delegates to the adapter. Some venue quoters are non-view and must be invoked with `eth_call` or an ethers `staticCall` at the client layer.

### Circuit breaker

* Guardian: `pauseAdapter(id)`
* Owner: `unpauseAdapter(id)`

The router never accepts a raw call target, never forwards arbitrary low-level calldata, and never uses `delegatecall`.
