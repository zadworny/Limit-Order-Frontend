---
title: "Sign an Order"
description: "Building a mandate and collecting the maker's Soroban authorization entry, without a custom signature scheme."
section: "Build with Seltra"
order: 18
---

Signing a Seltra order means producing one **Soroban authorization entry** for `execute(order)`. There is no Seltra signature format, no domain separator to assemble, and no typed-data structure to get right — the host verifies the entry before Seltra's code runs.

## Build the order

```typescript
const order = {
  maker: makerAddress,                    // G... account, or a contract account
  token_in: BASE_TOKEN,                   // SEP-41 contract address
  token_out: QUOTE_TOKEN,                 // SEP-41 contract address
  amount_in: 100_0000000n,                // ceiling on input, token base units
  min_out: 40_000000n,                    // floor on output, token base units
  epoch: await settlement.current_epoch({ maker: makerAddress }),
  expiry: currentLedger + 8640,           // ledger sequence, not a timestamp
  yield_source: undefined,                // default mode: funds stay in the account
  surplus_bps: 3000,                      // keeper share of surplus
};
```

Every amount is an integer in the token's smallest unit. Read decimals from the token contract; never scale with floating-point arithmetic.

`expiry` is a **ledger sequence**, not a Unix timestamp. Convert from a wall-clock duration using the network's ledger close time and round down, so a displayed expiry is never later than the enforced one.

## Collect the authorization

The maker signs the authorization entry for the `execute(order)` invocation. With Stellar Wallets Kit:

```typescript
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";

// 1. Build the invocation and simulate it to obtain the unsigned auth entry.
const tx = await settlement.execute({ order });

// 2. Have the wallet sign that entry. The signature commits to the network,
//    the exact invocation tree, a single-use nonce, and an expiration ledger.
const { signedAuthEntry } = await kit.signAuthEntry(entryXdr, {
  address: makerAddress,
  networkPassphrase: NETWORK_PASSPHRASE,
});
```

The exact client surface comes from the bindings generated against the deployed contract, not from this page. Generate them with `stellar contract bindings typescript` and treat the generated types as authoritative.

## Submit to the orderbook

```typescript
await fetch(`${API}/orders`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    order: serializeOrder(order),
    auth_entry: signedAuthEntry,          // base64 XDR
  }),
});
```

No transaction is submitted and no fee is paid by the maker. The mandate rests until a keeper fills it, the maker increments their epoch, or it expires.

## Validate before asking for a signature

Check these client-side so the user is not asked to approve something that cannot work:

| Check | Why |
|---|---|
| Both token contracts are allowlisted | The fill reverts otherwise |
| `epoch` equals `current_epoch(maker)` | A stale epoch is dead on arrival |
| `expiry` is in the future and within the network's maximum | An entry cannot be signed to expire arbitrarily far ahead |
| `amount_in` is within the maker's balance | The pull fails otherwise |
| `min_out` is non-zero and consistent with the displayed price | A zero floor is an unbounded-loss order |
| Token decimals were read from the contract | A decimals mistake is a price mistake by a factor of ten |

## Two expiries

Keep the mandate's `expiry` and the authorization entry's signature expiration ledger aligned. A mandate is dead at the earlier of the two, and an interface that shows only one of them will eventually display a dead order as open. See [Soroban Authorization](../concepts/soroban-authorization.md).

## Batch signing for strategies

A grid or a DCA schedule is a set of mandates sharing one epoch, collected in one wallet interaction. Show the user how many mandates are in the batch, and make clear that a single `increment_epoch()` later cancels all of them. See [Strategies](../concepts/strategies-grid-and-dca.md).
