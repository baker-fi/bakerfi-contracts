# BakerFi Documentation 


# Contracts 

* [contracts/core/Constants.sol](core/Constants.md) - Global Constants 
* [contracts/core/GovernableOwnable.sol](core/GovernableOwnable.md) - A Governed and Ownable Contract 
* [contracts/core/ServiceRegistry.sol](core/ServiceRegistry.md) -  Service registry that could be used resolve a service address with the name of the service.
* [contracts/core/Settings.sol](core/Settings.md) - The `Settings` contract is used to manage protocol settings.
* [contracts/core/Vault.sol](core/Vault.md) -  This is smart contract where the users deposit their ETH and receives a share of the pool <x>brETH. A share of the pool is an ERC-20 Token (transferable) and could be used to later to withdraw their owned amount of the pool that could contain (Assets + Yield ). This vault could use a customized IStrategy to deploy the capital and harvest an yield.
* [contracts/core/flashloan/BalancerFlashLender.sol](core/flashloan/BalancerFlashLender.md) - This contract allows us
to have a static interface independent of the flash loan provider.
* [contracts/core/governance/BKR.sol](core/governance/BKR.md) - $BKR BakerFi Token ERC-20  
* [contracts/core/governance/BakerFiGovernor.sol](/core/governance/BakerFiGovernor.md) - DAO Governor Contract 
* [contracts/core/governance/Timelock.sol](core/governance/Timelock.md) -
* [contracts/core/hooks/UseAAVEv3.sol](core/hooks/UseAAVEv3.md) - AAVE Interaction Hook Contract
* [contracts/core/hooks/UseFlashLender.sol](core/hooks/UseFlashLender.md) - Flash Lender Hook 
* [contracts/core/hooks/UseIERC20.sol](core/hooks/UseIERC20.md) - IERC20 ERC-20 Hook 
* [contracts/core/hooks/UseLeverage.sol](core/hooks/UseLeverage.md) - Leverage Hoook
* [contracts/core/hooks/UseOracle.sol](core/hooks/UseOracle.md) - Oracle Hook 
* [contracts/core/hooks/UseSettings.sol](core/hooks/UseSettings.md) - Settings Hook 
* [contracts/core/hooks/UseStETH.sol](core/hooks/UseStETH.md) - stETH Hook 
* [contracts/core/hooks/UseStrategy.sol](core/hooks/UseStrategy.md) - Strategy Hook 
* [contracts/core/hooks/UseSwapper.sol](core/hooks/UseSwapper.md) - Uniswap v3 Swapper Hook 
* [contracts/core/hooks/UseUniQuoter.sol](core/hooks/UseUniQuoter.md) - Uniswap v3 Quoter Hook
* [contracts/core/hooks/UseWETH.sol](core/hooks/UseWETH.md) - WETH Hook 
* [contracts/core/hooks/UseWstETH.sol](core/hooks/UseWstETH.md) - wstETH Hpok 
* [contracts/core/hooks/strategies/StrategyAAVEv3.sol](core/hooks/strategies/StrategyAAVEv3.md) - Leverage Strategy with AAVEv3 
* [contracts/core/hooks/strategies/StrategyAAVEv3Base.sol](core/hooks/strategies/StrategyAAVEv3Base.md) - Leverage Base Clawss Strategy with AAVEv3 
* [contracts/core/hooks/strategies/StrategyAAVEv3WSTETH.sol](core/hooks/strategies/StrategyAAVEv3WSTETH.md) - Leverage Base Clawss Strategy with AAVEv3 for Ethereum Main net
* [contracts/core/hooks/strategies/StrategyLeverageSettings.sol](core/hooks/strategies/StrategyLeverageSettings.md) - Leverage Settings for a strategy

## Interfaces

* contracts/core/hooks/strategies/interfaces/aave/v3/DataTypes.sol
* contracts/core/hooks/strategies/interfaces/aave/v3/DataTypes.sol
* contracts/core/hooks/strategies/interfaces/aave/v3/IPoolAddressesProvider.sol
* contracts/core/hooks/strategies/interfaces/aave/v3/IPoolV3.sol
* contracts/core/hooks/strategies/interfaces/balancer/IFlashLoan.sol
* contracts/core/hooks/strategies/interfaces/balancer/IProtocolFeesCollector.sol
* contracts/core/hooks/strategies/interfaces/balancer/IVault.sol
* contracts/core/hooks/strategies/interfaces/chainlink/IChainlinkAggregator.sol
* contracts/core/hooks/strategies/interfaces/core/IOracle.sol
* contracts/core/hooks/strategies/interfaces/core/IServiceRegistry.sol
* contracts/core/hooks/strategies/interfaces/core/ISettings.sol
* contracts/core/hooks/strategies/interfaces/core/IStrategy.sol
* contracts/core/hooks/strategies/interfaces/core/ISwapHandler.sol
* contracts/core/hooks/strategies/interfaces/core/IVault.sol
* contracts/core/hooks/strategies/interfaces/curve/ICurvePool.sol
* contracts/core/hooks/strategies/interfaces/lido/IStETH.sol
* contracts/core/hooks/strategies/interfaces/lido/IWStETH.sol
* contracts/core/hooks/strategies/interfaces/pyth/IPyth.sol
* contracts/core/hooks/strategies/interfaces/pyth/IPythEvents.sol
* contracts/core/hooks/strategies/interfaces/pyth/PythStructs.sol
* contracts/core/hooks/strategies/interfaces/tokens/IWETH.sol
* contracts/core/hooks/strategies/interfaces/uniswap/v3/IQuoterV2.sol
* contracts/core/hooks/strategies/interfaces/uniswap/v3/ISwapRouter.sol
* contracts/core/hooks/strategies/interfaces/uniswap/v3/IUniswapV3Pool.sol
* contracts/core/hooks/strategies/libraries/RebaseLibrary.sol

