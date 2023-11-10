// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

uint256 constant MAX_LOAN_TO_VALUE = 1e9; // 100%
uint8 constant MAX_LOOPS = 20; // 100%
uint256 constant PERCENTAGE_PRECISION = 1e9;    
address constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;