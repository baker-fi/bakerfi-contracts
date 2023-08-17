# Landromat Smart Contracts

Recursive ETH Staking made easy

## Features

* Pool Based Yield Generation
* Liquidation Protection
* Easy to Use Interface
* Leverage based on Flash Loans
* Liquid Yield Shares matETH 

## Integrations 
* AAVE v3 
* AAVE v2
* Lido Staking Contracts
* 1Inch Swaps for the best swap prices

## Prerequisites
Before getting started with this project, make sure you have the following prerequisites:

* Node.js (version 18 or higher)
* NPM (version 9.0 or higher)
* Hardhat (version 2.0.0 or higher)
* Ethereum wallet or provider (e.g., MetaMask)
* Solidity development knowledge


## Installation
1. Clone the project repository to your local machine:

```
git clone https://github.com/hvasconcelos/laundromat-contracts
```

2. Navigate to the project directory:

```
cd laundromat-contracts
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
npx hardhat test
```

This will execute the tests defined in the ./test directory.

## Deployment
To deploy your smart contracts to a specific network, configure the network settings in the hardhat.config.js file. Then, run the deployment script using the following command:

```
npx hardhat run --network <network-name> scripts/deploy.ts
```

Replace <network-name> with the desired network from your configuration.

### Development Environment 
To run a local development server, use the following command:
```
npx hardhat node
```

This will start a local Ethereum network with accounts pre-loaded with test Ether. The server will output the available accounts and their private keys.

### Interacting with Contracts
You can interact with the deployed contracts using the Hardhat console. Start the console with the following command:

```
npx hardhat console --network <network-name>
```

Replace <network-name> with the desired network from your configuration.

Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
MIT
