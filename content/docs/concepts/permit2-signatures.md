---
title: "Permit2 Signatures"
description: "Seltra does not define a separate EIP-712 domain. The maker signs Permit2's PermitWitnessTransferFrom typed data, with the Seltra Order struct supplied as…"
section: "Concepts"
order: 5
---

Seltra does not define a separate EIP-712 domain. The maker signs Permit2's `PermitWitnessTransferFrom` typed data, with the Seltra `Order` struct supplied as the witness.

### Domain

| Value               | Source                      |
| ------------------- | --------------------------- |
| `name`              | `Permit2`                   |
| `chainId`           | Active network              |
| `verifyingContract` | Canonical Permit2 address   |
| `spender`           | Deployed `SeltraSettlement` |

The settlement address is part of the signed permit value, while chain ID and Permit2 address live in the EIP-712 domain. This prevents a signature from being reused across chains or settlement deployments.

### Replay protection

Permit2 unordered nonces provide single-use authorization. A successful DEX or P2P fill consumes the nonce during the token pull. Replays and losing fill races revert.

```
wordPos = nonce >> 8
bitPos  = nonce & 0xff
mask    = 1 << bitPos
```

A maker cancels one order by calling Permit2 `invalidateUnorderedNonces(wordPos, mask)`.

<Callout type="danger">

The witness type string is consensus-critical integration data. Copy it from the maintained SDK/source and verify it against test vectors; do not reconstruct it casually.

</Callout>
