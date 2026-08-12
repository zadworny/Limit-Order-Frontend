---
title: "Security Model"
description: "Seltra assumes makers, keepers, venues, RPC providers, and governance actors can fail in different ways. The contracts minimize shared trust by binding…"
section: "Security"
order: 29
---

Seltra assumes makers, keepers, venues, RPC providers, and governance actors can fail in different ways. The contracts minimize shared trust by binding order economics to a maker signature and independently checking execution results.

### Core invariants

1. A maker receives at least the signed `takingAmount`.
2. A Permit2 nonce cannot fill twice.
3. Expired, invalidated, or stale-epoch orders cannot fill.
4. Settlement and Router retain no intended token residue after a successful fill.
5. Pausing blocks fill paths but not maker cancellation.
6. DEX execution can reach only registered adapter code.
7. P2P execution requires opposite assets, exact base size, and crossed prices.

### Threats and mitigations

| Threat                      | Primary mitigation                                                          |
| --------------------------- | --------------------------------------------------------------------------- |
| Signature replay            | Permit2 nonce plus EIP-712 domain separation                                |
| Witness mismatch            | Pinned type string and cross-language fixtures                              |
| Keeper front-running        | First valid nonce consumption wins; maker terms remain fixed                |
| Sandwiching the DEX leg     | Signed minimum, simulation, short route deadline, balance-delta enforcement |
| Malicious adapter target    | Write-once registry and no arbitrary calls                                  |
| Reentrancy                  | Non-reentrant Settlement entry points                                       |
| Problematic ERC-20 behavior | Governance allowlist plus exact recipient balance-delta enforcement         |
| Compromised venue           | Adapter-specific guardian pause                                             |
| Compromised guardian        | Guardian can pause but cannot unpause or change policy                      |
| Compromised former owner    | Ownable2Step handoff and delayed governance                                 |

### Residual risk

Economic loss is still possible from user-selected limits, compromised keys, malicious frontends, stale RPC state, governance compromise, or unforeseen dependencies. Integrators should display exact signed terms and maintain independent monitoring.
