// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {UseFlashLender} from "../core/hooks/UseFlashLender.sol";


contract FlashBorrowerMock is IERC3156FlashBorrower, UseFlashLender {
    uint256 constant FLASH_LOAN_FEE_PRECISION = 100000;
    uint256 constant FLASH_LOAN_FEE = 100; // 0.1%
    
    mapping(address=> uint256) _totalBorrowed;

    bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

    using SafeERC20 for IERC20;


    constructor(ServiceRegistry registry) UseFlashLender(registry) {}   

    function borrowed(address token) external view returns (uint256) {
        return _totalBorrowed[token];
    }


    function flashme(
        address token,
        uint256 amount
    ) external {
        require(IERC20(token).approve(flashLenderA(), amount));
        flashLender().flashLoan(this, token, amount, "0x");    
    }

    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        _totalBorrowed[token]+=amount;
        return CALLBACK_SUCCESS;
    }
}
