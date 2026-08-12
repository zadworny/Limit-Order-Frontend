---
title: "Traction"
description: "What is inspectable today, what is measured, and what is only an assertion. Deployment on another chain is evidence about the design, not about the Soroban implementation."
section: "Docs"
order: 2
---

Seltra on Soroban is pre-launch. This page separates three things that are easy to blur together: **inspectable engineering evidence**, **measured production usage of the same design on another chain**, and **assertions about future demand**.

A deployment is not a user, a test suite is not an audit, and evidence from an EVM deployment is not evidence about Rust code that is still being written.

## Inspectable delivery

| Evidence | Current state |
|---|---|
| Soroban contracts | In implementation; not deployed to any Stellar network |
| Stellar Testnet | Not deployed |
| Stellar Public Network | Not deployed |
| Independent audit | Not started; SCF audit credits earmarked for it |
| Public source | [`Seltra-Finance/Limit-Order`](https://github.com/Seltra-Finance/Limit-Order) |
| Published documentation | Architecture, concepts, API reference, keeper guide — this documentation |
| Live application, EVM implementation | [app.seltra.finance](https://app.seltra.finance) |
| Public metrics page | [app.seltra.finance/stats](https://app.seltra.finance/stats) |

## Measured: the same design in production on Avalanche

The two-path settlement model, the epoch cancel primitive, and the surplus split all run in production today on Avalanche C-Chain, filling real orders with real capital. The deployment went live quietly on **3 August 2026**.

| Metric | Reported figure |
|---|---|
| Orders filled | 140 |
| Volume settled | $11,000+ |
| Average additional output above the signed minimum, per filled order | ~5% |
| Venues aggregated | 3 |
| Custody transfers | 0 — funds move only inside a settling transaction |

Read these as what they are. This is a **small, early production sample over a short window**, published with its timeframe attached rather than dressed up. The average-surplus figure is an operating statistic measured across filled orders, not a rate any maker is promised; a fill exactly at the signed minimum produces zero surplus and is a correct outcome.

Every one of these numbers should be traceable to a transaction on a block explorer. If a figure here cannot be linked to on-chain data, it does not belong on this page.

### Verified contracts backing those numbers

Avalanche C-Chain, chain ID `43114`. These are **EVM addresses on a different chain**, listed here as delivery evidence. They are not Stellar deployments, and Seltra has no Stellar addresses yet — see [Contract Addresses](./networks-and-deployments/contract-addresses.md).

| Contract | Address |
|---|---|
| Settlement | [`0xbBdbb1785dB447CB04f7B2E0549b630eA7295d57`](https://snowtrace.io/address/0xbBdbb1785dB447CB04f7B2E0549b630eA7295d57) |
| Aggregation router | [`0x6e97Ec1E64cB059F30De68a87f383a0C8F8670d3`](https://snowtrace.io/address/0x6e97Ec1E64cB059F30De68a87f383a0C8F8670d3) |
| Venue adapter 1 | [`0x5fbbb45aC3BEDe19069decAa8012376064eC8351`](https://snowtrace.io/address/0x5fbbb45aC3BEDe19069decAa8012376064eC8351) |
| Venue adapter 2 | [`0xC4952bD555f979993b7BAB800d933dC2F082836d`](https://snowtrace.io/address/0xC4952bD555f979993b7BAB800d933dC2F082836d) |
| Venue adapter 3 | [`0xf7CeB84F59BF04D65801A479f4C91E217F451AA3`](https://snowtrace.io/address/0xf7CeB84F59BF04D65801A479f4C91E217F451AA3) |
| Timelock, 48h | [`0x2E5F8ba983dbCE1AAF396a8F6E023e9482ce9359`](https://snowtrace.io/address/0x2E5F8ba983dbCE1AAF396a8F6E023e9482ce9359) |

Source is verified for every contract above, and a 48-hour timelock owns them. Source verification proves the deployed bytecode matches published source. **It is not an audit.**

Test profile and static-analysis results for that implementation are in [Testing and Verification](./security/testing-and-verification.md).

## What carries over to Soroban, and what does not

| Carries over | Does not carry over |
|---|---|
| The settlement design has been implemented, deployed, and operated | The Rust implementation, which is not written yet |
| Keeper economics work at real spreads and real size | Soroban resource limits, storage archival, and channel-account submission, all untested here |
| The team ships and runs production infrastructure | Any audit result — a Soroban audit has not started |
| Documentation is complete enough for an outside integrator | Venue integrations; Soroswap, Phoenix, and Aqua adapters do not exist yet |

The Soroban work is a native rebuild, not a port: native authorization replaces a custom signature scheme, the epoch replaces per-order cancellation state, and a mandate is single-shot rather than drawn down. Those differences are exactly why the EVM audit surface does not transfer. See [How Seltra Works](./concepts/how-seltra-works.md).

## Assertions, not evidence

Project materials describe prospective partner pilots, venue relationships, and agent-ecosystem demand. Those are **commercial assertions rather than independently verifiable usage metrics** and should be presented with current, permissioned evidence before being used externally.

Specifically: fixture data, testnet transactions, documentation visits, and interface sessions must never be represented as verified users, retained usage, or revenue.

Useful evidence, once Stellar is live, would be:

- mandates signed by wallets that are not the team's, with the fill rate against them;
- keepers run by people other than Seltra, and what they earned;
- agent-placed orders through the MCP server, and how many were placed inside a user-signed mandate rather than a test mandate;
- strategies cancelled by one epoch increment, showing the primitive being used as designed;
- yield-mode mandates that deposited, accrued, and settled — and how often a fill was skipped for constrained liquidity; and
- repeat use after a first order, without inferring identity.

## What blocks a production milestone

- Soroban settlement, router, and first venue adapter implemented and deployed to testnet.
- The full testnet demonstration list, including a cancellation that succeeds while fills are paused and state that survives past its TTL window — see [Testnet Deployment](./networks-and-deployments/testnet-deployment.md).
- Independent audit and public remediation.
- Distributed signer threshold, key custody, monitoring, and a documented incident path.
- Production keeper network run unattended, with rollout caps held in place until real traffic is observed.

Sequencing and dates are in [Roadmap](./roadmap.md). Deployment state is in [Mainnet Status](./networks-and-deployments/mainnet-status.md).
