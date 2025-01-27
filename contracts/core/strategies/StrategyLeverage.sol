// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC3156FlashBorrowerUpgradeable } from "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashBorrowerUpgradeable.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { PERCENTAGE_PRECISION } from "../Constants.sol";
import { IOracle } from "../../interfaces/core/IOracle.sol";
import { ISwapHandler } from "../../interfaces/core/ISwapHandler.sol";
import { IStrategyLeverage } from "../../interfaces/core/IStrategyLeverage.sol";
import { UseLeverage } from "../hooks/UseLeverage.sol";
import { UseFlashLender } from "../hooks/UseFlashLender.sol";
import { UseUnifiedSwapper } from "../hooks/swappers/UseUnifiedSwapper.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { AddressUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import { StrategyLeverageSettings } from "./StrategyLeverageSettings.sol";
import { MathLibrary } from "../../libraries/MathLibrary.sol";
import { EmptySlot } from "../EmptySlot.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
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
 *  1) Deploy X amount of ETH/ERC20
 *  2) Borrow Y Amount of ETH/ERC20
 *  3) Deposit X+Y amount of Collateral in AAVE
 *  4) Borrow Y ETH/ERC20 From AAVE to pay the flash loan
 *  5) Ends up with X+Y Amount of Collateral and Y of Debt
 *
 *  This strategy could work for
 *  rETH/WETH
 *  wstETH/WETH
 *  sUSD/DAI
 *
 *  ...
 *
 * @notice The Contract is abstract and needs to be extended to implement the
 * conversion between debt token and the collateral , to integrate a money market
 */
abstract contract StrategyLeverage is
  IStrategyLeverage,
  IERC3156FlashBorrowerUpgradeable,
  StrategyLeverageSettings,
  ReentrancyGuardUpgradeable,
  UseUnifiedSwapper,
  UseFlashLender,
  EmptySlot,
  UseLeverage
{
  enum FlashLoanAction {
    SUPPLY_BORROW,
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
  using MathLibrary for uint256;

  error InvalidDebtToken();
  error InvalidCollateralToken();
  error InvalidOracle();
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
  error FailedToAuthenticateArgs();
  error InvalidFlashLoanAction();

  // Assets in debtToken() Controlled by the strategy that can be unwinded
  uint256 private _deployedAssets = 0;
  // Collateral IERC20 Token used on this leverage Position
  address internal _collateralToken;
  // Debt IERC20 Token address used on this
  address internal _debtToken;
  // Oracle used to get the price of the collateralToken/debt: Example WSETH/ETH, ETH/USDC
  IOracle private _oracle;
  // Two Empty Slots to keep the storage layout consistent
  uint256[1] internal _emptySlots;
  // Internal Storaged used for flash loan parameter authentication
  bytes32 private _flashLoanArgsHash = 0;
  // The Deployed or Undeployed pending amount. Used for internal accounting
  uint256 private _pendingAmount = 0;

  /**
   * @dev Internal function to initialize the AAVEv3 strategy base.
   *
   * This function is used for the initial setup of the AAVEv3 strategy base contract, including ownership transfer,
   * service registry initialization, setting oracles, configuring AAVEv3 parameters, and approving allowances.
   *
   * @param initialOwner The address to be set as the initial owner of the AAVEv3 strategy base contract.
   * @param collateralToken The hash representing the collateral ERC20 token in the service registry.
   * @param debtToken The hash representing the collateral/ETH oracle in the service registry.
   * @param oracle The hash representing the collateral ERC20 token in the service registry.
   * @param flashLender The hash representing the flash lender in the service registry.
   *
   * Requirements:
   * - The caller must be in the initializing state.
   * - The initial owner address must not be the zero address.
   * - The debt/USD oracle and collateral/USD oracle addresses must be valid.
   * - Approval allowances must be successfully set for debt ERC20 and the collateral ERC20 token for UniSwap.
   */
  function _initializeStrategyLeverage(
    address initialOwner,
    address initialGovernor,
    address collateralToken,
    address debtToken,
    address oracle,
    address flashLender
  ) internal onlyInitializing {
    if (initialOwner == address(0)) revert InvalidOwner();

    _initLeverageSettings(initialOwner, initialGovernor);
    _initUseFlashLender(flashLender);

    // Find the Tokens on Registry
    _collateralToken = collateralToken;
    _debtToken = debtToken;

    // Set the Oracle
    _oracle = IOracle(oracle);

    if (_collateralToken == address(0)) revert InvalidCollateralToken();
    if (_debtToken == address(0)) revert InvalidDebtToken();

    if (address(_oracle) == address(0)) revert InvalidOracle();
  }

  /**
   * @dev Internal function to upgrade from v1.1.0 to v4.0.0
   *
   * Set the deployed assets and reset the pending amount and flash loan args hash
   * @param deployedAssets The amount of assets deployed in the strategy
   */
  function _upgradeFromV1(uint256 deployedAssets) internal {
    _deployedAssets = deployedAssets;
    _pendingAmount = 0;
    _flashLoanArgsHash = 0;
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
    if (msg.sender != _debtToken && msg.sender != _collateralToken)
      revert ETHTransferNotAllowed(msg.sender);
  }

  /**
   * @dev Retrieves the position details including total collateral, total debt, and loan-to-value ratio.
   *
   * This function is externally callable and returns the total collateral in Ether, total debt in USD,
   * and the loan-to-value ratio for the AAVEv3 strategy.
   *
   * @return totalCollateralInAsset The total collateral in USD.
   * @return totalDebtInAsset The total debt in USD.
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
    returns (uint256 totalCollateralInAsset, uint256 totalDebtInAsset, uint256 loanToValue)
  {
    (totalCollateralInAsset, totalDebtInAsset) = _getPosition(priceOptions);
    if (totalCollateralInAsset == 0) {
      loanToValue = 0;
    } else {
      loanToValue = (totalDebtInAsset * PERCENTAGE_PRECISION) / totalCollateralInAsset;
    }
  }

  /**
   * @dev Retrieves the total owned assets by the Strategy in USD
   *
   * This function is externally callable and returns the total owned assets in USD, calculated as the difference
   * between total collateral and total debt. If the total collateral is less than or equal to the total debt, the
   * total owned assets is set to 0.
   *
   * @return totalOwnedAssetsInDebt The total owned assets in Debt Token
   *
   * Requirements:
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function totalAssets() external view returns (uint256 totalOwnedAssetsInDebt) {
    IOracle.PriceOptions memory priceOptions = IOracle.PriceOptions({ maxAge: 0, maxConf: 0 });
    (uint256 totalCollateral, uint256 totalDebt) = getBalances();
    uint256 totalCollateralInDebt = _toDebt(priceOptions, totalCollateral, false);
    totalOwnedAssetsInDebt = totalCollateralInDebt > totalDebt
      ? (totalCollateralInDebt - totalDebt)
      : 0;
  }

  /**
   * @dev Deploys funds in the AAVEv3 strategy
   *
   * This function is externally callable only by the owner, and it involves the following steps:
   * 1. Transfer the Debt Token to the Strategy
   * 2. Initiates a Debt Token flash loan to leverage the deposited amount.
   *
   * @return deployedAmount The amount deployed in the AAVEv3 strategy after leveraging.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   * - The received Ether amount must not be zero.
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function deploy(uint256 amount) external onlyOwner nonReentrant returns (uint256 deployedAmount) {
    // Ensure a non-zero deployment amount
    if (amount == 0) revert InvalidDeployAmount();

    // 1. Transfer assets from the vault to the contract
    IERC20Upgradeable(_debtToken).safeTransferFrom(msg.sender, address(this), amount);

    // 2. Calculate leverage and determine the loan amount needed
    uint256 leverage = _calculateLeverageRatio(amount, getLoanToValue(), getNrLoops());
    uint256 loanAmount = leverage - amount;

    // 3. Calculate the flash loan fee for the required loan amount
    uint256 fee = flashLender().flashFee(_debtToken, loanAmount);

    // 4. Approve the flash lender to spend the loan amount plus fee
    if (!IERC20Upgradeable(_debtToken).approve(flashLenderA(), loanAmount + fee)) {
      revert FailedToApproveAllowance();
    }

    // 5. Prepare and authenticate flash loan data
    bytes memory data = abi.encode(amount, msg.sender, FlashLoanAction.SUPPLY_BORROW);
    _flashLoanArgsHash = keccak256(abi.encodePacked(address(this), _debtToken, loanAmount, data));

    // 6. Execute the flash loan
    if (
      !flashLender().flashLoan(IERC3156FlashBorrowerUpgradeable(this), _debtToken, loanAmount, data)
    ) {
      _flashLoanArgsHash = 0;
      revert FailedToRunFlashLoan();
    }

    // 7. Reset flash loan argument hash and update deployed assets
    _flashLoanArgsHash = 0;
    deployedAmount = _pendingAmount;
    _deployedAssets += deployedAmount;

    // 8. Emit an event for the updated strategy amount
    emit StrategyAmountUpdate(_deployedAssets);

    // 9. Reset the pending amount to zero
    _pendingAmount = 0;
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
   * @param token The address of the token being flash borrowed (should be Debt Token in this case).
   * @param amount The total amount of tokens being flash borrowed.
   * @param fee The fee amount associated with the flash loan.
   * @param callData Additional data encoded for specific actions, including the original amount, action type, and receiver address.
   *
   * Requirements:
   * - The flash loan sender must be the expected flash lender contract.
   * - The initiator must be the contract itself to ensure trust.
   * - The contract must be properly configured and initialized.
   */
  function onFlashLoan(
    address initiator,
    address token,
    uint256 amount,
    uint256 fee,
    bytes memory callData
  ) external returns (bytes32) {
    // Validate the flash loan sender
    if (msg.sender != flashLenderA()) revert InvalidFlashLoanSender();

    // Validate the flash loan initiator
    if (initiator != address(this)) revert InvalidLoanInitiator();

    // Ensure the token used is the debt token
    if (token != _debtToken) revert InvalidFlashLoanAsset();

    // Authenticate the provided arguments against the stored hash
    bytes32 expectedHash = keccak256(abi.encodePacked(initiator, token, amount, callData));
    if (_flashLoanArgsHash != expectedHash) revert FailedToAuthenticateArgs();

    // Decode the flash loan data
    FlashLoanData memory data = abi.decode(callData, (FlashLoanData));

    // Execute the appropriate action based on the decoded flash loan data
    if (data.action == FlashLoanAction.SUPPLY_BORROW) {
      _supplyBorrow(data.originalAmount, amount, fee);
    } else if (data.action == FlashLoanAction.PAY_DEBT_WITHDRAW) {
      _repayAndWithdraw(data.originalAmount, amount, fee, payable(data.receiver));
    } else if (data.action == FlashLoanAction.PAY_DEBT) {
      _payDebt(amount, fee);
    } else {
      revert InvalidFlashLoanAction();
    }

    return _SUCCESS_MESSAGE;
  }
  /**
   * @dev Initiates the undeployment of a specified amount, sending the resulting ETH to the contract owner.
   *
   * This function allows the owner of the contract to undeploy a specified amount, which involves
   * withdrawing the corresponding collateral, converting it to Debt Token, unwrapping Debt Token, and finally
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

  /**
   * @notice Adjusts the current debt position by calculating the amount of debt to repay and executing a flash loan.
   * @dev The function calculates the necessary debt to repay based on the loan-to-value (LTV) ratio and initiates a flash loan
   *      to cover this amount. The function also handles the approval for the flash loan and manages the flash loan execution.
   * @param totalCollateralInDebt The total collateral value expressed in debt terms.
   * @param totalDebt The current total debt amount.
   * @return deltaAmount The total amount of debt adjusted, including any flash loan fees.
   */
  function _adjustDebt(
    uint256 totalCollateralInDebt,
    uint256 totalDebt
  ) internal returns (uint256 deltaAmount) {
    // Calculate the debt amount to repay to reach the desired Loan-to-Value (LTV) ratio
    uint256 deltaDebt = _calculateDebtToPay(getLoanToValue(), totalCollateralInDebt, totalDebt);

    // Calculate the flash loan fee for the debt amount
    uint256 fee = flashLender().flashFee(_debtToken, deltaDebt);

    // Prepare data for the flash loan execution
    bytes memory data = abi.encode(deltaDebt, address(0), FlashLoanAction.PAY_DEBT);

    // Approve the flash lender to spend the debt amount plus fee
    if (!IERC20Upgradeable(_debtToken).approve(flashLenderA(), deltaDebt + fee)) {
      revert FailedToApproveAllowance();
    }

    // Set a unique hash for the flash loan arguments to prevent reentrancy attacks
    _flashLoanArgsHash = keccak256(abi.encodePacked(address(this), _debtToken, deltaDebt, data));

    // Execute the flash loan for the calculated debt amount
    if (
      !flashLender().flashLoan(IERC3156FlashBorrowerUpgradeable(this), _debtToken, deltaDebt, data)
    ) {
      _flashLoanArgsHash = 0;
      revert FailedToRunFlashLoan();
    }

    // Reset the hash after successful flash loan execution
    _flashLoanArgsHash = 0;

    // Return the total amount adjusted, including the flash loan fee
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
    // Fetch leverage balances
    (uint256 totalCollateral, uint256 totalDebt) = getBalances();

    // Convert total collateral to debt value using Oracle
    uint256 totalCollateralInDebt = _toDebt(
      IOracle.PriceOptions({ maxAge: getPriceMaxAge(), maxConf: getPriceMaxConf() }),
      totalCollateral,
      false
    );

    // Early exit conditions
    if (totalCollateralInDebt == 0 || totalDebt == 0) {
      return 0;
    }
    if (totalCollateralInDebt <= totalDebt) {
      revert CollateralLowerThanDebt();
    }

    uint256 deployedAmount = _deployedAssets;
    uint256 deltaDebt = 0;

    // Calculate Loan-to-Value ratio
    uint256 ltv = (totalDebt * PERCENTAGE_PRECISION) / totalCollateralInDebt;

    // Adjust debt if LTV exceeds the maximum allowed
    if (ltv > getMaxLoanToValue() && ltv < PERCENTAGE_PRECISION) {
      deltaDebt = _adjustDebt(totalCollateralInDebt, totalDebt);
    }

    uint256 newDeployedAmount = totalCollateralInDebt - totalDebt;

    // Ensure valid debt adjustment
    if (deltaDebt >= totalCollateralInDebt) {
      revert InvalidDeltaDebt();
    }
    // If no change in deployed amount, return early
    if (newDeployedAmount == deployedAmount) {
      return 0;
    }

    // Log profit or loss based on the new deployed amount
    if (deltaDebt == 0) {
      if (newDeployedAmount > deployedAmount) {
        uint256 profit = newDeployedAmount - deployedAmount;
        emit StrategyProfit(profit);
        balanceChange = int256(profit);
      } else {
        uint256 loss = deployedAmount - newDeployedAmount;
        emit StrategyLoss(loss);
        balanceChange = -int256(loss);
      }
    }

    // Update deployed assets
    _deployedAssets = newDeployedAmount;
    emit StrategyAmountUpdate(newDeployedAmount);
  }

  /**
   * Get the Money Market Position Balances (Collateral, Debt) in Token Balances
   *
   * @return collateralBalance
   * @return debtBalance
   */
  function getBalances()
    public
    view
    virtual
    returns (uint256 collateralBalance, uint256 debtBalance);

  /**
   * @dev Retrieves the current collateral and debt positions of the contract.
   *
   * This internal function provides a view into the current collateral and debt positions of the contract
   * by querying the Aave V3 protocol. It calculates the positions in ETH based on the current ETH/USD exchange rate.
   *
   * @return totalCollateralInAsset The total collateral position in ETH.
   * @return totalDebtInAsset The total debt position in ETH.
   */
  function _getPosition(
    IOracle.PriceOptions memory priceOptions
  ) internal view returns (uint256 totalCollateralInAsset, uint256 totalDebtInAsset) {
    totalCollateralInAsset = 0;
    totalDebtInAsset = 0;

    (uint256 collateralBalance, uint256 debtBalance) = getBalances();
    // Convert Collateral Balance to $USD safely
    if (collateralBalance != 0) {
      totalCollateralInAsset = _toDebt(priceOptions, collateralBalance, false);
    }
    // Convert DebtBalance to Debt in Asset Terms
    if (debtBalance != 0) {
      totalDebtInAsset = debtBalance;
    }
  }

  /**
   * @dev Initiates the undeployment process by adjusting the contract's position and performing a flash loan.
   *
   * This private function calculates the necessary adjustments to the contract's position to accommodate the requested
   * undeployment amount. It then uses a flash loan to perform the required operations, including paying off debt and
   * withdrawing ETH. The resulting undeployed amount is updated, and the contract's deployed amount is adjusted accordingly.
   *
   * @param amount The amount of Debt Token to Undeploy.
   * @param receiver The address to receive the undeployed Debt Token.
   * @return receivedAmount The actual undeployed amount of Debt Token.
   *
   * Requirements:
   * - The contract must have a collateral margin greater than the debt to initiate undeployment.
   */
  function _undeploy(uint256 amount, address receiver) private returns (uint256 receivedAmount) {
    // Get price options from settings
    IOracle.PriceOptions memory options = IOracle.PriceOptions({
      maxAge: getPriceMaxAge(),
      maxConf: getPriceMaxConf()
    });

    // Fetch collateral and debt balances
    (uint256 totalCollateralBalance, uint256 totalDebtBalance) = getBalances();
    uint256 totalCollateralInDebt = _toDebt(options, totalCollateralBalance, false);

    // Ensure the position is not in liquidation state
    if (totalCollateralInDebt <= totalDebtBalance) revert NoCollateralMarginToScale();

    // Calculate percentage to burn to accommodate the withdrawal
    uint256 percentageToBurn = (amount * PERCENTAGE_PRECISION) /
      (totalCollateralInDebt - totalDebtBalance);

    // Calculate delta position (collateral and debt)
    (uint256 deltaCollateralInDebt, uint256 deltaDebt) = _calcDeltaPosition(
      percentageToBurn,
      totalCollateralInDebt,
      totalDebtBalance
    );
    // Convert deltaCollateralInDebt to deltaCollateralAmount
    uint256 deltaCollateralAmount = _toCollateral(options, deltaCollateralInDebt, true);

    // Calculate flash loan fee
    uint256 fee = flashLender().flashFee(_debtToken, deltaDebt);

    // Approve the flash lender to spend the debt amount plus fee
    if (!IERC20Upgradeable(_debtToken).approve(flashLenderA(), deltaDebt + fee)) {
      revert FailedToApproveAllowance();
    }

    // Prepare data for flash loan execution
    bytes memory data = abi.encode(
      deltaCollateralAmount,
      receiver,
      FlashLoanAction.PAY_DEBT_WITHDRAW
    );
    _flashLoanArgsHash = keccak256(abi.encodePacked(address(this), _debtToken, deltaDebt, data));

    // Execute flash loan
    if (
      !flashLender().flashLoan(IERC3156FlashBorrowerUpgradeable(this), _debtToken, deltaDebt, data)
    ) {
      _flashLoanArgsHash = 0;
      revert FailedToRunFlashLoan();
    }
    // The amount of Withdrawn minus the repay ampunt
    emit StrategyUndeploy(msg.sender, deltaCollateralInDebt - deltaDebt);

    // Reset hash after successful flash loan
    _flashLoanArgsHash = 0;

    // Update deployed assets after withdrawal
    receivedAmount = _pendingAmount;
    uint256 undeployedAmount = deltaCollateralInDebt - deltaDebt;
    _deployedAssets = _deployedAssets > undeployedAmount ? _deployedAssets - undeployedAmount : 0;

    // Emit strategy update and reset pending amount
    emit StrategyAmountUpdate(_deployedAssets);
    // Pending amount is not cleared to save gas
    //_pendingAmount = 0;
  }

  /**
   * @dev Repays the debt on AAVEv3 strategy, handling the withdrawal and swap operations.
   *
   * This private function is used internally to repay the debt on the AAVEv3 strategy. It involves repaying
   * the debt on AAVE, obtaining a quote for the required collateral, withdrawing the collateral from AAVE, and
   * swapping the collateral to obtain the necessary Debt Token. The leftover Debt Token after the swap is deposited back
   * into AAVE if there are any. The function emits the `StrategyUndeploy` event after the debt repayment.
   *
   * @param debtAmount The amount of Debt Token to be repaid on AAVE.
   * @param fee The fee amount in Debt Token associated with the debt repayment.
   *
   * Requirements:
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function _payDebt(uint256 debtAmount, uint256 fee) internal {
    // Repay the debt
    _repay(debtAmount);

    // Fetch price options from settings
    IOracle.PriceOptions memory options = IOracle.PriceOptions({
      maxAge: getPriceMaxAge(),
      maxConf: getPriceMaxConf()
    });

    // Calculate the equivalent collateral amount for the debt
    uint256 collateralAmount = _toCollateral(options, debtAmount, true);

    // Calculate maximum collateral required with slippage
    uint256 amountInMax = (collateralAmount * (PERCENTAGE_PRECISION + getMaxSlippage())) /
      PERCENTAGE_PRECISION;

    // Withdraw the collateral needed for the swap
    _withdraw(amountInMax, address(this));

    // Perform the swap to convert collateral into debt token
    (uint256 amountIn, ) = swap(
      ISwapHandler.SwapParams(
        _collateralToken,
        _debtToken,
        ISwapHandler.SwapType.EXACT_OUTPUT,
        amountInMax,
        debtAmount + fee,
        bytes("")
      )
    );

    // If there's leftover collateral after the swap, redeposit it
    if (amountIn < amountInMax) {
      uint256 swapLeftover = amountInMax - amountIn;
      _supply(swapLeftover);
    }

    // Emit event for strategy undeployment
    emit StrategyUndeploy(msg.sender, debtAmount);
  }

  /**
   * @dev Internal function to convert the specified amount from Debt Token to the underlying collateral asset cbETH, wstETH, rETH.
   *
   * This function is virtual and intended to be overridden in derived contracts for customized implementation.
   *
   * @param amount The amount to convert from debtToken.
   * @return uint256 The converted amount in the underlying collateral.
   */
  function _convertToCollateral(uint256 amount) internal virtual returns (uint256) {
    uint256 amountOutMinimum = 0;

    if (getMaxSlippage() > 0) {
      uint256 wsthETHAmount = _toCollateral(
        IOracle.PriceOptions({ maxAge: getPriceMaxAge(), maxConf: getPriceMaxConf() }),
        amount,
        false
      );
      amountOutMinimum =
        (wsthETHAmount * (PERCENTAGE_PRECISION - getMaxSlippage())) /
        PERCENTAGE_PRECISION;
    }
    // 1. Swap Debt Token -> Collateral Token
    (, uint256 amountOut) = swap(
      ISwapHandler.SwapParams(
        _debtToken, // Asset In
        _collateralToken, // Asset Out
        ISwapHandler.SwapType.EXACT_INPUT, // Swap Mode
        amount, // Amount In
        amountOutMinimum, // Amount Out
        bytes("") // User Payload
      )
    );
    return amountOut;
  }

  /**
   * @dev Internal function to convert the specified amount to Debt Token from the underlying collateral.
   *
   * This function is virtual and intended to be overridden in derived contracts for customized implementation.
   *
   * @param amount The amount to convert to Debt Token.
   * @return uint256 The converted amount in Debt Token.
   */
  function _convertToDebt(uint256 amount) internal virtual returns (uint256) {
    uint256 amountOutMinimum = 0;
    if (getMaxSlippage() > 0) {
      uint256 ethAmount = _toDebt(
        IOracle.PriceOptions({ maxAge: getPriceMaxAge(), maxConf: getPriceMaxConf() }),
        amount,
        false
      );
      amountOutMinimum =
        (ethAmount * (PERCENTAGE_PRECISION - getMaxSlippage())) /
        PERCENTAGE_PRECISION;
    }
    // 1.Swap Colalteral -> Debt Token
    (, uint256 amountOut) = swap(
      ISwapHandler.SwapParams(
        _collateralToken, // Asset In
        _debtToken, // Asset Out
        ISwapHandler.SwapType.EXACT_INPUT, // Swap Mode
        amount, // Amount In
        amountOutMinimum, // Amount Out
        bytes("") // User Payload
      )
    );
    return amountOut;
  }

  /**
   * @dev Internal function to convert the specified amount from Collateral Token to Debt Token.
   *
   * This function calculates the equivalent amount in Debt Tokeb based on the latest price from the collateral oracle.
   *
   * @param amountIn The amount in the underlying collateral.
   * @return amountOut The equivalent amount in Debt Token.
   */
  function _toDebt(
    IOracle.PriceOptions memory priceOptions,
    uint256 amountIn,
    bool roundUp
  ) internal view returns (uint256 amountOut) {
    amountOut = amountIn.mulDiv(
      _oracle.getSafeLatestPrice(priceOptions).price,
      _oracle.getPrecision(),
      roundUp
    );
    amountOut = amountOut.toDecimals(
      ERC20Upgradeable(_collateralToken).decimals(),
      ERC20Upgradeable(_debtToken).decimals()
    );
  }

  /**
   * @dev Internal function to convert the specified amount from Debt Token to Collateral Token.
   *
   * This function calculates the equivalent amount in the underlying collateral based on the latest price from the collateral oracle.
   *
   * @param amountIn The amount in Debt Token to be converted.
   * @return amountOut The equivalent amount in the underlying collateral.
   */
  function _toCollateral(
    IOracle.PriceOptions memory priceOptions,
    uint256 amountIn,
    bool roundUp
  ) internal view returns (uint256 amountOut) {
    amountOut = amountIn.mulDiv(
      _oracle.getPrecision(),
      _oracle.getSafeLatestPrice(priceOptions).price,
      roundUp
    );
    amountOut = amountOut.toDecimals(
      ERC20Upgradeable(_debtToken).decimals(),
      ERC20Upgradeable(_collateralToken).decimals()
    );
  }

  /**
   * @dev Executes the supply and borrow operations on AAVE, converting assets from Debt Token.
   *
   * This function is private and is used internally in the AAVEv3 strategy for depositing collateral
   * and borrowing ETH on the AAVE platform. It involves converting assets from Debt Tokens to the respective
   * tokens, supplying collateral, and borrowing ETH. The strategy owned value is logged on the  `StrategyDeploy` event.
   *
   * @param amount The amount to be supplied to AAVE (collateral) in Debt Token.
   * @param loanAmount The amount to be borrowed from AAVE in Debt Token.
   * @param fee The fee amount in Debt Token associated with the flash loan.
   *
   * Requirements:
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function _supplyBorrow(uint256 amount, uint256 loanAmount, uint256 fee) internal {
    uint256 collateralIn = _convertToCollateral(amount + loanAmount);
    // Deposit on AAVE Collateral and Borrow Debt Token
    _supplyAndBorrow(collateralIn, loanAmount + fee);
    uint256 collateralInDebt = _toDebt(
      IOracle.PriceOptions({ maxAge: getPriceMaxAge(), maxConf: getPriceMaxConf() }),
      collateralIn,
      false
    );
    uint256 deployedAmount = collateralInDebt - loanAmount - fee;
    _pendingAmount = deployedAmount;
    emit StrategyDeploy(msg.sender, deployedAmount);
  }

  /**
   * @dev Repays a specified amount, withdraws collateral, and sends the remaining Debt Token to the specified receiver.
   *
   * This private function is used internally to repay a specified amount on AAVE, withdraw collateral, and send
   * the remaining ETH to the specified receiver. It involves checking the available balance, repaying the debt on
   * AAVE, withdrawing the specified amount of collateral, converting collateral to Debt Token, unwrapping Debt Token, and finally
   * sending the remaining ETH to the receiver. The function emits the `StrategyUndeploy` event after the operation.
   *
   * @param withdrawAmount The amount of collateral balance to be withdraw.
   * @param repayAmount The amount of debt balance be repaid on AAVE.
   * @param fee The fee amount in debt balance to be paid as feed
   * @param receiver The address to receive the remaining debt tokens after debt repayment and withdrawal.
   *
   * Requirements:
   * - The AAVEv3 strategy must be properly configured and initialized.
   */
  function _repayAndWithdraw(
    uint256 withdrawAmount,
    uint256 repayAmount,
    uint256 fee,
    address payable receiver
  ) internal {
    (uint256 collateralBalance, ) = getBalances();
    uint256 cappedWithdrawAmount = collateralBalance < withdrawAmount
      ? collateralBalance
      : withdrawAmount;

    _repay(repayAmount);
    _withdraw(cappedWithdrawAmount, address(this));

    uint256 withdrawnAmount = _convertToDebt(cappedWithdrawAmount);
    uint256 debtToWithdraw = withdrawnAmount > (repayAmount + fee)
      ? withdrawnAmount - (repayAmount + fee)
      : 0;

    if (debtToWithdraw > 0) {
      IERC20Upgradeable(_debtToken).safeTransfer(receiver, debtToWithdraw);
    }

    _pendingAmount = debtToWithdraw;
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
  function _supply(uint256 amountIn) internal virtual;

  /**
   * @dev Deposit and borrow and asset using the asset deposited as collateral
   */
  function _supplyAndBorrow(uint256 amountIn, uint256 borrowOut) internal virtual;

  /**
   *  @dev Repay any borrow debt
   */
  function _repay(uint256 amount) internal virtual;

  /**
   * @dev  Withdraw a deposited asset from a money market
   *
   * @param amount The amoun to withdraw
   * @param to the account that will receive the asset
   */
  function _withdraw(uint256 amount, address to) internal virtual;

  /**
   * @dev
   */
  function renounceOwnership() public virtual override {
    revert InvalidOwner();
  }

  function getOracle() public view returns (address oracle) {
    oracle = address(_oracle);
  }

  function setOracle(IOracle oracle) public onlyGovernor {
    _oracle = oracle;
  }

  function asset() public view override returns (address) {
    return _debtToken;
  }

  function getCollateralAsset() external view returns (address) {
    return _collateralToken;
  }

  function getDebAsset() external view returns (address) {
    return _debtToken;
  }
  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * settings without shifting down storage in the inheritance chain.
   */
  uint256[25] private __gap;
}
