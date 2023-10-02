// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockFlashLender is IERC3156FlashLender {
    
    uint256 constant FLASH_LOAN_FEE_PRECISION = 100000;
    uint256 constant FLASH_LOAN_FEE = 100; // 0.1% 
    IERC20 _asset;
    
    using SafeERC20 for IERC20;

    bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");
    

    IERC3156FlashLender _flashLender;

    constructor(IERC20 asset) {
        _asset = asset;
    }
     
    function maxFlashLoan(address token) external view override returns (uint256) {
        return _asset.balanceOf(address(this));
    }

    function flashFee(address token, uint256 amount) external view  override returns (uint256) {
        return amount * FLASH_LOAN_FEE / FLASH_LOAN_FEE_PRECISION;
    }

    function flashLoan(
        IERC3156FlashBorrower borrower,
        address token,
        uint256 amount,
        bytes calldata data
    ) external override returns (bool) {
        uint256 fee = amount * FLASH_LOAN_FEE / FLASH_LOAN_FEE_PRECISION;       
        uint256 balanceBefore = _asset.balanceOf(address(this)); 
        require(balanceBefore >= amount, "No Balance available for flash load");        
        _asset.safeTransfer(address(borrower), amount);                        
        require(borrower.onFlashLoan(msg.sender, token, amount, fee, data )== CALLBACK_SUCCESS, "FlashBorrower: Callback failed");        
        require(_asset.allowance(address(borrower), address(this)) >= fee + amount);
        _asset.safeTransferFrom(address(borrower), address(this), amount + fee);    
        return true;    
    }
}
