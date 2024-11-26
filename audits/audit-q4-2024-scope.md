The data/format below is provided as an example to guide you.

## 1. Repository Links

- https://github.com/baker-fi/bakerfi-contracts

## 2. Branches

- audit-Q4-2024

## File paths to INCLUDE

```
├── core
│   ├── Constants.sol
│   ├── MultiCommand.sol
│   ├── MultiStrategy.sol
│   ├── MultiStrategyVault.sol
│   ├── Vault.sol
│   ├── VaultRegistry.sol
│   ├── VaultRouter.sol
│   ├── VaultSettings.sol
│   ├── hooks
│   │   ├── UseAAVEv3.sol
│   │   ├── UseFlashLender.sol
│   │   ├── UseIERC20.sol
│   │   ├── UseIERC4626.sol
│   │   ├── UseLeverage.sol
│   │   ├── UseOracle.sol
│   │   ├── UsePermitTransfers.sol
│   │   ├── UseStrategy.sol
│   │   ├── UseTokenActions.sol
│   │   └── swappers
│   │       ├── UseAeroSwapper.sol
│   │       ├── UseCurveSwapper.sol
│   │       ├── UseUniV2Swapper.sol
│   │       ├── UseUniV3Swapper.sol
│   │       └── UseUnifiedSwapper.sol
│   ├── router
│   │   └── Commands.sol
│   └── strategies
│       ├── StrategyAeroSwapAnd.sol
│       ├── StrategyCurveSwapAnd.sol
│       ├── StrategyLeverage.sol
│       ├── StrategyLeverageAAVEv3.sol
│       ├── StrategyLeverageMorphoBlue.sol
│       ├── StrategyLeverageSettings.sol
│       ├── StrategyPark.sol
│       ├── StrategySettings.sol
│       ├── StrategySupplyAAVEv3.sol
│       ├── StrategySwapAnd.sol
│       ├── StrategyUniV2SwapAnd.sol
│       └── StrategyUniV3SwapAnd.sol
├── libraries
│   ├── AerodromeLibrary.sol
│   ├── CurveFiLibrary.sol
│   ├── MathLibrary.sol
│   ├── RebaseLibrary.sol
│   ├── UniV2Library.sol
│   └── UniV3Library.sol
├── oracles
│   ├── ChainLinkExRateOracle.sol
│   ├── ChainLinkOracle.sol
│   ├── CustomExRateOracle.sol
│   ├── ExRateOracle.sol
│   └── PythOracle.sol

```

## Priority files

✅ Identify files that should receive extra attention:
```
core/MultiStrategyVault.sol
core/VaultRouter.sol
core/MultiCommand.sol
core/Vault.sol
core/strategies/StrategyLeverageAAVEv3.sol
core/strategies/StrategyLeverageMorphoBlue.sol
core/strategies/StrategySupplyAAVEv3.sol
```

## Areas of concern

✅ List specific issues or vulnerabilities you want the audit to focus on:

```
- Blocking of funds
- Assets Theif
- Malicious user actions
- Flash Loan Attacks
- Reentrancy Attacks
- Rebase Attacks
- Rounding Errors
- Slippage Attacks
- Denial of Service
```
