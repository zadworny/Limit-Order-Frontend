---
title: "Testing & Verification"
description: "The published repository includes contract, service, fork, fuzz, and invariant suites."
section: "Security"
order: 30
---

The published repository includes contract, service, fork, fuzz, and invariant suites.

### Recorded test profile

| Gate                   | Result                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| Foundry default suite  | 83 tests passing; fork suites explicitly skipped unless enabled     |
| TypeScript services    | 40 tests passing                                                    |
| CI-depth fuzzing       | 10,000 cases per fuzz property                                      |
| Stateful invariants    | 256 runs × 32,768 calls per invariant                               |
| LFJ mainnet fork       | Quote, roundtrip, and full fill coverage                            |
| Blackhole mainnet fork | Quote, impact, roundtrip, and full fill coverage                    |
| Pharaoh mainnet fork   | Quote, roundtrip, full fill, and no-liquidity coverage              |
| Coverage               | 97.03% lines and 95.16% statements overall                          |
| Runtime size           | Settlement 11,814 B; Router 4,336 B—both below EIP-170               |
| Static analysis        | Forge high/medium lint clean; Almanax findings remediated            |
| Fuji acceptance        | DEX, P2P, cancel, replay, global pause, and adapter pause exercised |
| Source verification    | Fuji authored contracts and Timelock matched through Sourcify       |

### Reproduce locally

```bash
cd contracts
forge test
FOUNDRY_PROFILE=ci forge test

RUN_MAINNET_FORKS=1 AVAX_RPC_URL=https://api.avax.network/ext/bc/C/rpc forge test --match-path 'test/fork/*.t.sol'

cd ../services
npm ci
npm test
npm run typecheck
npm run build
```

<Callout type="warning">

Passing tests, fork execution, coverage, static analysis, and source verification do not constitute an independent security audit.

</Callout>
