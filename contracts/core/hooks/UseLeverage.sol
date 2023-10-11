// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {PERCENTAGE_PRECISION, MAX_LOOPS} from "../Constants.sol";

contract UseLeverage {

   
    
    function calculateLeverageRatio(
        uint256 baseValue,
        uint256 loanToValue,
        uint8 nrLoops
    ) public pure returns (uint256) {
        require(nrLoops <= MAX_LOOPS, "Invalid Number of Loops");            
        require(loanToValue > 0 && loanToValue < PERCENTAGE_PRECISION, "Invalid Loan to value");
        uint256 leverage = baseValue;
        uint256 prev = baseValue;
        for (uint8 i = 1; i <= nrLoops; ) {
            uint256 inc = (prev * loanToValue) / PERCENTAGE_PRECISION;
            leverage += inc;
            prev = inc;
            unchecked {
                ++i;
            }
        }
        return leverage;
    }

    function calcDeltaPosition(
        uint256 percentageToBurn,
        uint256 totalCollateralBaseInEth,
        uint256 totalDebtBaseInEth
    ) public pure returns (uint256 deltaCollateralInETH, uint256 deltaDebtInETH) {
        require(percentageToBurn > 0 && percentageToBurn <= PERCENTAGE_PRECISION, "Invalid Percentage Value");
        // Reduce Collateral based on the percentage to Burn
        deltaDebtInETH = (totalDebtBaseInEth * percentageToBurn) / PERCENTAGE_PRECISION;
        // Reduce Debt based on the percentage to Burn
        deltaCollateralInETH = (totalCollateralBaseInEth * percentageToBurn) / PERCENTAGE_PRECISION;
    }

    function calculateDebtToPay(
        uint256 targetLoanToValue,
        uint256 collateral,
        uint256 debt
    ) public pure returns (uint256 delta) {
        uint256 colValue = ((targetLoanToValue * collateral) / PERCENTAGE_PRECISION);
        require(colValue < debt, "Invalid Target value");
        uint256 numerator = debt - colValue;
        uint256 divisor = (PERCENTAGE_PRECISION - targetLoanToValue);
        delta = (numerator * PERCENTAGE_PRECISION) / divisor;    
    }
}
