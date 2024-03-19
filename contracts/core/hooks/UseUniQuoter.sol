// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry, UNISWAP_QUOTER_CONTRACT} from "../ServiceRegistry.sol";
import {IQuoterV2} from "../../interfaces/uniswap/v3/IQuoterV2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseUniQuoter is Initializable {
    IQuoterV2 private _quoter;

    function _initUseUniQuoter(ServiceRegistry registry) internal onlyInitializing {
        _quoter = IQuoterV2(registry.getServiceFromHash(UNISWAP_QUOTER_CONTRACT));
        require(address(_quoter) != address(0), "Invalid Uniswap Quoter Contract");
    }

    function uniQuoter() public view returns (IQuoterV2) {
        return _quoter;
    }

    function uniQuoterA() public view returns (address) {
        return address(_quoter);
    }
}
