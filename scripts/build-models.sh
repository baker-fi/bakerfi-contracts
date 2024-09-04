#/bin/bash

npx dlt -j .config-launchpad.json -f artifacts/contracts/core/strategies/StrategyLeverageMorphoBlue.sol/StrategyLeverageMorphoBlue.json &&
npx dlt -j .config-launchpad.json -f artifacts/contracts/core/Settings.sol/Settings.json &&
npx dlt -j .config-launchpad.json -f artifacts/contracts/core/ServiceRegistry.sol/ServiceRegistry.json  &&
npx dlt -j .config-launchpad.json -f artifacts/contracts/core/flashloan/BalancerFlashLender.sol/BalancerFlashLender.json &&
npx dlt -j .config-launchpad.json -f artifacts/contracts/core/strategies/AAVEv3StrategyAny.sol/AAVEv3StrategyAny.json &&
npx dlt -j .config-launchpad.json -f artifacts/contracts/core/strategies/StrategyAAVEv3WstETH.sol/StrategyAAVEv3WstETH.json