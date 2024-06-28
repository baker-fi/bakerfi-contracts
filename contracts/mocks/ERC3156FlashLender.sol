// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { PERCENTAGE_PRECISION } from "../core/Constants.sol";

contract MockFlashLender is IERC3156FlashLender {
  using SafeERC20 for IERC20;

  bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

  IERC20 private _asset;
  uint256 private _flashLoanFee = 1e6; // 0.1%
  IERC3156FlashLender private _flashLender;

  constructor(IERC20 asset) {
    _asset = asset;
  }

  function getFlashLoanFee() public view returns (uint256) {
    return _flashLoanFee;
  }

  function setFlashLoanFee(uint256 fee) external {
    _flashLoanFee = fee;
  }

  function maxFlashLoan(address) external view override returns (uint256) {
    return _asset.balanceOf(address(this));
  }

  function flashFee(address, uint256 amount) external view override returns (uint256) {
    return (amount * _flashLoanFee) / PERCENTAGE_PRECISION;
  }

  function flashLoan(
    IERC3156FlashBorrower borrower,
    address token,
    uint256 amount,
    bytes calldata data
  ) external override returns (bool) {
    uint256 fee = (amount * _flashLoanFee) / PERCENTAGE_PRECISION;
    uint256 balanceBefore = _asset.balanceOf(address(this));
    require(balanceBefore >= amount, "No Balance available for flash load");
    _asset.safeTransfer(address(borrower), amount);
    require(
      borrower.onFlashLoan(msg.sender, token, amount, fee, data) == CALLBACK_SUCCESS,
      "FlashBorrower: Callback failed"
    );
    require(_asset.allowance(address(borrower), address(this)) >= fee + amount);
    _asset.safeTransferFrom(address(borrower), address(this), amount + fee);
    return true;
  }
}
