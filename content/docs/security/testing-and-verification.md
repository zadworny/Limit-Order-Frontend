---
title: "Testing & Verification"
description: "The Soroban test plan, the measured test profile of the live EVM implementation, and a clear statement of what neither substitutes for."
section: "Security"
order: 36
---

Two different things are described here and they should not be conflated: the **test plan for the Soroban implementation**, which is being built, and the **measured test profile of the live EVM implementation**, which exists today and is evidence about the design and the team rather than about the Rust code.

## Soroban test plan

| Suite | Coverage |
|---|---|
| Contract unit tests | Mandate verification, epoch invalidation, expiry, `min_out` enforcement, refund of unused input, surplus split, keeper reward, guardian pause |
| Invariant test | Cancellation and expiry cannot be paused, under every pause state |
| Adversarial tests | Replayed mandates, stale epoch, expired mandate, fills that miss `min_out` by one unit, two keepers racing the same mandate, a malicious adapter reporting more than it delivered, a paused adapter still reachable through the router |
| Archival tests | State exercised past the default TTL window, proving the bump strategy holds |
| Integration tests | Full flows on a local network and then testnet: P2P crossing, routed DEX fill, a grid cancelled by one epoch increment, a yield-mode mandate that deposits, accrues, and settles |
| Yield fallback tests | Redemption deliberately constrained; the keeper must skip rather than revert, and the mandate must report as waiting on liquidity |
| Resource tests | The P2P path's four token movements plus the surplus split measured against per-transaction limits rather than assumed to fit |

CI runs the Rust suite and the TypeScript suite on every push, with output public in the repository.

The two suites worth insisting on are the archival tests and the yield fallback tests. Both cover silent failures - state that disappears after a quiet period, and capital that cannot be withdrawn when it is needed - which do not show up in ordinary happy-path testing.

## Measured profile of the live EVM implementation

This is the profile recorded for the Avalanche implementation of the same design. It is real and reproducible, and it is about Solidity, not about the Soroban contracts.

| Gate | Result |
|---|---|
| Contract suite | 83 tests passing |
| Service suite | 40 tests passing |
| CI-depth fuzzing | 10,000 cases per fuzz property |
| Stateful invariants | 256 runs × 32,768 calls per invariant |
| Mainnet fork coverage | Quote, roundtrip, full fill, and no-liquidity cases across three venues |
| Coverage | 97.03% lines, 95.16% statements |
| Static analysis | Lint clean at high and medium severity; internal review findings remediated |
| Acceptance | DEX fill, P2P fill, cancel, replay rejection, global pause, and adapter pause all exercised on a public network |
| Source verification | Verified for every deployed contract |

## What none of this substitutes for

Passing tests, fork execution, coverage percentages, static analysis, and source verification are not an independent security audit. Neither is an internal automated review that returned zero active findings.

**No independent audit has been completed on either implementation.** For Soroban, audit and remediation are a precondition of mainnet - see [Mainnet Status](../networks-and-deployments/mainnet-status.md), and [Traction](../traction.md) for what is inspectable today.
