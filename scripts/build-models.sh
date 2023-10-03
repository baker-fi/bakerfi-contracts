#/bin/bash

npx dlt -j .config-launchpad.json -f artifacts/contracts/core/BakerFiVault.sol/LaundromatVault.json   && 
npx dlt -j .config-launchpad.json -f artifacts/contracts/core/AAVEv3Strategy.sol/AAVEv3Strategy.json &&
npx dlt -j .config-launchpad.json -f artifacts/contracts/core/ServiceRegistry.sol/ServiceRegistry.json  &&
npx dlt -j .config-launchpad.json -f artifacts/contracts/core/swappers/UniV3Swapper.sol/UniV3Swapper.json && 
npx dlt -j .config-launchpad.json -f artifacts/contracts/oracles/WstETHToETHOracle.sol/WstETHToETHOracle.json && 
npx dlt -j .config-launchpad.json -f artifacts/contracts/core/flashloan/BalanceFlashLender.sol/BalanceFlashLender.json