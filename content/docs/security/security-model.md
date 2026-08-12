---
title: "Security Model"
description: "Makers, keepers, venues, vaults, RPC providers, and governance can each fail differently. The contracts minimise shared trust by binding economics to a signature the host verifies."
section: "Security"
order: 35
---

Seltra assumes that makers, keepers, venues, vaults, RPC providers, and governance actors can each fail in different ways, and that some of them will. The design minimises shared trust by binding order economics to an authorization the platform verifies, and by checking execution results independently of what any counterparty reports.

## Core invariants

1. A maker receives at least the `min_out` they signed, or the fill reverts.
2. Input above what the fill required is refunded to the maker in the same invocation.
3. An authorization entry cannot be consumed twice.
4. A mandate with a stale epoch or a passed expiry cannot fill.
5. Settlement and router retain no intended token residue after a successful fill.
6. Pausing blocks fill paths but never cancellation or expiry.
7. DEX execution reaches only registered, unpaused adapter code.
8. P2P execution requires opposite assets and genuinely crossed prices.
9. Yield-mode redemption and settlement are atomic.
10. The deployed settlement code cannot be replaced.

## Threats and mitigations

| Threat | Primary mitigation |
|---|---|
| Signature replay | Single-use nonce consumed by the host |
| Cross-network replay | The authorization entry commits to the network passphrase |
| Keeper alters order terms | Terms are arguments of the signed invocation; the route lives outside it |
| Keeper front-running or racing | First valid nonce consumption wins; maker terms are unchanged either way |
| Sandwiching the DEX leg | Signed floor, mandatory simulation, bounded route, balance-measured output |
| Malicious or buggy adapter | Registered adapters only, no arbitrary targets, output measured not reported |
| Compromised venue | Immediate per-adapter guardian pause |
| Compromised guardian | Can pause only; cannot unpause, move funds, change policy, or block cancellation |
| Compromised admin key | Timelock delay on every policy action; no path to changing settlement code |
| Malicious orderbook service | Can withhold or reorder mandates; cannot alter, forge, or fill one |
| Compromised AI agent | Bounded by the mandate - can waste mandates, cannot exceed pair, size, price, or expiry |
| Problematic token behaviour | Allowlist, plus balance-delta accounting on every payout |
| Vault insolvency or oracle manipulation | Opt-in only, exposure-capped, allowlisted, pausable; keeper skips on constrained liquidity |
| State archival | Explicit TTL and bump strategy for epoch counters and registry entries |
| RPC failure or stale state | Simulation immediately before submission; explicit failover |

## Residual risk

Some risk is not designed away and should be stated plainly.

- **User-chosen terms.** A mandate with a badly chosen floor executes exactly as signed. The protocol protects the number, not the judgement behind it.
- **Compromised keys or a malicious frontend.** A user who signs a hostile mandate has authorized it. Interfaces must display exact signed terms, and users should verify token contract addresses.
- **Non-trustless single-order cancellation.** Withdrawing one mandate from the orderbook depends on the service honouring it. Trustless cancellation means incrementing the epoch.
- **Liquidity, not exploit, in yield mode.** Capital in a utilized lending pool can be temporarily unwithdrawable, which makes a mandate unfillable when the maker most wants it filled.
- **Governance and operations.** A distributed signer policy, key custody, monitoring, and incident response are operating commitments, not contract properties, and are not yet in place for Stellar.
- **Unaudited code.** No independent audit has been completed. Fork tests, fuzzing, and internal review reduce risk; they do not substitute for one.

## What an integrator owes their users

Display the exact signed terms - pair, token contract addresses, ceiling, floor, expiry, and surplus split - before requesting a signature. Show both expiries. Never present a soft orderbook delete as a completed cancellation. Surface yield mode's added counterparties at the point of choosing it. Maintain independent monitoring rather than trusting a single API's view of status.
