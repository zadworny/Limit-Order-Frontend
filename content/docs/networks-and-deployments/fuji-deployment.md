---
title: "Fuji Deployment"
description: "The current test stack runs on Avalanche Fuji, chain ID 43113."
section: "Networks & Deployments"
order: 25
---

The current test stack runs on Avalanche Fuji, chain ID `43113`.

### Components

* SeltraSettlement and SeltraAggregationRouter
* Canonical Permit2
* Mock adapter registered as adapter ID 0
* Open-mint sWAVAX and sUSDC demo tokens
* Safe guardian
* 48-hour TimelockController

The mock adapter is funded with demo quote tokens and configured with deterministic test pricing. It exists only to exercise complete DEX settlement without depending on third-party testnet liquidity.

### Verified behavior

The deployment has exercised:

* DEX settlement and maker improvement
* Permit2 replay rejection
* Exact-size P2P settlement
* Permit2 nonce cancellation
* Epoch cancellation while globally paused
* Safe-only global pause
* Safe-only adapter pause
* Source and metadata matching through Sourcify

The current remediation deployment was accepted on July 17, 2026. The Safe
guardian and existing 48-hour Timelock were reused; delayed ownership
acceptance is scheduled for July 19 at 12:38 CEST.

<Callout type="danger">

Demo token symbols resemble production assets for interface testing. They are unrelated to canonical mainnet assets and carry no value.

</Callout>
