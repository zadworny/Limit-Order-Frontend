---
title: "Fuji Quickstart"
description: "git clone --recurse-submodules https://github.com/Seltra-Finance/Limit-Order.git"
section: "Build with Seltra"
order: 11
---

### Prerequisites

* Node.js 20 or newer
* Foundry
* A Fuji RPC endpoint
* A funded Fuji EOA for keeper transactions

### Clone and test

```bash
git clone --recurse-submodules https://github.com/Seltra-Finance/Limit-Order.git
cd Limit-Order

cd contracts
forge build
forge test

cd ../services
npm ci
npm test
npm run typecheck
```

### Configure services

Copy `services/.env.fuji.example` into your secret-managed runtime environment. Supply `KEEPER_PRIVATE_KEY` only to the keeper process.

```bash
cd services
npm run dev
```

The default API listens on port `8080`. The WebSocket stream is available at `/stream`.

<Callout type="warning">

Never commit a private key or place it in a `NEXT_PUBLIC_*` variable. Frontend variables are visible to every browser user.

</Callout>
