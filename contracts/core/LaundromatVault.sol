// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {PERCENTAGE_PRECISION} from "./Constants.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * Landromat Vault
 * This pool allows the user the leverage their yield position and exposure the user to
 * boosted returns using recursive
 *
 * TODO:
 * - Harvest Function to collect fees from yield performance +-10%
 * - Withdraw Fee 0.10%
 *
 * @title Landromat Vault smart contract
 * @author Helder Vasconcelos
 * @notice
 */
contract LaundromatVault is Ownable, Pausable, ERC20Permit {
    using SafeMath for uint256;
    using RebaseLibrary for Rebase;
    using SafeERC20 for ERC20;

    string constant NAME = "laundromat ETH";
    string constant SYMBOl = "matETH";

    // The System System register
    ServiceRegistry public immutable _registry;
    IStrategy private immutable _strategy;

    uint256 private _withdrawalFee = 10 * 1e6; // 10%
    uint256 private _performanceFee = 10 * 1e6; // 10%
    address private _feeReceiver = address(0);

    event Deposit(address depositor, address receiver, uint256 amount, uint256 shares);
    event Withdraw(address owner, uint256 amount, uint256 shares);

    /**
     * Deploy The Vaults
     * @param owner The owner of this contract that is able to change the settings
     * @param registry The Contract Registry address
     * @param strategy  The Strategy applied on this vault
     */
    constructor(
        address owner,
        ServiceRegistry registry,
        IStrategy strategy
    ) ERC20Permit(NAME) ERC20(NAME, SYMBOl) {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
        _registry = registry;
        _strategy = strategy;
    }

    /**
     * Function to rebalance the strategy and prevent a liquidation
     */
    function rebalance() external {
        if (totalPosition() > 0) {
            _strategy.harvest();
        }
    }

    /**
     * Function to receive ETH Payments from the strategy
     */
    receive() external payable {}

    /**
     * Deposit msg.value ETH and leverage the position on the strategy
     * a number of shares are going to received by the receiver
     *
     * @param receiver The account that receives the shares minted
     */
    function deposit(address receiver) external payable returns (uint256 shares) {
        require(msg.value > 0, "Invalid Amount to be deposit");
        Rebase memory total = Rebase(totalPosition(), totalSupply());
        uint256 amount = _strategy.deploy{value: msg.value}();
        shares = total.toBase(amount, false);
        _mint(receiver, shares);
        emit Deposit(msg.sender, receiver, msg.value, shares);
    }

    /**
     * Burn shares and receive the ETH unrolled to a receiver
     * @param shares The amount of shares (mateETH) to be burned
     * @param receiver The account that is going to receive the assets
     */
    function withdraw(uint256 shares, address payable receiver) external returns (uint256 amount) {
        require(balanceOf(msg.sender) >= shares, "No Enough balance to withdraw");
        uint256 percentageToBurn = shares.mul(PERCENTAGE_PRECISION).div(totalSupply());
        uint256 withdrawAmount = (totalPosition()).mul(percentageToBurn).div(PERCENTAGE_PRECISION);
        amount = _strategy.undeploy(withdrawAmount, receiver);

        _burn(msg.sender, shares);
        emit Withdraw(msg.sender, amount, shares);
    }

    /**
     * Percentage of borrowed per value provided
     */
    function loanToValue() public view returns (uint256 ltv) {
        (uint256 totalCollateralInEth, uint256 totalDebtInEth) = _strategy.getPosition();
        if (totalCollateralInEth == 0) {
            ltv = 0;
        } else {
            ltv = totalDebtInEth.mul(PERCENTAGE_PRECISION).div(totalCollateralInEth);
        }
    }

    /**
     * Total Amount of assets controlled by strategy
     */
    function totalCollateral() public view returns (uint256 totalCollateralInEth) {
        (totalCollateralInEth, ) = _strategy.getPosition();
    }

    /**
     * Totaal of liabilities on the strategy
     */
    function totalDebt() public view returns (uint256 totalDebtInEth) {
        (, totalDebtInEth) = _strategy.getPosition();
    }

    /**
     * Total Assets that belong to the Share Holders
     */
    function totalPosition() public view returns (uint256 amount) {
        (uint256 totalCollateralInEth, uint256 totalDebtInEth) = _strategy.getPosition();
        amount = totalCollateralInEth - totalDebtInEth;
    }

    /**
     * Convert an Ammount of Assets to shares
     * @param assets The amount of assets to convert
     */
    function convertToShares(uint256 assets) external view returns (uint256 shares) {
        Rebase memory total = Rebase(totalPosition(), totalSupply());
        shares = total.toBase(assets, false);
    }

    /**
     * Convert a number of shares to the ETH value
     * @param shares The amount of shares to be converted
     */
    function convertToAssets(uint256 shares) external view returns (uint256 assets) {
        Rebase memory total = Rebase(totalPosition(), totalSupply());
        assets = total.toElastic(shares, false);
    }

    /**
     * The Value of a share per 1ETH
     */
    function tokenPerETh() public view returns (uint256) {
        uint256 position = totalPosition();
        if (totalSupply() == 0 || position == 0) {
            return 0;
        }
        return totalSupply().mul(1 ether).div(position);
    }

    function setWithdrawalFee(uint256 fee) external onlyOwner {
        require(fee <  PERCENTAGE_PRECISION);
        _withdrawalFee = fee;
    }

    function getWithdrawalFee() external view returns (uint256) {
        return _withdrawalFee;
    }

    function setPerformanceFee(uint256 fee) external onlyOwner {
        require(fee <  PERCENTAGE_PRECISION);
        _performanceFee = fee;
    }

    function getPerformanceFee() external view returns (uint256) {
        return _performanceFee;
    }


    function setFeeReceiver(address receiver) external onlyOwner {
        require(receiver != address(0));
        _feeReceiver = receiver;
    }

    function getFeeReceiver() external view returns (address) {
        return _feeReceiver;
    }

  
    
}
