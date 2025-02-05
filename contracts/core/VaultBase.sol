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
import { IERC20MetadataUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/* @title BakerFi Vault Base 🧑‍🍳
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev This contract serves as the base for the BakerFi Vault, providing core functionalities
 * for managing assets, deposits, withdrawals, and rebalancing strategies.
 * It inherits from several OpenZeppelin contracts to ensure security and upgradeability.
 */

contract EmptyAdapter {
  uint256[100] private _emptySlot;
}

contract EmptyAdapter2 {
  uint256[48] private _emptySlot;
}

abstract contract VaultBase is
  Initializable,
  EmptyAdapter,
  PausableUpgradeable,
  ReentrancyGuardUpgradeable,
  ERC20Upgradeable,
  VaultSettings,
  EmptyAdapter2,
  UseWETH,
  AccessControlUpgradeable,
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
  ) internal onlyInitializing {
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
   * @dev Returns the decimals of the share asset.
   * @return The decimals of the asset.
   */
  function decimals()
    public
    view
    override(ERC20Upgradeable, IERC20MetadataUpgradeable)
    returns (uint8)
  {
    return ERC20Upgradeable(_asset()).decimals();
  }

  /**
   * @dev Returns the decimals of the share asset.
   * @return The decimals of the asset.
   */
  function _ONE() private view returns (uint256) {
    return 10 ** decimals();
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
  function maxMint(address receiver) external view override returns (uint256 maxShares) {
    uint256 maxAssets = _maxDepositFor(receiver);
    maxShares = this.convertToShares(maxAssets);
    maxAssets == 0 || maxAssets == type(uint256).max
      ? maxAssets
      : _convertToShares(maxAssets, false);
  }

  /**
   * @dev Returns the amount of assets that can be obtained for a given number of shares.
   * @param shares The number of shares to preview.
   * @return assets The amount of assets corresponding to the shares.
   */
  function previewMint(uint256 shares) external view override returns (uint256 assets) {
    assets = _convertToAssets(shares, true);
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
  )
    external
    override
    nonReentrant
    whenNotPaused
    onlyReceiverWhiteListed(receiver)
    returns (uint256 assets)
  {
    if (shares == 0) revert InvalidAmount();
    assets = this.convertToAssets(shares);
    IERC20Upgradeable(_asset()).safeTransferFrom(msg.sender, address(this), assets);
    _depositInternal(assets, receiver);
  }

  /**
   * @dev Returns the maximum amount of assets that can be deposited.
   * @return maxAssets The maximum amount of assets.
   */
  function maxDeposit(address receiver) external view override returns (uint256 maxAssets) {
    return _maxDepositFor(receiver);
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
  )
    external
    payable
    nonReentrant
    whenNotPaused
    onlyReceiverWhiteListed(receiver)
    returns (uint256 shares)
  {
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
  )
    external
    override
    nonReentrant
    whenNotPaused
    onlyReceiverWhiteListed(receiver)
    returns (uint256 shares)
  {
    if (assets == 0) revert InvalidAmount();
    IERC20Upgradeable(_asset()).safeTransferFrom(msg.sender, address(this), assets);
    return _depositInternal(assets, receiver);
  }

  /**
   * @dev Returns the maximum amount of assets that can be deposited for a given receiver.
   * @param receiver The address of the receiver.
   * @return maxAssets The maximum amount of assets that can be deposited.
   */
  /**
   * @dev Calculates the maximum amount of assets that can be deposited for a given receiver.
   *
   * This function first retrieves the maximum deposit limit set for the vault.
   * It then calculates the current value of assets held by the receiver in terms of the vault's token.
   *
   * The steps are as follows:
   * 1. Retrieve the maximum deposit limit using the `getMaxDeposit()` function.
   * 2. Calculate the total value of assets held by the receiver by multiplying their share balance
   *    (obtained from `balanceOf(receiver)`) by a constant `_ONE`, and then dividing by the
   *    current token-to-asset exchange rate (obtained from `tokenPerAsset()`).
   * 3. If the maximum deposit limit is greater than zero, check if the current value of assets held
   *    by the receiver exceeds this limit. If it does, return 0, indicating no additional deposits
   *    can be made. Otherwise, return the difference between the maximum deposit limit and the
   *    current value of assets held by the receiver.
   * 4. If the maximum deposit limit is zero, return the maximum possible value for a uint256,
   *    indicating that there is no limit on deposits.
   */
  function _maxDepositFor(address receiver) internal view returns (uint256) {
    uint256 maxDepositLocal = getMaxDeposit();
    uint256 depositInAssets = _convertToAssets(balanceOf(receiver), false);
    if (paused()) return 0;
    if (maxDepositLocal > 0) {
      return depositInAssets > maxDepositLocal ? 0 : maxDepositLocal - depositInAssets;
    }
    return type(uint256).max;
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

    uint256 maxDepositForReceiver = _maxDepositFor(receiver);
    // Check if deposit exceeds the maximum allowed per the receiver
    if (maxDepositForReceiver == 0 || assets > maxDepositForReceiver) revert MaxDepositReached();

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
    if (paused()) return 0;
    maxAssets = this.convertToAssets(balanceOf(shareHolder));
  }

  /**
   * @dev Returns the number of shares that can be obtained for a given amount of assets.
   * @param assets The amount of assets to preview.
   * @return shares The number of shares corresponding to the assets.
   */
  function previewWithdraw(uint256 assets) external view override returns (uint256 shares) {
    uint256 fee = assets.mulDivUp(getWithdrawalFee(), PERCENTAGE_PRECISION);
    shares = _convertToShares(assets - fee, true);
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
    if (paused()) return 0;
    maxShares = balanceOf(shareHolder);
  }

  /**
   * @dev Returns the amount of assets that can be obtained for a given number of shares.
   * @param shares The number of shares to preview.
   * @return assets The amount of assets corresponding to the shares.
   */
  function previewRedeem(uint256 shares) external view override returns (uint256 assets) {
    assets = _convertToAssets(shares, true);
    uint256 fee = assets.mulDivUp(getWithdrawalFee(), PERCENTAGE_PRECISION);
    assets -= fee;
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
    return _convertToShares(assets, false);
  }

  /**
   * @dev Internal function to convert assets to shares.
   * @param assets The amount of assets to be converted to shares.
   * @return shares The calculated number of shares.
   */
  function _convertToShares(uint256 assets, bool roundUp) internal view returns (uint256 shares) {
    Rebase memory total = Rebase(totalAssets(), totalSupply());
    shares = total.toBase(assets, roundUp);
  }

  /**
   * @dev Converts the specified number of shares to ETH/ERC20.
   * @param shares The number of shares to be converted to assets.
   * @return assets The calculated amount of assets.
   */
  function convertToAssets(uint256 shares) external view override returns (uint256 assets) {
    return _convertToAssets(shares, false);
  }

  function _convertToAssets(uint256 shares, bool roundUp) internal view returns (uint256 assets) {
    Rebase memory total = Rebase(totalAssets(), totalSupply());
    assets = total.toElastic(shares, roundUp);
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
      return _ONE();
    }

    return (totalAssetsValue * _ONE()) / totalSupply();
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
   * @dev Enables or disables an account in the whitelist.
   *
   * This function can only be called by the owner and is used to enable or disable an account
   * in the whitelist. Emits an {AccountWhiteList} event upon successful update.
   *
   * @param account The address of the account to be enabled or disabled.
   * @param enabled A boolean indicating whether the account should be enabled (true) or disabled (false) in the whitelist.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   */
  function enableAccount(address account, bool enabled) external onlyRole(ADMIN_ROLE) {
    _enableAccount(account, enabled);
  }
  /**
   * @dev Sets the performance fee percentage.
   *
   * This function can only be called by the owner and is used to update the performance fee percentage.
   * Emits a {PerformanceFeeChanged} event upon successful update.
   *
   * @param fee The new performance fee percentage to be set.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   * - The new performance fee percentage must be a valid percentage value.
   */
  function setPerformanceFee(uint256 fee) external onlyRole(ADMIN_ROLE) {
    _harvestAndMintFees();
    _setPerformanceFee(fee);
  }
  /**
   * @dev Sets the withdrawal fee percentage.
   *
   * This function can only be called by the owner and is used to update the withdrawal fee percentage.
   * Emits a {WithdrawalFeeChanged} event upon successful update.
   *
   * @param fee The new withdrawal fee percentage to be set.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   * - The new withdrawal fee percentage must be a valid percentage value.
   */
  function setWithdrawalFee(uint256 fee) external onlyRole(ADMIN_ROLE) {
    _setWithdrawalFee(fee);
  }
  /**
   * @dev Sets the fee receiver address.
   *
   * This function can only be called by the owner and is used to update the fee receiver address.
   * Emits a {FeeReceiverChanged} event upon successful update.
   *
   * @param receiver The new fee receiver address to be set.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   * - The new fee receiver address must not be the zero address.
   */
  function setFeeReceiver(address receiver) external onlyRole(ADMIN_ROLE) {
    _setFeeReceiver(receiver);
  }
  /**
   * @notice Sets the maximum deposit allowed in ETH.
   * @param value The maximum deposit value to be set in ETH.
   */
  function setMaxDeposit(uint256 value) external onlyRole(ADMIN_ROLE) {
    _setMaxDeposit(value);
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   */
  uint256[100] private __gap;
}
