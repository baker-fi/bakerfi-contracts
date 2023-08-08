

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

library Leverage {
    using SafeMath for uint256;
    
    uint256 constant MAX_LOAN_TO_VALUE = 100000; // 100%

    function calculateLeverageRatio(uint256 baseValue, uint256 loanToValue, uint8 nrLoops ) public pure returns (uint256) {
        uint256 leverage = 0; 
        uint256 start = baseValue; 
        for(uint8 i=0; i<=nrLoops; i++) { 
            leverage = leverage + start*(loanToValue**i)/MAX_LOAN_TO_VALUE;
        }
        return leverage;
    }
}