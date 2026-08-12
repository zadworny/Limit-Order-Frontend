---
title: "Surplus, Fees & Incentives"
description: "Surplus is value realized above the maker's signed minimum."
section: "Concepts"
order: 8
---

Surplus is value realized above the maker's signed minimum.

```
surplus = amountOut - takingAmount
makerImprovement = floor(surplus × makerSurplusBps / 10,000)
keeperSide = surplus - makerImprovement
protocolFee = floor(keeperSide × protocolFeeBps / 10,000)
keeperReward = keeperSide - protocolFee
```

The default maker share is **70%** of surplus. The remaining 30% creates an incentive for keepers to discover and execute favorable liquidity. The owner may update the maker share through governance.

The protocol fee:

* is charged only against the keeper side;
* can never reduce the maker's signed minimum or maker improvement;
* is capped at 1,000 bps of the keeper side;
* requires a nonzero treasury when enabled.

### Rounding

Maker improvement and protocol fees round down. Deterministic division dust remains on the keeper side. On P2P fills, the maker share is divided between the two receivers, with odd-wei dust assigned deterministically before calculating the keeper reward.
