---
title: "Security"
description: "Seltra is designed so that whoever executes a mandate cannot rewrite its economics. The layers are independent, and one of them is the platform itself."
section: "Security"
order: 34
---

Seltra is designed so that a keeper, a strategy, or an agent can execute a maker-authorized exchange but cannot rewrite its economics. The authorization entry, the host's nonce and expiry checks, the token allowlist, the timelocked adapter registry, balance-measured accounting, and the pause controls are independent layers - and the first of them is the Soroban platform rather than Seltra's own code.

**No independent audit has been completed on either the Soroban implementation or the EVM implementation.** Nothing on this page should be read as an audit result.

## Security properties

| Area | Protection |
|---|---|
| Signature forgery and replay | Host-verified authorization entry with a single-use nonce; a replay never reaches contract logic |
| Cross-network replay | The entry commits to the network passphrase |
| Order tampering | Every economic field is an argument of the signed invocation |
| Insufficient proceeds | `min_out` asserted after routing, before any payout |
| Overspend | `amount_in` is a ceiling and the unused remainder is refunded in the same invocation |
| Malicious route target | Adapters must be registered; no arbitrary call targets and no caller-supplied invocation data |
| Venue compromise | Per-adapter guardian pause, immediate |
| Protocol incident | Global fill pause; cancellation and expiry remain available |
| Code substitution | No upgrade entrypoint exists in the deployed Wasm |
| Reentrancy | Forbidden by the Soroban host |
| Problematic tokens | Token allowlist, plus output measured from balances rather than return values |
| Custody | Default mode leaves assets in the maker's account until the settling invocation |
| Delegation to bots and agents | Bounded by the mandate; the bound is enforced by the platform |

## What Seltra deliberately does not implement

Writing less is a security property here.

- **No signature scheme.** The host verifies authorization, so there is no Seltra-side cryptography to get wrong, and smart wallets and passkey accounts work without special support.
- **No upgrade entrypoint.** Nobody, including Seltra, can change the code a maker's signature points at.
- **No oracle in the settlement path.** Price comes from the venue quote or the crossing mandate and is checked against a signed floor.
- **No discretionary balance.** Settlement pays out or refunds within the same invocation.
- **No custodial mode by default.** Yield mode is opt-in precisely because it breaks this property.

## Operational assumptions

Keepers are permissionless and compete. They must simulate against current state, enforce quote freshness and rollout caps, and skip mandates they cannot fill - including yield-mode mandates whose vault cannot service redemption.

Makers should use short, intentional expiries and manage signing through trusted wallet software. Because a mandate cannot rest indefinitely, an interface that hides the real expiry is itself a risk.

## Not supported by policy

Fee-on-transfer, rebasing, and callback-bearing tokens should not be allowlisted. Vaults should be allowlisted only after source review, a documented liquidity-constrained fallback, and an exposure cap. Adapters should be added only after source review, live quote testing, and the full governance delay.

## Continue

- [Security Model](./security-model.md) - invariants, threats, and residual risk.
- [Testing and Verification](./testing-and-verification.md) - what is tested, what is measured, and what none of it substitutes for.
