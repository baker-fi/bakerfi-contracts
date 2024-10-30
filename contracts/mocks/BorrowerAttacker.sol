// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashBorrowerUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { VaultRegistry } from "../core/VaultRegistry.sol";
import { UseFlashLender } from "../core/hooks/UseFlashLender.sol";
import { UseStrategy } from "../core/hooks/UseStrategy.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BorrowerAttacker is IERC3156FlashBorrowerUpgradeable, UseFlashLender, UseStrategy {
  uint256 constant FLASH_LOAN_FEE_PRECISION = 100000;
  uint256 constant FLASH_LOAN_FEE = 100; // 0.1%

  mapping(address => uint256) _totalBorrowed;

  bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

  using SafeERC20 for IERC20;

  function initialize(address flashLender, address istrategy) public initializer {
    _initUseFlashLender(flashLender);
    _initUseStrategy(istrategy);
  }

  function borrowed(address token) external view returns (uint256) {
    return _totalBorrowed[token];
  }

  function flashme(address token, uint256 amount) external {
    require(IERC20(token).approve(flashLenderA(), amount));
    flashLender().flashLoan(this, token, amount, "0x");
  }

  function onFlashLoan(
    address,
    address token,
    uint256 amount,
    uint256,
    bytes calldata
  ) external override returns (bytes32) {
    IERC3156FlashBorrowerUpgradeable(strategyA()).onFlashLoan(strategyA(), token, amount, 0, "0x0");
    return CALLBACK_SUCCESS;
  }
}
