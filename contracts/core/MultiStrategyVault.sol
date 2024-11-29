// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Ownable2StepUpgradeable } from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { Rebase, RebaseLibrary } from "../libraries/RebaseLibrary.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { IVault } from "../interfaces/core/IVault.sol";
import { IStrategy } from "../interfaces/core/IStrategy.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { PERCENTAGE_PRECISION } from "./Constants.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { UseWETH } from "./hooks/UseWETH.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { AddressUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import { MathLibrary } from "../libraries/MathLibrary.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { VaultSettings } from "./VaultSettings.sol";
import { MultiStrategy } from "./MultiStrategy.sol";

/**
 * @title BakerFi Vault 🏦🧑‍🍳
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev The BakerFi vault deployed to any supported chain (Arbitrum One, Optimism, Ethereum,...)
 *
 * This is smart contract where the users deposit their ETH or an ERC-20 and receives a share of the pool <x>brETH.
 * A share of the pool is an ERC-20 Token (transferable) and could be used to later to withdraw their
 * owned amount of the pool that could contain (Assets + Yield). This vault could use a customized IStrategy
 * to deploy the capital and harvest an yield.
 *
 * The Contract is able to charge a performance and withdraw fee that is send to the treasury
 * owned account when the fees are set by the deploy owner.
 *
 * The Vault is Pausable by the the governor and is using the settings contract to retrieve base
 * performance, withdraw fees and other kind of settings.
 *
 * During the beta phase only whitelisted addresses are able to deposit and withdraw
 *
 * The Contract is upgradeable and can use a BakerProxy in front of.
 *
 * The Vault follows the ERC-4626 Specification and can be integrated by any Aggregator
 *
 */
contract MultiStrategyVault is
  Ownable2StepUpgradeable,
  PausableUpgradeable,
  ReentrancyGuardUpgradeable,
  ERC20Upgradeable,
  VaultSettings,
  UseWETH,
  AccessControlUpgradeable,
  MultiStrategy,
  IVault
{
  using RebaseLibrary for Rebase;
  using SafeERC20Upgradeable for IERC20Upgradeable;
  using AddressUpgradeable for address;
  using AddressUpgradeable for address payable;
  using MathLibrary for uint256;

  error InvalidAmount();
  error InvalidAssetsState();
  error MaxDepositReached();
  error NotEnoughBalanceToWithdraw();
  error InvalidWithdrawAmount();
  error NoAssetsToWithdraw();
  error NoPermissions();
  error InvalidShareBalance();
  error InvalidAsset();
  error InvalidReceiver();
  error NoAllowance();

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  uint256 private constant _MINIMUM_SHARE_BALANCE = 1000;
  uint256 private constant _ONE = 1e18;

  /**
   * @dev The IStrategy contract representing the strategy for deploying/undeploying assets.
   *
   * This private state variable holds the reference to the IStrategy contract,
   * which defines the strategy for managing assets within the current contract.
   */

  address internal _asset;
  /**
   * @dev Modifier to restrict access to addresses that are whitelisted.
   *
   * This modifier ensures that only addresses listed in the account whitelist
   * within the contract's settings are allowed to proceed with the function call.
   * If the caller's address is not whitelisted, the function call will be rejected.
   */
  modifier onlyWhiteListed() {
    if (!isAccountEnabled(msg.sender)) revert NoPermissions();
    _;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  receive() external payable override {
    if (msg.sender != wETHA()) revert ETHTransferNotAllowed(msg.sender);
  }

  /**
   * @dev Initializes the contract with specified parameters.
   *
   * This function is designed to be called only once during the contract deployment.
   * It sets up the initial state of the contract, including ERC20 and ERC20Permit
   * initializations, ownership transfer, and configuration of the VaultRegistry
   * and Strategy.
   *
   * @param initialOwner The address that will be set as the initial owner of the contract.
   * @param tokenName The name of the token.
   * @param tokenSymbol The symbol of the token.
   * @param iAsset The asset to be set as the asset for this contract.
   * @param istrategies The IStrategy contracts to be set as the strategies for this contract.
   * @param iweights The weights of the strategies.
   * @param weth The WETH contract to be set as the WETH for this contract.

   * Emits an {OwnershipTransferred} event and initializes ERC20 and ERC20Permit features.
   * It also ensures that the initialOwner is a valid address and sets up the VaultRegistry
   * and Strategy for the contract.
   */
  function initialize(
    address initialOwner,
    string calldata tokenName,
    string calldata tokenSymbol,
    address iAsset,
    IStrategy[] memory istrategies,
    uint16[] memory iweights,
    address weth
  ) public initializer {
    __ERC20_init(tokenName, tokenSymbol);
    _initUseWETH(weth);
    __AccessControl_init();
    if (initialOwner == address(0)) revert InvalidOwner();
    _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
    _grantRole(PAUSER_ROLE, initialOwner);
    _initializeVaultSettings();
    _transferOwnership(initialOwner);
    _initMultiStrategy(istrategies, iweights);
    _asset = iAsset;

    for (uint256 i = 0; i < istrategies.length; i++) {
      // Check if the strategy asset is the same as the asset of the vault
      if (istrategies[i].asset() != iAsset) revert InvalidAsset();
      // Approve the strategies to spend assets that are deposited in the vault
      IERC20Upgradeable(iAsset).safeApprove(address(istrategies[i]), type(uint256).max);
    }
  }

  /**
   * @dev Function to rebalance the strategy, prevent a liquidation and pay fees
   * to protocol by minting shares to the fee receiver
   *
   * This function is externally callable and is marked as non-reentrant.
   * It triggers the harvest operation on the strategy, calculates the balance change,
   * and applies performance fees if applicable.
   *
   * @return balanceChange The change in balance after the rebalance operation.
   *
   */
  function rebalance() external override nonReentrant whenNotPaused returns (int256 balanceChange) {
    uint256 currentPosition = _totalAssets();

    if (currentPosition == 0) {
      return 0;
    }

    balanceChange = _harvestStrategies();

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
    _rebalanceStrategies();

    return balanceChange;
  }

  /**
   * @dev Function to calculate the maximum number of shares that can be minted.
   *
   * This function returns the maximum possible value for shares, which is the maximum value of uint256.
   *
   * @return maxShares The maximum number of shares that can be minted.
   */
  function maxMint(address) external pure override returns (uint256 maxShares) {
    return type(uint256).max;
  }

  /**
   * @dev Function to calculate the maximum number of assets that can be minted.
   *
   * This function returns the maximum possible value for assets, which is the maximum value of uint256.
   *
   * @param shares The number of shares to be converted to assets.
   * @return assets The number of assets that can be minted for the specified shares.
   */
  function previewMint(uint256 shares) external view override returns (uint256 assets) {
    assets = this.convertToAssets(shares);
  }

  /**
   * @dev Function to mint shares to the receiver.
   *
   * This function is externally callable, marked as non-reentrant, and restricted
   * to whitelisted addresses. It checks for sufficient balance, non-zero share amount,
   * and undeploy the capital from the strategy to handle the withdrawal request. It calculates withdrawal fees, transfers Ether to the caller, and burns the
   * withdrawn shares.
   *
   * @param shares The number of shares to be minted.
   * @param receiver The address to receive the minted shares.
   * @return assets The number of assets minted for the specified receiver.
   */
  function mint(
    uint256 shares,
    address receiver
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 assets) {
    if (shares == 0) revert InvalidAmount();
    assets = this.convertToAssets(shares);
    IERC20Upgradeable(_asset).safeTransferFrom(msg.sender, address(this), assets);
    _depositInternal(assets, receiver);
  }

  /**
   * @dev Function to calculate the maximum number of assets that can be deposited.
   *
   * This function returns the maximum possible value for assets, which is the maximum value of uint256.
   *
   * @return maxAssets The maximum number of assets that can be deposited.
   */
  function maxDeposit(address) external pure override returns (uint256 maxAssets) {
    return type(uint256).max;
  }

  /**
   * @dev Function to calculate the number of shares that can be minted for a given number of assets.
   *
   * This function converts the number of assets to shares.
   *
   * @param assets The number of assets to be converted to shares.
   * @return shares The number of shares that can be minted for the specified assets.
   */
  function previewDeposit(uint256 assets) external view override returns (uint256 shares) {
    shares = this.convertToShares(assets);
  }

  /**
   * @dev Function to deposit ETH into the vault and mint shares for the specified receiver.
   *
   * This function is externally callable, marked as non-reentrant, and could be restricted
   * to whitelisted addresses. It wraps ETH into WETH and then calls the internal deposit function.
   *
   * @param receiver The address to receive the minted shares.
   * @return shares The number of shares minted for the specified receiver.
   */
  function depositNative(
    address receiver
  ) external payable nonReentrant whenNotPaused onlyWhiteListed returns (uint256 shares) {
    if (msg.value == 0) revert InvalidAmount();
    if (_asset != wETHA()) revert InvalidAsset();
    //  Wrap ETH
    wETHA().functionCallWithValue(abi.encodeWithSignature("deposit()"), msg.value);
    return _depositInternal(msg.value, receiver);
  }

  /**
   * @dev Function to deposit assets into the vault.
   *
   * This function transfers the specified number of assets from the caller to the vault,
   * and then calls the internal deposit function to handle the deposit process.
   *
   * @param assets The number of assets to be deposited.
   * @param receiver The address to receive the minted shares.
   * @return shares The number of shares minted for the specified receiver.
   */
  function deposit(
    uint256 assets,
    address receiver
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 shares) {
    if (assets == 0) revert InvalidAmount();
    // Get the residual balance of the asset in the vault , the residual balance could be
    // a side effect of a previous rebalance strategies
    uint256 residualBalance = IERC20Upgradeable(_asset).balanceOf(address(this));
    // Transfer the assets from the sender to the vault
    IERC20Upgradeable(_asset).safeTransferFrom(msg.sender, address(this), assets);
    // Deposit the assets to the vault
    return _depositInternal(assets + residualBalance, receiver);
  }

  /**
   * @dev Function to get the total assets of the vault.
   *
   * This function returns the total assets of the vault.
   *
   * @return amount The total assets of the vault.
   */
  function totalAssets() external view override returns (uint256 amount) {
    amount = _totalAssets();
  }

  /**
   * @dev Deposits Ether into the contract and mints vault's shares for the specified receiver.
   *
   * This function is externally callable, marked as non-reentrant, and could be restricted
   * to whitelisted addresses. It performs various checks, including verifying that
   * the deposited amount is valid, the Rebase state is initialized, and executes
   * the strategy's `deploy` function to handle the deposit.
   *
   * @param receiver The address to receive the minted shares.
   * @return shares The number of shares minted for the specified receiver.
   */
  function _depositInternal(uint256 assets, address receiver) private returns (uint256 shares) {
    if (receiver == address(0)) revert InvalidReceiver();
    // Fetch price options from settings
    // Get the total assets and total supply
    Rebase memory total = Rebase(_totalAssets(), totalSupply());

    // Check if the Rebase is uninitialized or both base and elastic are positive
    if (!((total.elastic == 0 && total.base == 0) || (total.base > 0 && total.elastic > 0))) {
      revert InvalidAssetsState();
    }

    // Check if deposit exceeds the maximum allowed per wallet
    uint256 maxDepositLocal = getMaxDeposit();
    if (maxDepositLocal > 0) {
      uint256 depositInAssets = (balanceOf(msg.sender) * _ONE) / tokenPerAsset();
      uint256 newBalance = assets + depositInAssets;
      if (newBalance > maxDepositLocal) revert MaxDepositReached();
    }

    // Deploy assets via the strategy
    uint256 deployedAmount = _allocateAssets(assets);

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
   * @dev Function to calculate the maximum number of assets that can be withdrawn.
   *
   * This function converts the balance of shares to assets.
   *
   * @param shareHolder The address holding the shares.
   * @return maxAssets The maximum number of assets that can be withdrawn.
   */
  function maxWithdraw(address shareHolder) external view override returns (uint256 maxAssets) {
    maxAssets = this.convertToAssets(balanceOf(shareHolder));
  }

  /**
   * @dev Function to calculate the number of shares that can be withdrawn for a given number of assets.
   *
   * This function converts the number of assets to shares.
   *
   * @param assets The number of assets to be converted to shares.
   * @return shares The number of shares that can be withdrawn for the specified assets.
   */
  function previewWithdraw(uint256 assets) external view override returns (uint256 shares) {
    shares = this.convertToShares(assets);
  }

  /**
   * @dev Function to withdraw assets from the vault in ETH.
   *
   * This function converts the number of assets to shares and redeems them.
   *
   * @param assets The number of assets to be withdrawn.
   * @return shares The number of shares redeemed for the specified assets.
   */
  function withdrawNative(
    uint256 assets
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 shares) {
    if (_asset != wETHA()) revert InvalidAsset();
    shares = this.convertToShares(assets);
    _redeemInternal(shares, msg.sender, msg.sender, true);
  }

  /**
   * @dev Function to redeem shares for assets.
   *
   * This function converts the number of shares to assets.
   *
   * @param shares The number of shares to be redeemed.
   * @return assets The number of assets redeemed for the specified shares.
   */
  function redeemNative(
    uint256 shares
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 assets) {
    if (_asset != wETHA()) revert InvalidAsset();
    assets = _redeemInternal(shares, msg.sender, msg.sender, true);
  }

  /**
   *
   * Withdraw the Assets from the vault. The withdraw function burns shares to the msg.sender or delegated to msg.sender
   *
   * @param assets The amount of assets you were able to withdraw
   * @param receiver the receiver account of shares
   * @param holder Ther owner the assets to deposit
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
   * @dev Function to calculate the maximum number of shares that can be redeemed.
   *
   * This function returns the maximum number of shares that can be redeemed by the specified holder.
   *
   * @param shareHolder The address holding the shares.
   * @return maxShares The maximum number of shares that can be redeemed.
   */
  function maxRedeem(address shareHolder) external view override returns (uint256 maxShares) {
    maxShares = balanceOf(shareHolder);
  }

  /**
   * @dev Function to calculate the number of assets that can be redeemed for a given number of shares.
   *
   * This function converts the number of shares to assets.
   *
   * @param shares The number of shares to be converted to assets.
   * @return assets The number of assets that can be redeemed for the specified shares.
   */
  function previewRedeem(uint256 shares) external view override returns (uint256 assets) {
    assets = this.convertToAssets(shares);
  }

  /**
   * @dev Withdraws a specified number of vault's shares, converting them to ETH/ERC-20 and
   * transferring to the caller.
   *
   * This function is externally callable, marked as non-reentrant, and restricted to whitelisted addresses.
   * It checks for sufficient balance, non-zero share amount, and undeploy the capital from the strategy
   * to handle the withdrawal request. It calculates withdrawal fees, transfers Ether to the caller, and burns the
   * withdrawn shares.
   *
   * @param shares The number of shares to be withdrawn.
   * @return retAmount The amount of ETH/ERC20 withdrawn after fees.
   *
   * Emits a {Withdraw} event after successfully handling the withdrawal.
   */
  function redeem(
    uint256 shares,
    address receiver,
    address holder
  ) external override nonReentrant onlyWhiteListed whenNotPaused returns (uint256 retAmount) {
    return _redeemInternal(shares, receiver, holder, false);
  }

  /**
   * @dev Withdraws a specified number of vault's shares, converting them to ETH/ERC20 and
   * transferring to the caller.
   *
   * This function is externally callable, marked as non-reentrant, and restricted to whitelisted addresses.
   * It checks for sufficient balance, non-zero share amount, and undeploy the capital from the strategy
   * to handle the withdrawal request. It calculates withdrawal fees, transfers Ether to the caller, and burns the
   * withdrawn shares.
   *
   * @param shares The number of shares to be withdrawn.
   * @return retAmount The amount of ETH/ERC20 withdrawn after fees.
   *
   * Emits a {Withdraw} event after successfully handling the withdrawal.
   */
  function _redeemInternal(
    uint256 shares,
    address receiver,
    address holder,
    bool shouldRedeemETH
  ) private returns (uint256 retAmount) {
    if (shares == 0) revert InvalidWithdrawAmount();
    if (receiver == address(0)) revert InvalidReceiver();
    if (balanceOf(holder) < shares) revert NotEnoughBalanceToWithdraw();

    // Transfer shares to the contract if sender is not the holder
    if (msg.sender != holder) {
      if (allowance(holder, msg.sender) < shares) revert NoAllowance();
      transferFrom(holder, msg.sender, shares);
    }

    // Calculate the amount to withdraw based on shares
    uint256 withdrawAmount = (shares * _totalAssets()) / totalSupply();
    if (withdrawAmount == 0) revert NoAssetsToWithdraw();

    uint256 amount = _deallocateAssets(withdrawAmount);
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

      if (shouldRedeemETH) {
        unwrapETH(amount);
        payable(receiver).sendValue(amount - fee);
        payable(getFeeReceiver()).sendValue(fee);
      } else {
        IERC20Upgradeable(_asset).transfer(receiver, amount - fee);
        IERC20Upgradeable(_asset).transfer(getFeeReceiver(), fee);
      }
    } else {
      if (shouldRedeemETH) {
        unwrapETH(amount);
        payable(receiver).sendValue(amount);
      } else {
        IERC20Upgradeable(_asset).transfer(receiver, amount);
      }
    }

    emit Withdraw(msg.sender, receiver, holder, amount - fee, shares);
    retAmount = amount - fee;
  }

  /**
   * @dev Converts the specified amount of ETH/ERC20 to shares.
   *
   * This function is externally callable and provides a view of the number of shares that
   * would be equivalent to the given amount of assets based on the current Vault and Strategy state.
   *
   * @param assets The amount of assets to be converted to shares.
   * @return shares The calculated number of shares.
   */
  function convertToShares(uint256 assets) external view override returns (uint256 shares) {
    Rebase memory total = Rebase(_totalAssets(), totalSupply());
    shares = total.toBase(assets, false);
  }

  /**
   * @dev Converts the specified number of shares to ETH/ERC20.
   *
   * This function is externally callable and provides a view of the amount of assets that
   * would be equivalent to the given number of shares based on the current Rebase state.
   *
   * @param shares The number of shares to be converted to assets.
   * @return assets The calculated amount of assets.
   */
  function convertToAssets(uint256 shares) external view override returns (uint256 assets) {
    Rebase memory total = Rebase(_totalAssets(), totalSupply());
    assets = total.toElastic(shares, false);
  }

  /**
   * @dev Retrieves the token-to-Asset exchange rate.
   *
   * This function is externally callable and provides a view of the current exchange rate
   * between the token and ETH/ERC20. It calculates the rate based on the total supply of the token
   * and the total assets under management by the strategy.
   *
   *   brETHSupply  ------   DeployedETH
   *   tokenPerAsset  ------   1 ETH/ERC20
   *
   *   x = SupplybrETH * 1ETH / Deployed ETH
   *
   * @return rate The calculated token-to-ETH exchange rate.
   */
  function tokenPerAsset() public view returns (uint256) {
    uint256 totalAssetsValue = _totalAssets();

    if (totalSupply() == 0 || totalAssetsValue == 0) {
      return _ONE;
    }

    return (totalSupply() * _ONE) / totalAssetsValue;
  }

  /**
   * @dev Function to get the asset token address of the vault.
   *
   * This function returns the asset token address of the vault.
   *
   * @return The asset token address of the vault.
   */
  function asset() external view override returns (address) {
    return _asset;
  }

  /**
   * @dev Pauses the Contract
   *
   * Only the Owner is ablet to pause the vault.
   *
   * When the contract is paused the deposit, withdraw and rebalance could not be called without
   * a revert
   *
   */
  function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
  }

  /**
     * @dev Unpauses the contract

     * Only the Owner is ablet to unpause the vault.
     *
     */
  function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   */
  uint256[50] private __gap;
}
