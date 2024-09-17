# Bakerfi Smart Contracts

Unlock higher yields with flexible, low-risk strategies that go beyond just ETH staking. Our platform leverages diverse opportunities across liquidity, money markets and defi protocols, allowing you to maximize returns with customized, secure and curated investments.

These are the on-chain contracts deployed by the protocol to provide the money infrastructure of our service.

## 1.0 Version (Released on 28th June of 2024)

* First Cross Chain Strategy for Leverage Staking using AAVE version 3 and Uniswap
* Governable Strategy
* External Service Registry
* Audit by Creed and Code4Arena
* Bakerfi Typescript/Js SDK
* Chainlink and Pyth Oracle Support
* Proxied (Strategy/Vault/Settings) Deployment
* Flash Lender Adapter for Balancer
* Uniswap v3 Swap Integration

## 1.1 Version (Released on 8th August of 2024)

* ERC-4264 Compliant Vault (deposit/withdraw/mint/redeem )
* Allows the Strategy governor to change the Strategy Oracles
* Contracts hooks make the utility functions private
* Exchane Ratio Oracle using chainlink and base oracle pyth

## 1.2 Version (In Development)
* Leverage Staking strategy supports a debt token other than WETH

*Note 🔔: The version 1.1 Contracts loose 1.2 upgradability duet to slot storage imcompatibility*

