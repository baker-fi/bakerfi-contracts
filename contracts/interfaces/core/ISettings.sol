// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ISettings {

    function setMaxLoanToValue(uint256 maxLoanToValue) external ;

    function getMaxLoanToValue() external view returns (uint256);

    function setWithdrawalFee(uint256 fee) external ;

    function getWithdrawalFee() external view returns (uint256) ;

    function setLoanToValue(uint256 loanToValue) external;

    function getLoanToValue() external view returns (uint256);

    function setPerformanceFee(uint256 fee) external;

    function getPerformanceFee() external view returns (uint256) ;

    function setFeeReceiver(address receiver) external;

    function getFeeReceiver() external view returns (address);

}