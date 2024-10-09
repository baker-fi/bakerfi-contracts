# Bakerfi Smart Contracts

Unlock higher yields with flexible, low-risk strategies that go beyond just ETH staking. Our platform leverages diverse opportunities across liquidity, money markets and defi protocols, allowing you to maximize returns with customized, secure and curated investments.

These are the on-chain contracts deployed by the protocol to provide the money infrastructure of our service.

## Versions
### 1.0 Version (Released on 28th June of 2024)

* First Cross Chain Strategy for Leverage Staking using AAVE version 3 and Uniswap
* Governable Strategy
* External Service Registry
* Audit by Creed and Code4Arena
* Bakerfi Typescript/Js SDK
* Chainlink and Pyth Oracle Support
* Proxied (Strategy/Vault/Settings) Deployment
* Flash Lender Adapter for Balancer
* Uniswap v3 Swap Integration

###  1.1 Version (Released on 8th August of 2024)

* ERC-4264 Compliant Vault (deposit/withdraw/mint/redeem )
* Allows the Strategy governor to change the Strategy Oracles
* Contracts hooks make the utility functions private
* Exchane Ratio Oracle using chainlink and base oracle pyth

### 1.2 Version (Released on 30th September of 2024)
* Leverage Staking strategy supports a debt token other than WETH
* Support for AAVE v3 Different Markets( Example: Lido Market)
* Support for Leverage Staking strategies using Morpho Blue Lending Markets
* Support for Ethereum Mainnet
* CustomRatioOracles to use custom call to external contracts to get ratios

### 1.3 Version (In Progress)

* Multiple Accounts are allowed to pause and unpause the vault


## Compatibility Matrix

| **Version** | **1.0** | **1.1** | **1.2** | **1.3** |
|:-----------:|:-------:|:-------:|:-------:|:-------:|
| **1.0**     |    ✔    |    ✔    |    ✘    |    ✘    |
| **1.1**     |    ✔    |    ✔    |    ✘    |    ✘    |
| **1.2**     |    ✘    |    ✘    |    ✔    |    ✘    |
| **1.3**     |    ✘    |    ✘    |    ✘    |    ✔    |


*Note 🔔: Somes versions loose upgradability duet to slot storage imcompatibility*



