// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

bytes32 constant STACK_SERVICE = keccak256(bytes("StackService"));
bytes32 constant APROVE_ACTION = keccak256(bytes("ApproveAction"));
bytes32 constant PULL_TOKEN_ACTION = keccak256(bytes("PullToken"));
bytes32 constant TRANSFER_ACTION = keccak256(bytes("TransferAction"));
bytes32 constant DS_PROXY_REGISTRY = keccak256(bytes("DSProxyRegistry"));
bytes32 constant FLASH_LENDER = keccak256(bytes("FlashLender"));
bytes32 constant WETH_CONTRACT = keccak256(bytes("WETH"));
bytes32 constant SWAP_HANDLER = keccak256(bytes("SwapHandler"));
bytes32 constant ST_ETH_CONTRACT = keccak256(bytes("stETH"));
bytes32 constant ONE_INCH_AGGREGATOR = keccak256(bytes("1InchAggregator"));
bytes32 constant WST_ETH_CONTRACT = keccak256(bytes("wstETH"));
bytes32 constant AAVE_V3 = keccak256(bytes("AAVE_V3"));
bytes32 constant WSTETH_ETH_ORACLE = keccak256(bytes("wstETH/ETH Oracle"));
address constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
uint256 constant PERCENTAGE_PRECISION = 1e9;    
bytes32 constant UNISWAP_ROUTER = keccak256(bytes("Uniswap Router"));
bytes32 constant BALANCER_VAULT = keccak256(bytes("Balancer Vault"));
bytes32 constant SETTINGS = keccak256(bytes("Settings"));