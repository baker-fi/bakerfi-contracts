// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC3156FlashBorrowerUpgradeable } from "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashBorrowerUpgradeable.sol";
import { ServiceRegistry } from "../../core/ServiceRegistry.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import { PERCENTAGE_PRECISION } from "../Constants.sol";
import { IOracle } from "../../interfaces/core/IOracle.sol";
import { ISwapHandler } from "../../interfaces/core/ISwapHandler.sol";
import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { UseLeverage } from "../hooks/UseLeverage.sol";
import { UseUniQuoter } from "../hooks/UseUniQuoter.sol";
import { UseSettings } from "../hooks/UseSettings.sol";
import { UseWETH } from "../hooks/UseWETH.sol";
import { UseFlashLender } from "../hooks/UseFlashLender.sol";
import { UseSwapper } from "../hooks/UseSwapper.sol";
import { UseIERC20 } from "../hooks/UseIERC20.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { AddressUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import { ETH_USD_ORACLE_CONTRACT } from "../ServiceRegistry.sol";
import { StrategyLeverageSettings } from "./StrategyLeverageSettings.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title Base Recursive Staking Strategy
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev This contract implements a strategy and could be used to deploy a ERC-20 on a AAVE with
 * the a recursive staking strategy and receive an amplified yield
 *
 * The Strategy interacts with :
 *
 * ✅ BalancerFlashLender to request a flash loan from Balancer
 * ✅ Uniswap to convert from collateral token to debt token
 * ✅ Uniswap Quoter to request a precise price token
 * ✅ AAVE as the lending/borrow market
 *
 * The APY of this strategy depends on the followwin factors:
 *
 *  ✅ Lido APY
 *  ✅ AAVE v3 Borrow Rate
 *  ✅ Target Loan to Value
 *  ✅ Number of Loops on the recursive Strategy
 *
 *  Flow Deposit:
 *  1) Deploy X amount of ETH
 *  2) Borrow Y Amount of ETH
 *  3) Deposit X+Y amount of Collateral in AAVE
 *  4) Borrow Y ETH From AAVE to pay the flash loan
 *  5) Ends up with X+Y Amount of Collateral and Y of Debt
 *
 *  This strategy could work for
 *  rETH/WETH
 *  wstETH/WETH
 *  ...
 *
 * @notice The Contract is abstract and needs to be extended to implement the
 * conversion between WETH and the collateral
 */
abstract contract StrategyLeverage is
  StrategyLeverageSettings,
  IStrategy,
  IERC3156FlashBorrowerUpgradeable,
  UseSwapper,
  UseFlashLender,
  ReentrancyGuardUpgradeable,
  UseLeverage,
  UseSettings
{
  enum FlashLoanAction {
    SUPPLY_BOORROW,
    PAY_DEBT_WITHDRAW,
    PAY_DEBT
  }

  struct FlashLoanData {
    uint256 originalAmount;
    address receiver;
    FlashLoanAction action;
  }

  bytes32 private constant _SUCCESS_MESSAGE = keccak256("ERC3156FlashBorrower.onFlashLoan");

  using SafeERC20Upgradeable for IERC20Upgradeable;
  using AddressUpgradeable for address;
  using AddressUpgradeable for address payable;

  error InvalidOwner();
  error InvalidDebtToken();
  error InvalidCollateralToken();
  error InvalidDebtOracle();
  error InvalidCollateralOracle();
  error InvalidDeployAmount();
  error InvalidAllowance();
  error FailedToRunFlashLoan();
  error InvalidFlashLoanSender();
  error InvalidLoanInitiator();
  error InvalidFlashLoanAsset();
  error CollateralLowerThanDebt();
  error InvalidDeltaDebt();
  error PriceOutdated();
  error NoCollateralMarginToScale();
  error ETHTransferNotAllowed(address sender);
  error FailedToApproveAllowance();
  error FailedToAuthenticateArgs();

  // Assets in USD Controlled by the strategy that can be unwinded
  uint256 private _deployedAssets = 0;
  // Collateral IERC20 Token used on this leverage Position
  address internal _collateralToken;
  // Debt IERC20 Token address used on this
  address internal _debtToken;
  // Collateral Price Oracle used for balance conversions to USD
  IOracle private _collateralOracle;
  // Debt Price Oracle used for balance conversions to USD
  IOracle private _debtOracle;
  // Swap tier used to convert between Collateral and Debt
  uint24 internal _swapFeeTier;
  // Internal Storaged used for flash loan parameter authentication
  bytes32 private _flashLoanArgsHash = 0;

  /**
   * @dev Internal function to initialize the AAVEv3 strategy base.
   *
   * This function is used for the initial setup of the AAVEv3 strategy base contract, including ownership transfer,
   * service registry initialization, setting oracles, configuring AAVEv3 parameters, and approving allowances.
   *
   * @param initialOwner The address to be set as the initial owner of the AAVEv3 strategy base contract.
   * @param registry The service registry contract address to be used for initialization.
   * @param collateralToken The hash representing the collateral ERC20 token in the service registry.
   * @param debtToken The hash representing the collateral/ETH oracle in the service registry.
   * @param collateralOracle The hash representing the collateral ERC20 token in the service registry.
   * @param debtOracle The hash representing the collateral/ETH oracle in the service registry.
   * @param swapFeeTier The swap fee tier for Uniswap.
   *
   * Requirements:
   * - The caller must be in the initializing state.
   * - The initial owner address must not be the zero address.
   * - The ETH/USD oracle and collateral/USD oracle addresses must be valid.
   * - Approval allowances must be successfully set for WETH and the collateral ERC20 token for UniSwap.
   */
  function _initializeStrategyBase(
    address initialOwner,
    address initialGovernor,
    ServiceRegistry registry,
    // Collateral Token Hash registered on service Registry
    bytes32 collateralToken,
    bytes32 debtToken,
    bytes32 collateralOracle,
    bytes32 debtOracle,
    uint24 swapFeeTier
  ) internal onlyInitializing {

    if (initialOwner == address(0)) revert InvalidOwner();

    _initLeverageSettings(initialOwner, initialGovernor);

    _initUseSwapper(registry);
    _initUseFlashLender(registry);
    _initUseSettings(registry);

    // Find the Tokens on Registry
    _collateralToken = registry.getServiceFromHash(collateralToken);
    _debtToken = registry.getServiceFromHash(debtToken);

    // Find the Oracles on the Registry
    _collateralOracle = IOracle(registry.getServiceFromHash(collateralOracle));
    _debtOracle = IOracle(registry.getServiceFromHash(debtOracle));

    _swapFeeTier = swapFeeTier;

    if (_collateralToken == address(0)) revert InvalidCollateralToken();
    if (_debtToken == address(0)) revert InvalidDebtToken();

    if (address(_collateralOracle) == address(0)) revert InvalidCollateralOracle();
    if (address(_debtOracle) == address(0)) revert InvalidDebtOracle();

    if (!IERC20Upgradeable(_collateralToken).approve(uniRouterA(), 2 ** 256 - 1)) revert FailedToApproveAllowance();
    if (!IERC20Upgradeable(_debtToken).approve(uniRouterA(), 2 ** 256 - 1)) revert FailedToApproveAllowance();
  }

  /**
   * @dev Fallback function to receive Ether.
   *
   *  This function is automatically called when the contract receives Ether
   *  without a specific function call.
   *
   *  It allows the contract to accept incoming Ether fromn the WETH contract
   */
  receive() external payable {
    if (msg.sender != _debtToken && msg.sender != _collateralToken) revert ETHTransferNotAllowed(msg.sender);
  }

  /**
   * @dev Retrieves the position details including total collateral, total debt, and loan-to-value ratio.
   *
   * This function is externally callable and returns the total collateral in Ether, total debt in USD,
   * and the loan-to-value ratio for the AAVEv3 strategy.
   *
   * @return totalCollateralInUSD The total collateral in USD.
   * @return totalDebtInUSD The total debt in USD.
   * @return loanToValue The loan-to-value ratio calculated as (totalDebtInUSD * PERCENTAGE_PRECISION) / totalCollateralInUSD.
   *
   * Requirements:
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function getPosition(
    IOracle.PriceOptions memory priceOptions
  )
    external
    view
    returns (uint256 totalCollateralInUSD, uint256 totalDebtInUSD, uint256 loanToValue)
  {
    (totalCollateralInUSD, totalDebtInUSD) = _getPosition(priceOptions);
    if (totalCollateralInUSD == 0) {
      loanToValue = 0;
    } else {
      loanToValue = (totalDebtInUSD * PERCENTAGE_PRECISION) / totalCollateralInUSD;
    }
  }

  /**
   * @dev Retrieves the total owned assets by the Strategy in USD
   *
   * This function is externally callable and returns the total owned assets in USD, calculated as the difference
   * between total collateral and total debt. If the total collateral is less than or equal to the total debt, the
   * total owned assets is set to 0.
   *
   * @return totalOwnedAssetsInUSD The total owned assets in USD.
   *
   * Requirements:
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function totalAssets(
    IOracle.PriceOptions memory priceOptions
  ) public view returns (uint256 totalOwnedAssetsInUSD) {
    (uint256 totalCollateralInUSD, uint256 totalDebtInUSD) = _getPosition(priceOptions);
    totalOwnedAssetsInUSD = totalCollateralInUSD > totalDebtInUSD
      ? (totalCollateralInUSD - totalDebtInUSD)
      : 0;
  }

  /**
   * @dev Deploys funds in the AAVEv3 strategy
   *
   * This function is externally callable only by the owner, and it involves the following steps:
   * 1. Wraps the received Ether into WETH.
   * 2. Initiates a WETH flash loan to leverage the deposited amount.
   *
   * @return deployedAmount The amount deployed in the AAVEv3 strategy after leveraging.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   * - The received Ether amount must not be zero.
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function deploy(uint256 amount) external onlyOwner nonReentrant returns (uint256 deployedAmount) {
    if (amount == 0) revert InvalidDeployAmount();
    // 1. Transfer Assets from the Vault
    IERC20Upgradeable(_debtToken).safeTransferFrom(msg.sender, address(this), amount);

    // 2. Initiate a WETH Flash Loan
    uint256 leverage = _calculateLeverageRatio(amount, getLoanToValue(), getNrLoops());
    uint256 loanAmount = leverage - amount;
    uint256 fee = flashLender().flashFee(_debtToken, loanAmount);

    if (!IERC20Upgradeable(_debtToken).approve(flashLenderA(), loanAmount + fee)) revert FailedToApproveAllowance();
    bytes memory data = abi.encode(amount, msg.sender, FlashLoanAction.SUPPLY_BOORROW);
    _flashLoanArgsHash = keccak256(abi.encodePacked(address(this), _debtToken, loanAmount, data));
    if (
      !flashLender().flashLoan(IERC3156FlashBorrowerUpgradeable(this),_debtToken, loanAmount, data)
    ) {
      _flashLoanArgsHash = 0;
      revert FailedToRunFlashLoan();
    }
    _flashLoanArgsHash = 0;
    _updateDeployedAssets();
  }

  /**
   * Update the Deployed Assets and Generate an Update
   */
  function _updateDeployedAssets() private {
      uint256 maxPriceAge = settings().getRebalancePriceMaxAge();
      uint256 maxPriceConf = settings().getPriceMaxConf();
      _deployedAssets = totalAssets(IOracle.PriceOptions({ maxAge: maxPriceAge, maxConf: maxPriceConf }));
      emit StrategyAmountUpdate(_deployedAssets);
  }

  /**
   * @dev Handles the execution of actions after receiving a flash loan.
   *
   * This function is part of the IERC3156FlashBorrower interface and is called by the flash lender contract
   * after a flash loan is initiated. It validates the loan parameters, ensures that the initiator is the
   * contract itself, and executes specific actions based on the provided FlashLoanAction. The supported actions
   * include supplying and borrowing funds, repaying debt and withdrawing collateral, and simply repaying debt.
   * The function returns a bytes32 success message after the actions are executed.
   *
   * @param initiator The address that initiated the flash loan.
   * @param token The address of the token being flash borrowed (should be WETH in this case).
   * @param amount The total amount of tokens being flash borrowed.
   * @param fee The fee amount associated with the flash loan.
   * @param callData Additional data encoded for specific actions, including the original amount, action type, and receiver address.
   *
   * Requirements:
   * - The flash loan sender must be the expected flash lender contract.
   * - The initiator must be the contract itself to ensure trust.
   * - Only WETH flash loans are allowed.
   * - The contract must be properly configured and initialized.
   */
  function onFlashLoan(
    address initiator,
    address token,
    uint256 amount,
    uint256 fee,
    bytes memory callData
  ) external returns (bytes32) {
    if (msg.sender != flashLenderA()) revert InvalidFlashLoanSender();
    if (initiator != address(this)) revert InvalidLoanInitiator();
    // Only Allow WETH Flash Loans
    if (token != _debtToken) revert InvalidFlashLoanAsset();
    if (_flashLoanArgsHash != keccak256(abi.encodePacked(initiator, token, amount, callData)))
      revert FailedToAuthenticateArgs();
    FlashLoanData memory data = abi.decode(callData, (FlashLoanData));
    if (data.action == FlashLoanAction.SUPPLY_BOORROW) {
      _supplyBorrow(data.originalAmount, amount, fee);
      // Use the Borrowed to pay ETH and deleverage
    } else if (data.action == FlashLoanAction.PAY_DEBT_WITHDRAW) {
      _repayAndWithdraw(data.originalAmount, amount, fee, payable(data.receiver));
    } else if (data.action == FlashLoanAction.PAY_DEBT) {
      _payDebt(amount, fee);
    }
    return _SUCCESS_MESSAGE;
  }
  /**
   * @dev Initiates the undeployment of a specified amount, sending the resulting ETH to the contract owner.
   *
   * This function allows the owner of the contract to undeploy a specified amount, which involves
   * withdrawing the corresponding collateral, converting it to WETH, unwrapping WETH, and finally
   * sending the resulting ETH to the contract owner. The undeployment is subject to reentrancy protection.
   * The function returns the amount of ETH undeployed to the contract owner.
   * The method is designed to ensure that the collateralization ratio (collateral value to debt value) remains within acceptable limits.
   * It leverages a flash loan mechanism to obtain additional funds temporarily, covering any necessary adjustments required to maintain
   * the desired collateralization ratio.
   *
   * @param amount The amount of collateral to undeploy.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   */
  function undeploy(
    uint256 amount
  ) external onlyOwner nonReentrant returns (uint256 undeployedAmount) {
    undeployedAmount = _undeploy(amount, payable(msg.sender));
  }

  function _adjustDebt(
    uint256 totalCollateralBaseInUSD,
    uint256 totalDebtBaseInUSD
  ) internal returns (uint256 deltaAmount) {
    uint256 deltaDebt = _calculateDebtToPay(
      getLoanToValue(),
      totalCollateralBaseInUSD,
      totalDebtBaseInUSD
    );
    uint256 fee = flashLender().flashFee(_debtToken, deltaDebt);
    // uint256 allowance = wETH().allowance(address(this), flashLenderA());
    bytes memory data = abi.encode(deltaDebt, address(0), FlashLoanAction.PAY_DEBT);
    if (!IERC20Upgradeable(_debtToken).approve(flashLenderA(), deltaDebt + fee)) revert FailedToApproveAllowance();
    _flashLoanArgsHash = keccak256(abi.encodePacked(address(this), _debtToken, deltaDebt, data));
    if (
      !flashLender().flashLoan(IERC3156FlashBorrowerUpgradeable(this), _debtToken, deltaDebt, data)
    ) {
      _flashLoanArgsHash = 0;
      revert FailedToRunFlashLoan();
    }
    _flashLoanArgsHash = 0;
    deltaAmount = deltaDebt + fee;
  }

  /**
   * @dev Harvests the strategy by rebalancing the collateral and debt positions.
   *
   * This function allows the owner of the contract to harvest the strategy by rebalancing the collateral
   * and debt positions. It calculates the current collateral and debt positions, checks if the collateral
   * is higher than the debt, adjusts the debt if needed to maintain the loan-to-value (LTV) within the specified
   * range, and logs profit or loss based on changes in the deployed amount. The function returns the balance change
   * as an int256 value.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   * - The contract must be properly configured and initialized.
   *
   * Emits:
   * - StrategyProfit: If the strategy achieves a profit.
   * - StrategyLoss: If the strategy incurs a loss.
   * - StrategyAmountUpdate: Whenever the deployed amount is updated.
   *
   * @return balanceChange The change in strategy balance as an int256 value.
   */
  function harvest() external override onlyOwner nonReentrant returns (int256 balanceChange) {
    (uint256 totalCollateralBaseInUSD, uint256 totalDebtBaseInUSD) = _getPosition(
      IOracle.PriceOptions({
        maxAge: settings().getRebalancePriceMaxAge(),
        maxConf: settings().getPriceMaxConf()
      })
    );

    if (totalCollateralBaseInUSD == 0 || totalDebtBaseInUSD == 0) {
      return 0;
    }
    if (totalCollateralBaseInUSD <= totalDebtBaseInUSD) revert CollateralLowerThanDebt();

    uint256 deltaDebt = 0;
    // Local Copy to reduce the number of SLOADs
    uint256 deployedAmount = _deployedAssets;

    if (deltaDebt >= totalDebtBaseInUSD) revert InvalidDeltaDebt();

    uint256 ltv = (totalDebtBaseInUSD * PERCENTAGE_PRECISION) / totalCollateralBaseInUSD;
    if (ltv > getMaxLoanToValue() && ltv < PERCENTAGE_PRECISION) {
      // Pay Debt to rebalance the position
      deltaDebt = _adjustDebt(totalCollateralBaseInUSD, totalDebtBaseInUSD);
    }
    uint256 newDeployedAmount = totalCollateralBaseInUSD -
      deltaDebt -
      (totalDebtBaseInUSD - deltaDebt);

    if (deltaDebt >= totalCollateralBaseInUSD) revert InvalidDeltaDebt();

    if (newDeployedAmount == deployedAmount) {
      return 0;
    }

    // Log Profit or Loss when there is no debt adjustment
    if (newDeployedAmount > deployedAmount && deltaDebt == 0) {
      uint256 profit = newDeployedAmount - deployedAmount;
      emit StrategyProfit(profit);
      balanceChange = int256(profit);
    } else if (newDeployedAmount < deployedAmount && deltaDebt == 0) {
      uint256 loss = deployedAmount - newDeployedAmount;
      emit StrategyLoss(loss);
      balanceChange = -int256(loss);
    }

    _deployedAssets = newDeployedAmount;
    emit StrategyAmountUpdate(newDeployedAmount);
  }

  /**
   * Get the Money Market Position Balances (Collateral, Debt) in Token Balances
   *
   * @return collateralBalance
   * @return debtBalance
   */
  function _getLeverageBalances()
    internal
    view
    virtual
    returns (uint256 collateralBalance, uint256 debtBalance);
  /**
   * @dev Retrieves the current collateral and debt positions of the contract.
   *
   * This internal function provides a view into the current collateral and debt positions of the contract
   * by querying the Aave V3 protocol. It calculates the positions in ETH based on the current ETH/USD exchange rate.
   *
   * @return totalCollateralInUSD The total collateral position in ETH.
   * @return totalDebtInUSD The total debt position in ETH.
   */
  function _getPosition(
    IOracle.PriceOptions memory priceOptions
  ) internal view returns (uint256 totalCollateralInUSD, uint256 totalDebtInUSD) {
    totalCollateralInUSD = 0;
    totalDebtInUSD = 0;

    (uint256 collateralBalance, uint256 debtBalance) = _getLeverageBalances();
    uint256 priceMaxAge = priceOptions.maxAge;

    if (collateralBalance != 0) {

      IOracle.Price memory collateralPrice = priceMaxAge == 0
        ? _collateralOracle.getLatestPrice()
        : _collateralOracle.getSafeLatestPrice(priceOptions);
      if (
        !(priceMaxAge == 0 ||
          (priceMaxAge > 0 && (collateralPrice.lastUpdate > (block.timestamp - priceMaxAge))))
      ) {
        revert PriceOutdated();
      }
      // TODO Support tokens with different decimals
      totalCollateralInUSD = (collateralBalance * collateralPrice.price) / 1e18;
    }

    if (debtBalance != 0) {

        IOracle.Price memory debtPrice = priceMaxAge == 0
          ? _debtOracle.getLatestPrice()
          : _debtOracle.getSafeLatestPrice(priceOptions);

      if (
        !(priceMaxAge == 0 ||
          (priceMaxAge > 0 && (debtPrice.lastUpdate > (block.timestamp - priceMaxAge))))
      ) {
        revert PriceOutdated();
      }
      // TODO Support tokens with different decimals
      totalDebtInUSD = (debtBalance * debtPrice.price) / 1e18;
    }
  }

  /**
   * @dev Initiates the undeployment process by adjusting the contract's position and performing a flash loan.
   *
   * This private function calculates the necessary adjustments to the contract's position to accommodate the requested
   * undeployment amount. It then uses a flash loan to perform the required operations, including paying off debt and
   * withdrawing ETH. The resulting undeployed amount is updated, and the contract's deployed amount is adjusted accordingly.
   *
   * @param amount The amount of ETH to undeploy.
   * @param receiver The address to receive the undeployed ETH.
   * @return undeployedAmount The actual undeployed amount of ETH.
   *
   * Requirements:
   * - The contract must have a collateral margin greater than the debt to initiate undeployment.
   */
  function _undeploy(uint256 amount, address receiver) private returns (uint256 undeployedAmount) {
    (uint256 totalCollateralBaseInUSD, uint256 totalDebtBaseInUSD) = _getPosition(
      IOracle.PriceOptions({
        maxAge: settings().getPriceMaxAge(),
        maxConf: settings().getPriceMaxConf()
      })
    );
    // When the position is in liquidation state revert the transaction
    if (totalCollateralBaseInUSD <= totalDebtBaseInUSD) revert NoCollateralMarginToScale();
    uint256 percentageToBurn = (amount * PERCENTAGE_PRECISION) /
      (totalCollateralBaseInUSD - totalDebtBaseInUSD);

    // Calculate how much i need to burn to accomodate the withdraw
    (uint256 deltaCollateralInUSD, uint256 deltaDebtInUSD) = _calcDeltaPosition(
      percentageToBurn,
      totalCollateralBaseInUSD,
      totalDebtBaseInUSD
    );
    // Calculate the Flash Loan FEE
    uint256 fee = flashLender().flashFee(_debtToken, deltaDebtInUSD);
    // Update WETH allowance to pay the debt after the flash loan
    //uint256 allowance = wETH().allowance(address(this), flashLenderA());
    if (!IERC20Upgradeable(_debtToken).approve(flashLenderA(), deltaDebtInUSD + fee)) revert FailedToApproveAllowance();

    bytes memory data = abi.encode(
      deltaCollateralInUSD,
      receiver,
      FlashLoanAction.PAY_DEBT_WITHDRAW
    );
    _flashLoanArgsHash = keccak256(abi.encodePacked(address(this), _debtToken, deltaDebtInUSD, data));
    if (
      !flashLender().flashLoan(
        IERC3156FlashBorrowerUpgradeable(this),
        _debtToken,
        deltaDebtInUSD,
        data
      )
    ) {
      _flashLoanArgsHash = 0;
      revert FailedToRunFlashLoan();
    }
    _flashLoanArgsHash = 0;
    // Update the amount of Assets deployed on the contract
    _updateDeployedAssets();
  }

  /**
   * @dev Repays the debt on AAVEv3 strategy, handling the withdrawal and swap operations.
   *
   * This private function is used internally to repay the debt on the AAVEv3 strategy. It involves repaying
   * the debt on AAVE, obtaining a quote for the required collateral, withdrawing the collateral from AAVE, and
   * swapping the collateral to obtain the necessary WETH. The leftover WETH after the swap is deposited back
   * into AAVE if there are any. The function emits the `StrategyUndeploy` event after the debt repayment.
   *
   * @param debtAmount The amount of debt in WETH to be repaid on AAVE.
   * @param fee The fee amount in WETH associated with the debt repayment.
   *
   * Requirements:
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function _payDebt(uint256 debtAmount, uint256 fee) internal {
    _repay(_debtToken, debtAmount);

    // Convert ETH to WST using the current prices and
    // calculate the maximum amount in using the max Slippage
    uint256 wsthETHAmount = _toCollateral(debtAmount);
    uint256 amountInMax = (wsthETHAmount * (PERCENTAGE_PRECISION + getMaxSlippage())) /
      PERCENTAGE_PRECISION;

    _withdraw(_collateralToken, amountInMax, address(this));

    (uint256 amountIn, ) = _swap(
      ISwapHandler.SwapParams(
        _collateralToken,
        _debtToken,
        ISwapHandler.SwapType.EXACT_OUTPUT,
        amountInMax,
        debtAmount + fee,
        _swapFeeTier,
        bytes("")
      )
    );
    // When there are leftovers from the swap, deposit then back
    uint256 swapLefts = amountIn < amountInMax ? amountInMax - amountIn : 0;
    if (swapLefts > 0) {
      _supply(_collateralToken, swapLefts);
    }
    emit StrategyUndeploy(msg.sender, debtAmount);
  }

  /**
   * @dev Internal function to convert the specified amount from WETH to the underlying assert cbETH, wstETH, rETH.
   *
   * This function is virtual and intended to be overridden in derived contracts for customized implementation.
   *
   * @param amount The amount to convert from debtToken.
   * @return uint256 The converted amount in the underlying collateral.
   */
  function _convertToCollateral(uint256 amount) internal virtual returns (uint256) {
    uint256 amountOutMinimum = 0;

    if (getMaxSlippage() > 0) {
      uint256 wsthETHAmount = _toCollateral(amount);
      amountOutMinimum =
        (wsthETHAmount * (PERCENTAGE_PRECISION - getMaxSlippage())) /
        PERCENTAGE_PRECISION;
    }
    // 1. Swap WETH -> cbETH/wstETH/rETH
    (, uint256 amountOut) = _swap(
      ISwapHandler.SwapParams(
        _debtToken, // Asset In
        _collateralToken, // Asset Out
        ISwapHandler.SwapType.EXACT_INPUT, // Swap Mode
        amount, // Amount In
        amountOutMinimum, // Amount Out
        _swapFeeTier, // Fee Pair Tier
        bytes("") // User Payload
      )
    );
    return amountOut;
  }

  /**
   * @dev Internal function to convert the specified amount to WETH from the underlying collateral.
   *
   * This function is virtual and intended to be overridden in derived contracts for customized implementation.
   *
   * @param amount The amount to convert to WETH.
   * @return uint256 The converted amount in WETH.
   */
  function _convertToDebt(uint256 amount) internal virtual returns (uint256) {
    uint256 amountOutMinimum = 0;
    if (getMaxSlippage() > 0) {
      uint256 ethAmount = _toDebt(amount);
      amountOutMinimum =
        (ethAmount * (PERCENTAGE_PRECISION - getMaxSlippage())) /
        PERCENTAGE_PRECISION;
    }
    // 1.Swap cbETH -> WETH/wstETH/rETH
    (, uint256 amountOut) = _swap(
      ISwapHandler.SwapParams(
        _collateralToken, // Asset In
        _debtToken, // Asset Out
        ISwapHandler.SwapType.EXACT_INPUT, // Swap Mode
        amount, // Amount In
        amountOutMinimum, // Amount Out
        _swapFeeTier, // Fee Pair Tier
        bytes("") // User Payload
      )
    );
    return amountOut;
  }

  /**
   * @dev Internal function to convert the specified amount in the underlying collateral to WETH.
   *
   * This function calculates the equivalent amount in WETH based on the latest price from the collateral oracle.
   *
   * @param amountIn The amount in the underlying collateral.
   * @return amountOut The equivalent amount in WETH.
   */
  function _toDebt(uint256 amountIn) internal view returns (uint256 amountOut) {
    IOracle.PriceOptions memory priceOptions = IOracle.PriceOptions({
      maxAge: settings().getPriceMaxAge(),
      maxConf: settings().getPriceMaxConf()
    });
    amountOut =
      (amountIn * _collateralOracle.getSafeLatestPrice(priceOptions).price) /
      _debtOracle.getSafeLatestPrice(priceOptions).price;
  }

  /**
   * @dev Internal function to convert the specified amount in WETH to the underlying collateral.
   *
   * This function calculates the equivalent amount in the underlying collateral based on the latest price from the collateral oracle.
   *
   * @param amountIn The amount in WETH.
   * @return amountOut The equivalent amount in the underlying collateral.
   */
  function _toCollateral(uint256 amountIn) internal view returns (uint256 amountOut) {
    IOracle.PriceOptions memory priceOptions = IOracle.PriceOptions({
      maxAge: settings().getPriceMaxAge(),
      maxConf: settings().getPriceMaxConf()
    });
    amountOut =
      (amountIn * _debtOracle.getSafeLatestPrice(priceOptions).price) /
      _collateralOracle.getSafeLatestPrice(priceOptions).price;
  }

  /**
   * @dev Executes the supply and borrow operations on AAVE, converting assets from WETH.
   *
   * This function is private and is used internally in the AAVEv3 strategy for depositing collateral
   * and borrowing ETH on the AAVE platform. It involves converting assets from WETH to the respective
   * tokens, supplying collateral, and borrowing ETH. The strategy owned value is logged on the  `StrategyDeploy` event.
   *
   * @param amount The amount to be supplied to AAVE (collateral) in WETH.
   * @param loanAmount The amount to be borrowed from AAVE in WETH.
   * @param fee The fee amount in WETH associated with the flash loan.
   *
   * Requirements:
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function _supplyBorrow(uint256 amount, uint256 loanAmount, uint256 fee) internal {
    uint256 collateralIn = _convertToCollateral(amount + loanAmount);
    // Deposit on AAVE Collateral and Borrow ETH
    _supplyAndBorrow(_collateralToken, collateralIn, _debtToken, loanAmount + fee);
    uint256 collateralInETH = _toDebt(collateralIn);
    uint256 deployedAmount = collateralInETH - loanAmount - fee;
    emit StrategyDeploy(msg.sender, deployedAmount);
  }

  /**
   * @dev Repays a specified amount, withdraws collateral, and sends the remaining ETH to the specified receiver.
   *
   * This private function is used internally to repay a specified amount on AAVE, withdraw collateral, and send
   * the remaining ETH to the specified receiver. It involves checking the available balance, repaying the debt on
   * AAVE, withdrawing the specified amount of collateral, converting collateral to WETH, unwrapping WETH, and finally
   * sending the remaining ETH to the receiver. The function emits the `StrategyUndeploy` event after the operation.
   *
   * @param withdrawAmountInETh The amount of collateral to be withdrawn in WETH.
   * @param repayAmount The amount of debt in WETH to be repaid on AAVE.
   * @param fee The fee amount in WETH associated with the operation.
   * @param receiver The address to receive the remaining ETH after debt repayment and withdrawal.
   *
   * Requirements:
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function _repayAndWithdraw(
    uint256 withdrawAmountInETh,
    uint256 repayAmount,
    uint256 fee,
    address payable receiver
  ) internal {
    (uint256 collateralBalance, ) = _getLeverageBalances();
    uint256 convertedAmount = _toCollateral(withdrawAmountInETh);
    uint256 withdrawAmount = collateralBalance > convertedAmount
      ? convertedAmount
      : collateralBalance;

    _repay(_debtToken, repayAmount);

    _withdraw(_collateralToken, withdrawAmount, address(this));

    // Convert Collateral to WETH
    uint256 wETHAmount = _convertToDebt(withdrawAmount);
    // Calculate how much ETH i am able to withdraw
    uint256 ethToWithdraw = wETHAmount - repayAmount - fee;

    IERC20Upgradeable(_debtToken).safeTransfer(receiver, ethToWithdraw);

    emit StrategyUndeploy(msg.sender, ethToWithdraw);
  }

  /**
   * Money Market Functions
   *
   * The derived and money market specific classes should implement these functions to
   * be used on a Leverage Strategy.
   */

  /**
   *  @dev Deposit an asset assetIn on a money market
   */
  function _supply(address assetIn, uint256 amountIn) internal virtual;

  /**
   * @dev Deposit and borrow and asset using the asset deposited as collateral
   */
  function _supplyAndBorrow(
    address assetIn,
    uint256 amountIn,
    address assetOut,
    uint256 borrowOut
  ) internal virtual;

  /**
   *  @dev Repay any borrow debt
   */
  function _repay(address assetIn, uint256 amount) internal virtual;

  /**
   * @dev  Withdraw a deposited asset from a money market
   *
   * @param assetOut The asset to withdraw
   * @param amount The amoun to withdraw
   * @param to the account that will receive the asset
   */
  function _withdraw(address assetOut, uint256 amount, address to) internal virtual;

  /**
   * @dev
   */
  function renounceOwnership() public virtual override {
    revert InvalidOwner();
  }

  function getCollateralOracle() public view returns (address oracle) {
    oracle = address(_collateralOracle);
  }

  function getDebtOracle() public view returns (address oracle) {
    oracle = address(_debtOracle);
  }

  function setCollateralOracle(IOracle oracle) public onlyGovernor {
    _collateralOracle = oracle;
  }

  function setDebtOracle(IOracle oracle) public onlyGovernor {
    _debtOracle = oracle;
  }

  function asset() public view override returns (address) {
    return _debtToken;
  }

  function getCollateralToken() public view returns (address) {
    return _collateralToken;
  }

  function getDebToken() public view returns (address) {
    return _debtToken;
  }

  uint256[44] private __gap;
}
