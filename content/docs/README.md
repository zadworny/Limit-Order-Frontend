# Seltra

**Programmable order execution on Soroban.** A maker signs one Soroban authorization entry that
fixes the asset pair, the size, the minimum output, and the expiry. Nothing moves and no fee is paid
until something fills the order inside those bounds. Whatever fills it - a permissionless keeper, a
grid strategy, or an AI agent - cannot exceed what was signed, because the Soroban host verifies the
mandate before Seltra's code runs.

Every Soroban DEX does one thing: swap now, at whatever price the pool quotes this second. Seltra
adds the missing primitive - a resting, bounded mandate - and settles it through whichever of two
paths pays the maker more.

- **DEX path.** A keeper routes the fill into Soroban AMM liquidity through an allowlisted venue
  adapter. Soroswap first, then further venues.
- **P2P path.** Two crossing mandates settle directly against each other, with no AMM and no price
  impact. The crossed spread goes to the two traders instead of to a pool.

Either path must return at least the maker's signed minimum. Anything above it is surplus, split
between the maker and the keeper who found it.

Seltra is a demand layer, not a competing pool. It sends volume into the AMMs that already exist on
Soroban rather than pulling liquidity out of them.

## Where things stand

| Layer | State |
|---|---|
| Soroban settlement, router, venue adapters | Specified; implementation in progress, not deployed |
| Stellar Testnet | Planned |
| Stellar Mainnet | Planned after external audit |
| Independent security audit | Not started |
| Same settlement design, EVM implementation | Live on Avalanche C-Chain mainnet since 3 August 2026 |

The design is proven before it is funded: the two-path settlement model, the epoch cancel primitive,
and the surplus split all run in production on Avalanche today. The Soroban work is a native rebuild,
not a port - see [Key design decisions](concepts/how-seltra-works.md) for the places where the
two platforms genuinely differ, and [Traction](traction.md) for what is inspectable now.

## Documentation

Start at the [documentation index](index.md). The sections are:

| Section | Contents |
|---|---|
| [Concepts](concepts/index.md) | Mandates, authorization, both settlement paths, surplus, cancellation, strategies, agents, yield |
| [Build with Seltra](build-with-seltra/index.md) | Quickstart, signing, orderbook API, keepers, indexing, configuration |
| [Contract Reference](contract-reference/index.md) | Settlement, router, adapters, events and errors, governance |
| [Networks and Deployments](networks-and-deployments/index.md) | Network configuration, addresses, mainnet status |
| [Security](security/index.md) | Security model, threat table, testing and verification |
| [Traction](traction.md) and [Roadmap](roadmap.md) | What is shipped, what is funded, and when it lands |

## This repository

This repository holds the Seltra frontend and client SDK. The Soroban contracts, the orderbook
service, and the keeper live in [`Seltra-Finance/Limit-Order`](https://github.com/Seltra-Finance/Limit-Order).

| Path | What it is |
|---|---|
| `app/`, `src/` | Next.js 14 frontend, including the documentation site that renders `content/docs` |
| `packages/sdk` | Client SDK - order building and hashing, typed-data assembly, wire codecs, order validation, REST and reconnecting WebSocket clients |
| `services/orderbook-api` | **Deprecated** legacy demo backend. The active orderbook API lives in `Seltra-Finance/Limit-Order` under `services/` |
| `deploy/` | Caddyfile, systemd units, production environment templates |
| `content/docs` | The documentation published here |

The current frontend and SDK target the live EVM deployment. The Soroban client work - Stellar
Wallets Kit signing, generated contract bindings, and the strategy engine - is Tranche 1 and
Tranche 2 scope on the [Roadmap](roadmap.md).

## Development

Requires Node 22 or newer.

```bash
npm ci
cp .env.local.example .env.local
npm run api                               # orderbook API + indexer on :8080
npm run dev                               # frontend and docs on :3000
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run docs:check                        # navigation/content parity, links, frontmatter
```

## Security

Seltra is designed so that whoever executes a mandate cannot rewrite its economics. Read the
[security model](security/security-model.md) before integrating, and
[mainnet status](networks-and-deployments/mainnet-status.md) before assuming anything about
production readiness. No independent audit has been completed on either implementation.

## License

No license granted yet - all rights reserved.
