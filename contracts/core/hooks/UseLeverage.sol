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
                i++;
            }
        }
        return leverage;
    }

    function calcDeltaPosition(
        uint256 percentageToBurn,
        uint256 totalCollateralBaseInEth,
        uint256 totalDebtBaseInEth
    ) public pure returns (uint256 deltaCollateralInETH, uint256 deltaDebtInETH) {
        require(percentageToBurn > 0 && percentageToBurn <= PERCENTAGE_PRECISION);
        // Reduce Collateral based on the percentage to Burn
        deltaDebtInETH = (totalDebtBaseInEth * percentageToBurn) / PERCENTAGE_PRECISION;
        // Reduce Debt based on the percentage to Burn
        deltaCollateralInETH = (totalCollateralBaseInEth * percentageToBurn) / PERCENTAGE_PRECISION;
    }

    function calcDeltaDebt(
        uint256 totalCollateralBaseInEth,
        uint256 totalDebtBaseInEth,
        uint256 targetLoanToValue
    ) public pure returns (uint256 deltaDebtInETH) {
        uint256 numerator = totalDebtBaseInEth -
            ((targetLoanToValue * totalCollateralBaseInEth) / PERCENTAGE_PRECISION);
        uint256 divisor = (PERCENTAGE_PRECISION - targetLoanToValue);
        deltaDebtInETH = (numerator * PERCENTAGE_PRECISION) / divisor;
    }
}
