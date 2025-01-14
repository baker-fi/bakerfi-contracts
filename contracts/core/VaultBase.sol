// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { Rebase, RebaseLibrary } from "../libraries/RebaseLibrary.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { IVault } from "../interfaces/core/IVault.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { PERCENTAGE_PRECISION } from "./Constants.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import { UseWETH } from "./hooks/UseWETH.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { AddressUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import { MathLibrary } from "../libraries/MathLibrary.sol";
import { VaultSettings } from "./VaultSettings.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ADMIN_ROLE, VAULT_MANAGER_ROLE, PAUSER_ROLE } from "./Constants.sol";

/**
 * @title BakerFi Vault Base 🧑‍🍳
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev This contract serves as the base for the BakerFi Vault, providing core functionalities
 * for managing assets, deposits, withdrawals, and rebalancing strategies.
 * It inherits from several OpenZeppelin contracts to ensure security and upgradeability.
 */
abstract contract VaultBase is
  AccessControlUpgradeable,
  PausableUpgradeable,
  ReentrancyGuardUpgradeable,
  ERC20Upgradeable,
  VaultSettings,
  UseWETH,
  IVault
{
  using RebaseLibrary for Rebase;
  using SafeERC20Upgradeable for IERC20Upgradeable;
  using AddressUpgradeable for address;
  using AddressUpgradeable for address payable;
  using MathLibrary for uint256;

  // Custom errors for better gas efficiency
  error InvalidAmount();
  error InvalidAssetsState();
  error InvalidAsset();
  error MaxDepositReached();
  error NotEnoughBalanceToWithdraw();
  error NoAssetsToWithdraw();
  error NoPermissions();
  error InvalidShareBalance();
  error InvalidReceiver();
  error NoAllowance();

  uint256 private constant _MINIMUM_SHARE_BALANCE = 1000;
  uint256 private constant _ONE = 1e18;

  /**
   * @dev Modifier to restrict access to whitelisted accounts.
   */
  modifier onlyWhiteListed() {
    if (!isAccountEnabled(msg.sender)) revert NoPermissions();
    _;
  }

  /**
   * @dev Modifier to restrict access to whitelisted accounts.
   */
  modifier onlyReceiverWhiteListed(address receiver) {
    if (!isAccountEnabled(receiver)) revert NoPermissions();
    _;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /**
   * @dev Fallback function to accept ETH transfers.
   * Reverts if the sender is not the wrapped ETH address.
   */
  receive() external payable override {
    if (msg.sender != wETHA()) revert ETHTransferNotAllowed(msg.sender);
  }
  /**
   * @dev Initializes the base contract with the specified parameters.
   * @param initialOwner The address of the initial owner of the vault.
   * @param tokenName The name of the token.
   * @param tokenSymbol The symbol of the token.
   * @param weth The address of the wrapped ETH contract.
   */
  function _initializeBase(
    address initialOwner,
    string calldata tokenName,
    string calldata tokenSymbol,
    address weth
  ) internal {
    __ERC20_init(tokenName, tokenSymbol);
    _initUseWETH(weth);
    if (initialOwner == address(0)) revert InvalidOwner();
    _initializeVaultSettings();
    __AccessControl_init();
    _setupRole(ADMIN_ROLE, initialOwner);
    _setupRole(VAULT_MANAGER_ROLE, initialOwner);
    _setupRole(PAUSER_ROLE, initialOwner);
  }

  /**
   * @dev Returns the address of the asset being managed by the vault.
   * @return The address of the asset.
   */
  function _asset() internal view virtual returns (address);

  /**
   * @dev Returns the total amount of assets managed by the vault.
   * @return amount The total assets amount.
   */
  function _totalAssets() internal view virtual returns (uint256 amount);

  /**
   * @dev Harvests the assets and returns the balance change.
   * @return balanceChange The change in balance after harvesting.
   */
  function _harvest() internal virtual returns (int256 balanceChange);

  /**
   * @dev Deploys the specified amount of assets.
   * @param assets The amount of assets to deploy.
   * @return The amount of assets deployed.
   */
  function _deploy(uint256 assets) internal virtual returns (uint256);

  /**
   * @dev Undeploys the specified amount of assets.
   * @param assets The amount of assets to undeploy.
   * @return The amount of assets undeployed.
   */
  function _undeploy(uint256 assets) internal virtual returns (uint256);

  function _harvestAndMintFees() internal {
    uint256 currentPosition = _totalAssets();
    if (currentPosition == 0) {
      return;
    }
    int256 balanceChange = _harvest();
    if (balanceChange > 0) {
      address feeReceiver = getFeeReceiver();
      uint256 performanceFee = getPerformanceFee();
      if (feeReceiver != address(this) && feeReceiver != address(0) && performanceFee > 0) {
        uint256 feeInEth = uint256(balanceChange) * performanceFee;
        uint256 sharesToMint = feeInEth.mulDivUp(
          totalSupply(),
          currentPosition * PERCENTAGE_PRECISION
        );
        _mint(feeReceiver, sharesToMint);
      }
    }
  }

  /**
   * @dev Returns the maximum number of shares that can be minted.
   * @return maxShares The maximum number of shares.
   */
  function maxMint(address) external pure override returns (uint256 maxShares) {
    return type(uint256).max;
  }

  /**
   * @dev Returns the amount of assets that can be obtained for a given number of shares.
   * @param shares The number of shares to preview.
   * @return assets The amount of assets corresponding to the shares.
   */
  function previewMint(uint256 shares) external view override returns (uint256 assets) {
    assets = this.convertToAssets(shares);
  }

  /**
   * @dev Mints shares for the specified receiver in exchange for assets.
   * @param shares The number of shares to mint.
   * @param receiver The address of the receiver.
   * @return assets The amount of assets used to mint the shares.
   */
  function mint(
    uint256 shares,
    address receiver
  ) external override nonReentrant whenNotPaused onlyReceiverWhiteListed(receiver) returns (uint256 assets) {
    if (shares == 0) revert InvalidAmount();
    assets = this.convertToAssets(shares);
    IERC20Upgradeable(_asset()).safeTransferFrom(msg.sender, address(this), assets);
    _depositInternal(assets, receiver);
  }

  /**
   * @dev Returns the maximum amount of assets that can be deposited.
   * @return maxAssets The maximum amount of assets.
   */
  function maxDeposit(address) external pure override returns (uint256 maxAssets) {
    return type(uint256).max;
  }

  /**
   * @dev Returns the number of shares that can be obtained for a given amount of assets.
   * @param assets The amount of assets to preview.
   * @return shares The number of shares corresponding to the assets.
   */
  function previewDeposit(uint256 assets) external view override returns (uint256 shares) {
    shares = this.convertToShares(assets);
  }

  /**
   * @dev Deposits native ETH into the vault, wrapping it in WETH.
   * @param receiver The address of the receiver.
   * @return shares The number of shares minted for the deposit.
   */
  function depositNative(
    address receiver
  ) external payable nonReentrant whenNotPaused onlyReceiverWhiteListed(receiver) returns (uint256 shares) {
    if (msg.value == 0) revert InvalidAmount();
    if (_asset() != wETHA()) revert InvalidAsset();
    //  Wrap ETH
    wETHA().functionCallWithValue(abi.encodeWithSignature("deposit()"), msg.value);
    return _depositInternal(msg.value, receiver);
  }

  /**
   * @dev Deposits the specified amount of assets into the vault.
   * @param assets The amount of assets to deposit.
   * @param receiver The address of the receiver.
   * @return shares The number of shares minted for the deposit.
   */
  function deposit(
    uint256 assets,
    address receiver
  ) external override nonReentrant whenNotPaused onlyReceiverWhiteListed(receiver) returns (uint256 shares) {
    if (assets == 0) revert InvalidAmount();
    IERC20Upgradeable(_asset()).safeTransferFrom(msg.sender, address(this), assets);
    return _depositInternal(assets, receiver);
  }

  /**
   * @dev Internal function to handle the deposit logic.
   * @param assets The amount of assets to deposit.
   * @param receiver The address of the receiver.
   * @return shares The number of shares minted for the deposit.
   */
  function _depositInternal(uint256 assets, address receiver) private returns (uint256 shares) {
    if (receiver == address(0)) revert InvalidReceiver();
    // Fetch price options from settings
    // Get the total assets and total supply
    Rebase memory total = Rebase(totalAssets(), totalSupply());

    // Check if the Rebase is uninitialized or both base and elastic are positive
    if (!((total.elastic == 0 && total.base == 0) || (total.base > 0 && total.elastic > 0))) {
      revert InvalidAssetsState();
    }

    // Check if deposit exceeds the maximum allowed per wallet
    uint256 maxDepositLocal = getMaxDeposit();
    if (maxDepositLocal > 0) {
      uint256 depositInAssets = (balanceOf(receiver) * _ONE) / tokenPerAsset();
      uint256 newBalance = assets + depositInAssets;
      if (newBalance > maxDepositLocal) revert MaxDepositReached();
    }

    uint256 deployedAmount = _deploy(assets);

    // Calculate shares to mint
    shares = total.toBase(deployedAmount, false);

    // Prevent inflation attack for the first deposit
    if (total.base == 0 && shares < _MINIMUM_SHARE_BALANCE) {
      revert InvalidShareBalance();
    }

    // Mint shares to the receiver
    _mint(receiver, shares);

    // Emit deposit event
    emit Deposit(msg.sender, receiver, assets, shares);
  }

  /**
   * @dev Returns the maximum amount of assets that can be withdrawn by a shareholder.
   * @param shareHolder The address of the shareholder.
   * @return maxAssets The maximum amount of assets that can be withdrawn.
   */
  function maxWithdraw(address shareHolder) external view override returns (uint256 maxAssets) {
    maxAssets = this.convertToAssets(balanceOf(shareHolder));
  }

  /**
   * @dev Returns the number of shares that can be obtained for a given amount of assets.
   * @param assets The amount of assets to preview.
   * @return shares The number of shares corresponding to the assets.
   */
  function previewWithdraw(uint256 assets) external view override returns (uint256 shares) {
    shares = this.convertToShares(assets);
  }

  /**
   * @dev Withdraws native ETH from the vault.
   * @param assets The amount of assets to withdraw.
   * @return shares The number of shares burned for the withdrawal.
   */
  function withdrawNative(
    uint256 assets
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 shares) {
    if (_asset() != wETHA()) revert InvalidAsset();
    shares = this.convertToShares(assets);
    _redeemInternal(shares, msg.sender, msg.sender, true);
  }

  /**
   * @dev Redeems native ETH from the vault for the specified number of shares.
   * @param shares The number of shares to redeem.
   * @return assets The amount of assets withdrawn.
   */
  function redeemNative(
    uint256 shares
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 assets) {
    if (_asset() != wETHA()) revert InvalidAsset();
    assets = _redeemInternal(shares, msg.sender, msg.sender, true);
  }

  /**
   * @dev Withdraws the specified amount of assets from the vault.
   * @param assets The amount of assets to withdraw.
   * @param receiver The address of the receiver.
   * @param holder The owner of the assets to withdraw.
   * @return shares The number of shares burned for the withdrawal.
   */
  function withdraw(
    uint256 assets,
    address receiver,
    address holder
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 shares) {
    shares = this.convertToShares(assets);
    return _redeemInternal(shares, receiver, holder, false);
  }

  /**
   * @dev Returns the maximum number of shares that can be redeemed by a shareholder.
   * @param shareHolder The address of the shareholder.
   * @return maxShares The maximum number of shares that can be redeemed.
   */
  function maxRedeem(address shareHolder) external view override returns (uint256 maxShares) {
    maxShares = balanceOf(shareHolder);
  }

  /**
   * @dev Returns the amount of assets that can be obtained for a given number of shares.
   * @param shares The number of shares to preview.
   * @return assets The amount of assets corresponding to the shares.
   */
  function previewRedeem(uint256 shares) external view override returns (uint256 assets) {
    assets = this.convertToAssets(shares);
  }

  /**
   * @dev Redeems the specified number of shares for assets.
   * @param shares The number of shares to redeem.
   * @param receiver The address of the receiver.
   * @param holder The owner of the shares to redeem.
   * @return retAmount The amount of assets received after redemption.
   */
  function redeem(
    uint256 shares,
    address receiver,
    address holder
  ) external override nonReentrant onlyWhiteListed whenNotPaused returns (uint256 retAmount) {
    return _redeemInternal(shares, receiver, holder, false);
  }

  /**
   * @dev Internal function to handle the redemption logic.
   * @param shares The number of shares to redeem.
   * @param receiver The address of the receiver.
   * @param holder The owner of the shares to redeem.
   * @param shouldRedeemETH Whether to redeem as ETH.
   * @return retAmount The amount of assets received after redemption.
   */
  function _redeemInternal(
    uint256 shares,
    address receiver,
    address holder,
    bool shouldRedeemETH
  ) private returns (uint256 retAmount) {
    if (shares == 0) revert InvalidAmount();
    if (receiver == address(0)) revert InvalidReceiver();
    if (balanceOf(holder) < shares) revert NotEnoughBalanceToWithdraw();

    // Transfer shares to the contract if sender is not the holder
    if (msg.sender != holder) {
      if (allowance(holder, msg.sender) < shares) revert NoAllowance();
      transferFrom(holder, msg.sender, shares);
    }

    // Calculate the amount to withdraw based on shares
    uint256 withdrawAmount = (shares * totalAssets()) / totalSupply();
    if (withdrawAmount == 0) revert NoAssetsToWithdraw();

    uint256 amount = _undeploy(withdrawAmount);
    uint256 fee = 0;
    uint256 remainingShares = totalSupply() - shares;

    // Ensure a minimum number of shares are maintained to prevent ratio distortion
    if (remainingShares < _MINIMUM_SHARE_BALANCE && remainingShares != 0) {
      revert InvalidShareBalance();
    }

    _burn(msg.sender, shares);

    // Calculate and handle withdrawal fees
    if (getWithdrawalFee() != 0 && getFeeReceiver() != address(0)) {
      fee = amount.mulDivUp(getWithdrawalFee(), PERCENTAGE_PRECISION);

      if (shouldRedeemETH && _asset() == wETHA()) {
        unwrapETH(amount);
        payable(receiver).sendValue(amount - fee);
        payable(getFeeReceiver()).sendValue(fee);
      } else {
        IERC20Upgradeable(_asset()).transfer(receiver, amount - fee);
        IERC20Upgradeable(_asset()).transfer(getFeeReceiver(), fee);
      }
    } else {
      if (shouldRedeemETH) {
        unwrapETH(amount);
        payable(receiver).sendValue(amount);
      } else {
        IERC20Upgradeable(_asset()).transfer(receiver, amount);
      }
    }

    emit Withdraw(msg.sender, receiver, holder, amount - fee, shares);
    retAmount = amount - fee;
  }

  /**
   * @dev Retrieves the total assets controlled/belonging to the vault.
   * @return amount The total assets under management by the strategy.
   */
  function totalAssets() public view override returns (uint256 amount) {
    amount = _totalAssets();
  }

  /**
   * @dev Converts the specified amount of ETH/ERC20 to shares.
   * @param assets The amount of assets to be converted to shares.
   * @return shares The calculated number of shares.
   */
  function convertToShares(uint256 assets) external view override returns (uint256 shares) {
    Rebase memory total = Rebase(totalAssets(), totalSupply());
    shares = total.toBase(assets, false);
  }

  /**
   * @dev Converts the specified number of shares to ETH/ERC20.
   * @param shares The number of shares to be converted to assets.
   * @return assets The calculated amount of assets.
   */
  function convertToAssets(uint256 shares) external view override returns (uint256 assets) {
    Rebase memory total = Rebase(totalAssets(), totalSupply());
    assets = total.toElastic(shares, false);
  }

  /**
   * @dev Returns the address of the asset being managed by the vault.
   * @return The address of the asset.
   */
  function asset() external view override returns (address) {
    return _asset();
  }

  /**
   * @dev Retrieves the token-to-Asset exchange rate.
   * @return rate The calculated token-to-ETH exchange rate.
   */
  function tokenPerAsset() public view returns (uint256) {
    uint256 totalAssetsValue = totalAssets();

    if (totalSupply() == 0 || totalAssetsValue == 0) {
      return _ONE;
    }

    return (totalSupply() * _ONE) / totalAssetsValue;
  }

  /**
   * @dev Pauses the Contract.
   * Only the Owner is able to pause the vault.
   * When the contract is paused, deposit, withdraw, and rebalance cannot be called without reverting.
   */
  function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
  }

  /**
   * @dev Unpauses the contract.
   * Only the Owner is able to unpause the vault.
   */
  function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   */
  uint256[100] private __gap;
}
