// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Ownable2StepUpgradeable } from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { Rebase, RebaseLibrary } from "../libraries/RebaseLibrary.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { ServiceRegistry, WETH_CONTRACT } from "../core/ServiceRegistry.sol";
import { IVault } from "../interfaces/core/IVault.sol";
import { IOracle } from "../interfaces/core/IOracle.sol";
import { IStrategy } from "../interfaces/core/IStrategy.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { PERCENTAGE_PRECISION } from "./Constants.sol";
import { ERC20PermitUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import { UseSettings } from "./hooks/UseSettings.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { AddressUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import { MathLibrary } from "../libraries/MathLibrary.sol";
import { IWETH } from "../interfaces/tokens/IWETH.sol";

/**
 * @title BakerFi Vault 🏦🧑‍🍳
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev The BakerFi vault deployed to any supported chain (Arbitrum One, Optimism, Ethereum,...)
 *
 * This is smart contract where the users deposit their ETH and receives a share of the pool <x>brETH.
 * A share of the pool is an ERC-20 Token (transferable) and could be used to later to withdraw their
 * owned amount of the pool that could contain (Assets + Yield ). This vault could use a customized IStrategy
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
 */
contract Vault is
  Ownable2StepUpgradeable,
  PausableUpgradeable,
  ReentrancyGuardUpgradeable,
  ERC20PermitUpgradeable,
  UseSettings,
  IVault
{
  using RebaseLibrary for Rebase;
  using SafeERC20Upgradeable for IERC20Upgradeable;
  using AddressUpgradeable for address;
  using AddressUpgradeable for address payable;
  using MathLibrary for uint256;

  error InvalidOwner();
  error InvalidDepositAmount();
  error InvalidAssetsState();
  error MaxDepositReached();
  error NotEnoughBalanceToWithdraw();
  error InvalidWithdrawAmount();
  error NoAssetsToWithdraw();
  error NoPermissions();
  error FailedAllowance();
  error InvalidShareBalance();
  error ETHTransferNotAllowed(address sender);
  error InvalidDepositAsset();
  error InvalidReceiver();
  error NoAllowance();

  uint256 private constant _MINIMUM_SHARE_BALANCE = 1000;
  uint256 private constant _ONE = 1e18;

  /**
   * @dev The IStrategy contract representing the strategy for managing assets.
   *
   * This private state variable holds the reference to the IStrategy contract,
   * which defines the strategy for managing assets within the current contract.
   */
  IStrategy private _strategy;

  IWETH private _wETH;

  uint8 constant VAULT_VERSION = 2;

  /**
   * @dev Modifier to restrict access to addresses that are whitelisted.
   *
   * This modifier ensures that only addresses listed in the account whitelist
   * within the contract's settings are allowed to proceed with the function call.
   * If the caller's address is not whitelisted, the function call will be rejected.
   */
  modifier onlyWhiteListed() {
    if (!settings().isAccountEnabled(msg.sender)) revert NoPermissions();
    _;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /**
   * @dev Initializes the contract with specified parameters.
   *
   * This function is designed to be called only once during the contract deployment.
   * It sets up the initial state of the contract, including ERC20 and ERC20Permit
   * initializations, ownership transfer, and configuration of the ServiceRegistry
   * and Strategy.
   *
   * @param initialOwner The address that will be set as the initial owner of the contract.
   * @param registry The ServiceRegistry contract to be associated with this contract.
   * @param strategy The IStrategy contract to be set as the strategy for this contract.
   *
   * Emits an {OwnershipTransferred} event and initializes ERC20 and ERC20Permit features.
   * It also ensures that the initialOwner is a valid address and sets up the ServiceRegistry
   * and Strategy for the contract.
   */
  function initialize(
    address initialOwner,
    string calldata tokenName,
    string calldata tokenSymbol,
    ServiceRegistry registry,
    IStrategy strategy
  ) public initializer {
    __ERC20Permit_init(tokenName);
    __ERC20_init(tokenName, tokenSymbol);
    _wETH = IWETH(registry.getServiceFromHash(WETH_CONTRACT));
    if (initialOwner == address(0)) revert InvalidOwner();
    _transferOwnership(initialOwner);
    _initUseSettings(registry);
    _strategy = strategy;
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
    uint256 maxPriceAge = settings().getRebalancePriceMaxAge();
    uint256 maxPriceConf = settings().getPriceMaxConf();
    uint256 currentPos = _totalAssets(
      IOracle.PriceOptions({ maxAge: maxPriceAge, maxConf: maxPriceConf })
    );
    if (currentPos > 0) {
      balanceChange = _strategy.harvest();
      if (balanceChange > 0) {
        if (
          settings().getFeeReceiver() != address(this) &&
          settings().getFeeReceiver() != address(0) &&
          settings().getPerformanceFee() > 0
        ) {
          /**
           *   feeInEth       -------------- totalAssets()
           *   sharesToMint   -------------- totalSupply()
           *
           *   sharesToMint = feeInEth * totalSupply() / totalAssets();
           */
          uint256 feeInEthScaled = uint256(balanceChange) * settings().getPerformanceFee();
          uint256 sharesToMint = feeInEthScaled.mulDivUp(
            totalSupply(),
            totalAssets() * PERCENTAGE_PRECISION
          );
          _mint(settings().getFeeReceiver(), sharesToMint);
        }
      }
    }
  }

  /**
   * @dev Fallback function to receive Ether.
   *
   * This function is marked as external and payable. It is automatically called
   * when Ether is sent to the contract, such as during a regular transfer or as part
   * of a self-destruct operation.
   *
   * Only Transfers from the strategy during the withdraw are allowed
   *
   * Emits no events and allows the contract to accept Ether.
   */
  receive() external payable {
    if (msg.sender != address(_wETH)) revert ETHTransferNotAllowed(msg.sender);
  }

  function maxMint(address) external pure override returns (uint256 maxShares) {
    return type(uint256).max;
  }

  function previewMint(uint256 shares) external view override returns (uint256 assets) {
    assets = this.convertToAssets(shares);
  }

  function mint(
    uint256 shares,
    address receiver
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 assets) {
    if (shares == 0) revert InvalidDepositAmount();
    assets = this.convertToAssets(shares);
    IERC20Upgradeable(address(_wETH)).safeTransferFrom(msg.sender, address(this), assets);
    _depositInternal(assets, receiver);
  }

  function maxDeposit(address) external pure override returns (uint256 maxAssets) {
    return type(uint256).max;
  }

  function previewDeposit(uint256 assets) external view override returns (uint256 shares) {
    shares = this.convertToShares(assets);
  }

  function depositNative(
    address receiver
  ) external payable nonReentrant whenNotPaused onlyWhiteListed returns (uint256 shares) {
    if (msg.value == 0) revert InvalidDepositAmount();
    if (_strategy.asset() != address(_wETH)) revert InvalidDepositAsset();
    //  Wrap ETH
    address(_wETH).functionCallWithValue(abi.encodeWithSignature("deposit()"), msg.value);
    return _depositInternal(msg.value, receiver);
  }

  function deposit(
    uint256 assets,
    address receiver
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 shares) {
    if (assets == 0) revert InvalidDepositAmount();
    IERC20Upgradeable(address(_wETH)).safeTransferFrom(msg.sender, address(this), assets);
    return _depositInternal(assets, receiver);
  }

  /**
   * @dev Deposits Ether into the contract and mints vault's shares for the specified receiver.
   *
   * This function is externally callable, marked as non-reentrant, and restricted
   * to whitelisted addresses. It performs various checks, including verifying that
   * the deposited amount is valid, the Rebase state is initialized, and executes
   * the strategy's `deploy` function to handle the deposit.
   *
   * @param receiver The address to receive the minted shares.
   * @return shares The number of shares minted for the specified receiver.
   */
  function _depositInternal(uint256 assets, address receiver) private returns (uint256 shares) {
    uint256 maxPriceAge = settings().getPriceMaxAge();
    uint256 maxPriceConf = settings().getPriceMaxConf();
    if (receiver == address(0)) revert InvalidReceiver();
    Rebase memory total = Rebase(totalAssets(), totalSupply());
    if (
      // Or the Rebase is unititialized
      !((total.elastic == 0 && total.base == 0) ||
        // Or Both are positive
        (total.base > 0 && total.elastic > 0))
    ) revert InvalidAssetsState();
    // Verify if the Deposit Value exceeds the maximum per wallet
    uint256 maxDepositInEth = settings().getMaxDepositInETH();
    if (maxDepositInEth > 0) {
      uint256 afterDeposit = assets +
        ((balanceOf(msg.sender) * _ONE) /
          _tokenPerAsset(IOracle.PriceOptions({ maxAge: maxPriceAge, maxConf: maxPriceConf })));
      if (afterDeposit > maxDepositInEth) revert MaxDepositReached();
    }

    IERC20Upgradeable(address(_wETH)).safeApprove(address(_strategy), assets);
    uint256 deployedAmount = _strategy.deploy(assets);

    shares = total.toBase(deployedAmount, false);

    // Prevent First Deposit Inflation attack
    if (total.base == 0 && shares < _MINIMUM_SHARE_BALANCE) {
      revert InvalidShareBalance();
    }

    _mint(receiver, shares);
    emit Deposit(msg.sender, receiver, assets, shares);
  }

  function maxWithdraw(address shareHolder) external view override returns (uint256 maxAssets) {
    maxAssets = this.convertToAssets(balanceOf(shareHolder));
  }

  function previewWithdraw(uint256 assets) external view override returns (uint256 shares) {
    shares = this.convertToShares(assets);
  }

  function withdrawNative(
    uint256 assets
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 shares) {
    if (_strategy.asset() != address(_wETH)) revert InvalidDepositAsset();
    shares = this.convertToShares(assets);
    _redeemInternal(shares, msg.sender, msg.sender, true);
  }

  function redeemNative(
    uint256 shares
  ) external override nonReentrant whenNotPaused onlyWhiteListed returns (uint256 assets) {
    if (_strategy.asset() != address(_wETH)) revert InvalidDepositAsset();
    assets = _redeemInternal(shares, msg.sender, msg.sender, true);
  }

  /**
   *
   * Withdraw X Assets from the vault
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

  function maxRedeem(address shareHolder) external view override returns (uint256 maxShares) {
    maxShares = balanceOf(shareHolder);
  }

  function previewRedeem(uint256 shares) external view override returns (uint256 assets) {
    assets = this.convertToAssets(shares);
  }

  /**
   * @dev Withdraws a specified number of vault's shares, converting them to ETH and
   * transferring to the caller.
   *
   * This function is externally callable, marked as non-reentrant, and restricted to whitelisted addresses.
   * It checks for sufficient balance, non-zero share amount, and undeploy the capital from the strategy
   * to handle the withdrawal request. It calculates withdrawal fees, transfers Ether to the caller, and burns the
   * withdrawn shares.
   *
   * @param shares The number of shares to be withdrawn.
   * @return retAmount The amount of Ether withdrawn after fees.
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
   * @dev Withdraws a specified number of vault's shares, converting them to ETH and
   * transferring to the caller.
   *
   * This function is externally callable, marked as non-reentrant, and restricted to whitelisted addresses.
   * It checks for sufficient balance, non-zero share amount, and undeploy the capital from the strategy
   * to handle the withdrawal request. It calculates withdrawal fees, transfers Ether to the caller, and burns the
   * withdrawn shares.
   *
   * @param shares The number of shares to be withdrawn.
   * @return retAmount The amount of Ether withdrawn after fees.
   *
   * Emits a {Withdraw} event after successfully handling the withdrawal.
   */
  function _redeemInternal(
    uint256 shares,
    address receiver,
    address holder,
    bool shouldReddeemETH
  ) private returns (uint256 retAmount) {
    if (balanceOf(holder) < shares) revert NotEnoughBalanceToWithdraw();

    if (shares == 0) revert InvalidWithdrawAmount();

    if (receiver == address(0)) revert InvalidReceiver();

    // If the msg.sender is not the owner transfer the shares to vault to burn
    if (msg.sender != holder) {
      if (allowance(holder, msg.sender) < shares) {
        revert NoAllowance();
      }
      transferFrom(holder, msg.sender, shares);
    }
    /**
     *   withdrawAmount -------------- totalAssets()
     *   shares         -------------- totalSupply()
     *
     *   withdrawAmount = share * totalAssets() / totalSupply()
     */
    uint256 withdrawAmount = (shares * totalAssets()) / totalSupply();
    if (withdrawAmount == 0) revert NoAssetsToWithdraw();
    uint256 amount = _strategy.undeploy(withdrawAmount);
    uint256 fee = 0;
    uint256 afterShares = totalSupply() - shares;

    // There have to be at least 1000 shares left to prevent reseting the
    // share/amount ratio (unless it's fully emptied)
    if (afterShares != 0 && afterShares < _MINIMUM_SHARE_BALANCE) {
      revert InvalidShareBalance();
    }

    _burn(msg.sender, shares);
    // Withdraw Asset to Receiver and pay withdrawal Fees
    if (settings().getWithdrawalFee() != 0 && settings().getFeeReceiver() != address(0)) {
      fee = amount.mulDivUp(settings().getWithdrawalFee(), PERCENTAGE_PRECISION);
      if (shouldReddeemETH) {
        // Unwrap wETH
        _unwrapWETH(amount);
        // Withdraw ETh to Receiver
        payable(receiver).sendValue(amount - fee);
        payable(settings().getFeeReceiver()).sendValue(fee);
      } else {
        IERC20Upgradeable(_strategy.asset()).transfer(receiver, amount - fee);
        IERC20Upgradeable(_strategy.asset()).transfer(settings().getFeeReceiver(), fee);
      }
    } else {
      if (shouldReddeemETH) {
        _unwrapWETH(amount);
        payable(receiver).sendValue(amount);
      } else {
        IERC20Upgradeable(_strategy.asset()).transfer(receiver, amount);
      }
    }
    emit Withdraw(msg.sender, receiver, holder, amount - fee, shares);
    retAmount = amount - fee;
  }
  function _unwrapWETH(uint256 wETHAmount) internal {
    if (!IERC20Upgradeable(address(_wETH)).approve(address(_wETH), wETHAmount))
      revert FailedAllowance();
    _wETH.withdraw(wETHAmount);
  }

  /**
   * @dev Retrieves the total assets controlled/belonging to the vault
   *
   * This function is publicly accessible and provides a view of the total assets currently
   * deployed in the current strategy. This function uses the latest prices
   * and does not revert on outdated prices
   *
   * @return amount The total assets under management by the strategy.
   */
  function totalAssets() public view override returns (uint256 amount) {
    amount = _strategy.totalAssets(IOracle.PriceOptions({ maxAge: 0, maxConf: 0 }));
  }

  /**
   * @dev Retrieves the total assets and reverts when the prices are outdated and a priceAge is
   * bigger than 0.
   * @param priceOptions The maximum age of the price without reverting
   */
  function _totalAssets(
    IOracle.PriceOptions memory priceOptions
  ) private view returns (uint256 amount) {
    amount = _strategy.totalAssets(priceOptions);
  }
  /**
   * @dev Converts the specified amount of ETH to shares.
   *
   * This function is externally callable and provides a view of the number of shares that
   * would be equivalent to the given amount of assets based on the current Vault and Strategy state.
   *
   * @param assets The amount of assets to be converted to shares.
   * @return shares The calculated number of shares.
   */
  function convertToShares(uint256 assets) external view override returns (uint256 shares) {
    Rebase memory total = Rebase(totalAssets(), totalSupply());
    shares = total.toBase(assets, false);
  }

  /**
   * @dev Converts the specified number of shares to ETH.
   *
   * This function is externally callable and provides a view of the amount of assets that
   * would be equivalent to the given number of shares based on the current Rebase state.
   *
   * @param shares The number of shares to be converted to assets.
   * @return assets The calculated amount of assets.
   */
  function convertToAssets(uint256 shares) external view override returns (uint256 assets) {
    Rebase memory total = Rebase(totalAssets(), totalSupply());
    assets = total.toElastic(shares, false);
  }

  /**
   * @dev Retrieves the token-to-ETH exchange rate.
   *
   * This function is externally callable and provides a view of the current exchange rate
   * between the token and ETH. It calculates the rate based on the total supply of the token
   * and the total assets under management by the strategy.
   *
   *   brETHSupply  ------   DeployedETH
   *   tokenPerAsset  ------   1 ETH
   *
   *   x = SupplybrETH * 1ETH / Deployed ETH
   *
   * @return rate The calculated token-to-ETH exchange rate.
   */
  function tokenPerAsset() external view override returns (uint256) {
    return _tokenPerAsset(IOracle.PriceOptions({ maxAge: 0, maxConf: 0 }));
  }

  function _tokenPerAsset(
    IOracle.PriceOptions memory priceOptions
  ) internal view returns (uint256) {
    uint256 position = _totalAssets(priceOptions);
    if (totalSupply() == 0 || position == 0) {
      return 1 ether;
    }
    return (totalSupply() * 1 ether) / position;
  }

  function asset() external view override returns (address assetTokenAddress) {
    assetTokenAddress = _strategy.asset();
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
  function pause() external onlyOwner {
    _pause();
  }

  /**
     * @dev Unpauses the contract

     * Only the Owner is ablet to unpause the vault.
     *
     */
  function unpause() external onlyOwner {
    _unpause();
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   *
   */
  uint256[47] private __gap;
}
