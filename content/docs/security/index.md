---
title: "Security"
description: "Seltra is designed so a keeper can execute a maker-authorized exchange but cannot rewrite its economics. The signed witness, Permit2 nonce, allowlists,…"
section: "Security"
order: 28
---

Seltra is designed so a keeper can execute a maker-authorized exchange but cannot rewrite its economics. The signed witness, Permit2 nonce, allowlists, route registry, balance accounting, and pause controls form independent layers.

<Callout type="warning">

The repository has extensive unit, fuzz, invariant, and live-fork testing, but no independent audit is represented here as complete. Mainnet deployment remains gated.

</Callout>

### Security properties

| Area                   | Protection                                                    |
| ---------------------- | ------------------------------------------------------------- |
| Signature replay       | Permit2 unordered nonces and chain/contract domain separation |
| Order tampering        | All economic and authorization fields are witness-bound       |
| Insufficient proceeds  | Signed minimum plus exact receiver balance-delta checks        |
| Malicious route target | Fixed adapter registry; no arbitrary calls                    |
| Venue compromise       | Per-adapter guardian circuit breaker                          |
| Protocol incident      | Global fill pause; cancellations remain available             |
| Reentrancy             | Settlement non-reentrancy and checks-effects-interactions     |
| Problematic tokens     | Allowlist policy plus exact-delivery enforcement              |
| Privileged changes     | Ownable2Step handoff to a delayed Timelock                    |

### Operational assumptions

Keepers are permissionless and may compete to fill orders. They must simulate against current state, enforce quote freshness and rollout caps, and avoid submitting fills that are unlikely to clear. Makers should use short, intentional expiries and manage Permit2 approvals and nonces through trusted wallet software.

### Not supported by policy

Fee-on-transfer, rebasing, callback-bearing, and unreviewed tokens should not
be allowlisted. Settlement additionally rejects payouts that do not produce an
exact recipient balance increase. Adapters should be added only after source
review, live liquidity testing, and governance delay.
