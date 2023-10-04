// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {UNISWAP_QUOTER} from "../Constants.sol";
import {IQuoterV2} from "../../interfaces/uniswap/v3/IQuoterV2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract UseUniQuoter {
    
    IQuoterV2 immutable private _quoter;

    constructor(ServiceRegistry registry) {
        _quoter = IQuoterV2(registry.getServiceFromHash(UNISWAP_QUOTER));
        require(address(_quoter) != address(0), "Invalid Uniswap Quoter Contract");
    }

    function uniQuoter() public view returns (IQuoterV2) {
        return _quoter;
    }

    function uniQuoterA() public view returns (address) {
        return address(_quoter);
    }
}