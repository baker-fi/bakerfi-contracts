// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockFlashLender is IERC3156FlashLender {
    
    uint256 constant FLASH_LOAN_FEE_PRECISION = 100000;
    uint256 constant FLASH_LOAN_FEE = 100; // 0.1% 
    IERC20 _asset;

    constructor(IERC20 asset) {
        _asset = asset;
    }
     
    function maxFlashLoan(address token) external view override returns (uint256) {
        return _asset.balanceOf(address(this));
    }

    function flashFee(address token, uint256 amount) external view override returns (uint256) {
        return amount * FEE_PERC / MAX_PERCENTAGE
    }

    function flashLoan(
        IERC3156FlashBorrower borrower,
        address token,
        uint256 amount,
        bytes calldata data
    ) external override returns (bool) {
        uint256 fee = amount.mul(FLASH_LOAN_FEE) / FLASH_LOAN_FEE_PRECISION;       
        uint256 balanceBefore = _asset.balanceOf(address(this)); 
        require(balanceBefore >= amount, "No Balance available for flash load");        
        _asset.safeTransfer(borrower, amount);                
        borrower.onFlashLoan(msg.sender, token, amount, fee, data);        
        require(_asset.allowance(borrower, address(this) >= fee + amount));
        _asset.safeTransferFrom(borrower, address(this), amount + fee);        
        emit OnFlashLoan(address(borrower), token, amount, fee, receiver);
    }
}
