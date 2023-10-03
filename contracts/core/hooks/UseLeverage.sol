// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {PERCENTAGE_PRECISION} from "../Constants.sol";

contract UseLeverage {

    uint256 constant MAX_LOAN_TO_VALUE = 1e9; // 100%    
    uint8 constant MAX_LOOPS = 20; // 100%

    function calculateLeverageRatio(
        uint256 baseValue,
        uint256 loanToValue,
        uint8 nrLoops
    ) public pure returns (uint256) {
        require (nrLoops <= MAX_LOOPS, "Invalid Number of Loops" );
        require (loanToValue > 0 && loanToValue < PERCENTAGE_PRECISION,  "Invalid Loan to value" );
        uint256 leverage = baseValue;
        uint256 prev = baseValue;
        for (uint8 i = 1; i <= nrLoops; ) {
            uint256 inc = (prev * loanToValue) / PERCENTAGE_PRECISION;
            leverage += inc;
            prev = inc;
            unchecked {
                i++;
            }
        }
        return leverage;
    }
}
