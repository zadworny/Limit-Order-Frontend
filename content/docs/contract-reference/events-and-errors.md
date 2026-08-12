---
title: "Events & Errors"
description: "Integrations should decode custom errors where possible and treat Permit2 nonce-consumption failures as expected race outcomes."
section: "Contract Reference"
order: 22
---

### Settlement events

| Event                           | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `OrderFilledDEX`                | DEX fill economics and venue attribution          |
| `OrderFilledP2P`                | Both order hashes and crossed-spread distribution |
| `EpochIncremented`              | Maker cancel-all state                            |
| `FillsPaused` / `FillsUnpaused` | Global availability                               |
| `GuardianSet`                   | Guardian rotation                                 |
| `SurplusParamsSet`              | Incentive and treasury parameters                 |
| `TokenAllowed`                  | Token policy changes                              |

### Router events

| Event                               | Purpose                         |
| ----------------------------------- | ------------------------------- |
| `AdapterAdded`                      | Write-once adapter registration |
| `AdapterPaused` / `AdapterUnpaused` | Venue availability              |
| `SettlementSet`                     | One-time router wiring          |
| `GuardianSet`                       | Router guardian rotation        |

### Common revert categories

* **Order validity:** `BadMaker`, `BadReceiver`, `ZeroAmount`, `OrderExpired`, `InvalidEpoch`, `PrivateOrder`, `BadFlags`
* **Permit mismatch:** `BadPermitToken`, `BadPermitAmount`, `BadPermitDeadline`
* **Economics:** `InsufficientOutput`, `PriceNotCrossed`, `SizeMismatch`, `AssetMismatch`
* **Policy:** `TokenNotAllowed`, `UnsupportedToken`, `UnknownAdapter`, `FillsPausedError`
* **Authorization:** `NotGuardian`, `OnlySettlement`, `OnlyRouter`
* **Route validation:** `BadPath`, `BadRoute`, `BadTickSpacing`, `DeadlineExpired`, `RouteNotAllowed`

Integrations should decode custom errors where possible and treat Permit2 nonce-consumption failures as expected race outcomes.
