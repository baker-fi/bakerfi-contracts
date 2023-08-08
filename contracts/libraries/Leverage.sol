

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";


library Leverage {
    using SafeMath for uint256;
    
    uint256 constant MAX_LOAN_TO_VALUE = 100000; // 100%

    function calculateLeverageRatio(uint256 baseValue, uint256 loanToValue, uint8 nrLoops ) public pure  returns (uint256) {
        uint256 leverage = baseValue; 
        uint256 prev = baseValue;
        for(uint8 i=1; i<=nrLoops; i++) { 
            uint256 inc = prev*loanToValue/MAX_LOAN_TO_VALUE;
            leverage += inc;
            prev = inc;
        }
  
        return leverage;
    }
}
