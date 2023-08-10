// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

interface IOracle {
    function getPrecision() external view returns (uint256);
    function getLatestPrice() external view returns (uint256);
}