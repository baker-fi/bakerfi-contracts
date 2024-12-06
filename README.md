# BakerFi Smart Contracts

Unlock higher yields with flexible, low-risk strategies that go beyond just ETH staking. Our platform leverages diverse opportunities across liquidity, money markets and defi protocols, allowing you to maximize returns with customized, secure and curated investments.

## Features

* Pool Based Yield Generation
* Liquidation Protection
* Easy to Use Interface
* Leverage based on Flash Loans
* Liquid Yield Shares brETH
* Proxied Deployment for Settings, Vault and Strategies

## Integrations
* AAVE v3
* Lido Staking Contracts
* Uniswap v3
* Balancer Flash Loans

## Audits

* [Creed Audit Q1 2024](https://github.com/baker-fi/bakerfi-contracts/blob/master/audits/audit-creed-2024-05-10.pdf)
* [BakerFi Code4rena Competitive Audit Q2 2024](https://code4rena.com/reports/2024-05-bakerfi)

## Prerequisites
Before getting started with this project, make sure you have the following prerequisites:

* Node.js (version 20 or higher)
* NPM (version 9.0 or higher)
* Hardhat (version 2.0.0 or higher)
* Ethereum wallet or provider (e.g., MetaMask)
* Solidity development knowledge


## Installation
1. Clone the project repository to your local machine:

```
git clone https://github.com/your_username/bakerfi
```

2. Navigate to the project directory:

```
cd bakerfi
```

3. Install the dependencies:

```
npm install
```

## Usage

### Compiling Smart Contracts
To compile the smart contracts, run the following command:

```
npx hardhat compile
```

The compiled artifacts will be placed in the ./artifacts directory.

### Running Tests
To run the automated tests, execute the following command:

```
npm run test

# With Gas Report
npm run test:gas

# With Gas Report + Test Coverage
npm run test:coverage
```

This will execute the tests defined in the ./test directory.

## Deployment
To deploy your smart contracts to a specific network, configure the network settings in the hardhat.config.js file. Then, run the deployment script using the following command:

### Production
```
npx hardhat run --network <network-name> scripts/deploy.ts
```

### Local Development (Ganache)

```
# Open a terminal to run Ganache
npm run ganache:dev
# Open a separate terminal to run the deployment script
npx hardhat run scripts/deploy-dev.ts
```

Replace <network-name> with the desired network from your configuration.


## Create an SDK packager


```
npm run compile:clean && npm run build
```

```
npm pack
```

### Setup Development Environment

1. Start ganache with the predefined accounts

```
npm run ganache:dev
```

This will start a local Ethereum network with accounts pre-loaded with test Ether. The server will output the available accounts and their private keys.


2. Deploy the Vault Contract with Mocks Deployed

```
npm run deploy:local
```

If everything runs sucessfully you should get BakerFi Vault deployed with some mocked Services for testing purposes
```
Service Registry = 0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e
WETH = 0xd7630A747b24b7245ff60e3095aD04684dC1a292
FlashLender Mock = 0x5Ac32814f9EB4d415779892890a216b244FcB3B5
stETH = 0x2C263d29775dC27167c58aB7B18dc6C942c141B0
wstETH = 0x27F56eb75a1EBbE7e7218e8fCa5FF51E3d655f22
Swap Router Mock = 0x26A76D21edD8049fd394786976EF578010569FcB
AAVE v3 Mock = 0x621e8cdBc878Bdda95d0247B71FeBE0a8b2d4EE3
Vault = 0xE8A1e868E4736669b73B9E26BE22129bD6B4E83d
AAVEv3 Strategy = 0xC5Dfa3ebaDD8cf122b2b086e3aC28492Da76a0eE
WSETH/ETH Oracle = 0xE8F362bF1E066547113981FdaC7c1dDC6949a7Ac
...
```

### Development CLI Commands

### Interacting with Contracts
You can interact with the deployed contracts using the Hardhat console. Start the console with the following command:

```
npx hardhat console --network <network-name>
```

Replace <network-name> with the desired network from your configuration.


### Usefull Scripts

**Export Flat File Contracts**

```
npm run export:flat
```

**Generate Documentation**
```
npm run doc
```

**Run Echidna for Testing**

```
echidna . --config echidna.yaml  --contract VaultFuzzing
```

**Verify a contract**

```
npx hardhat verify --network mainnet <contract_address> <args>...
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Documentation

* [Tasks](TASKS.md)
* [Markets](MARKETS.md)
* [License](LICENSE)
* [Hardhat Tasks Documentation](TASKS.md)
* [Software License](LICENSE)
* [Release Notes](RELEASE_NOTES.md)
* [Contributing](CONTRIBUTING.md)
* [Code of Conduct](CODE_OF_CONDUCT.md)
* [Security](SECURITY.md)

## Other

[BakerFi](https//bakerfi.xyz) - Cooking up your Yields 🧑‍🍳
