// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {PERCENTAGE_PRECISION} from "./Constants.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {UseSettings} from "./hooks/UseSettings.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

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
contract BakerFiVault is Ownable, Pausable, ERC20Permit, UseSettings, ReentrancyGuard {
    using RebaseLibrary for Rebase;
    using SafeERC20 for ERC20;
    using Address for address;
    using Address for address payable;

    string constant private _NAME = "Bread ETH";
    string constant private _SYMBOL = "brETH";

    // The System System register
    ServiceRegistry private immutable _registry;
    IStrategy private immutable _strategy;

    event Deposit(address depositor, address receiver, uint256 amount, uint256 shares);
    event Withdraw(address owner, uint256 amount, uint256 shares);

    /**
     * Deploy The Vaults
     * @param initialOwner The owner of this contract that is able to change the settings
     * @param registry The Contract Registry address
     * @param strategy  The Strategy applied on this vault
     */
    constructor(
        address initialOwner,
        ServiceRegistry registry,
        IStrategy strategy
    ) ERC20Permit(_NAME) ERC20(_NAME, _SYMBOL) UseSettings(registry) {
        require(initialOwner != address(0), "Invalid Owner Address");
        _transferOwnership(initialOwner);
        _registry = registry;
        _strategy = strategy;
    }

    /**
     * Function to rebalance the strategy, prevent a liquidation and pay fees
     * to protocol by minting shares to the fee receiver
     */
    function rebalance() external nonReentrant returns (int256 balanceChange)  {
        uint256 currentPos = totalPosition();
        if (currentPos > 0) {
            balanceChange = _strategy.harvest();           
            if (balanceChange > 0) {
                if (
                    settings().getFeeReceiver() != address(this) &&
                    settings().getPerformanceFee() > 0
                ) {           
                    uint256 feeInEth = uint256(balanceChange) * 
                        settings().getPerformanceFee() / 
                        PERCENTAGE_PRECISION;                    
                    uint256 percToTreasury = feeInEth *  PERCENTAGE_PRECISION / currentPos ;
                    uint256 sharesToMint = percToTreasury * totalSupply() / PERCENTAGE_PRECISION;
                    _mint(settings().getFeeReceiver(), sharesToMint);
                }
            }
        }
    }

    /**
     * Function to receive ETH Payments from the strategy
     */
    
    // solhint-disable-next-line no-empty-blocks        
    receive() external payable {}

    /**
     * Deposit msg.value ETH and leverage the position on the strategy
     * a number of shares are going to received by the receiver
     *
     * @param receiver The account that receives the shares minted
     */
    function deposit(address receiver) external payable nonReentrant returns (uint256 shares) {
        require(msg.value > 0, "Invalid Amount to be deposit");
        Rebase memory total = Rebase(totalPosition(), totalSupply());
        bytes memory result = (address(_strategy)).functionCallWithValue(
            abi.encodeWithSignature("deploy()"), 
            msg.value
        );
        uint256 amount= abi.decode(result, (uint256));
        shares = total.toBase(amount, false);
        _mint(receiver, shares);
        emit Deposit(msg.sender, receiver, msg.value, shares);
    }

    /**
     * Burn shares and receive the ETH unrolled to a receiver
     * @param shares The amount of shares (mateETH) to be burned
     * @param receiver The account that is going to receive the assets
     */
    function withdraw(uint256 shares, address payable receiver) external nonReentrant returns (uint256 amount) {
        require(balanceOf(msg.sender) >= shares, "No Enough balance to withdraw");
        require(receiver != address(0), "Invalid Receiver");
        uint256 percentageToBurn = shares * PERCENTAGE_PRECISION / totalSupply();
        uint256 withdrawAmount = totalPosition() * percentageToBurn /PERCENTAGE_PRECISION;
        amount = _strategy.undeploy(withdrawAmount, payable(this));
        // Withdraw ETh to Receiver and pay withdrawal Fees
        if (settings().getWithdrawalFee() != 0  && settings().getFeeReceiver() != address(0)) {
            uint256 fee = amount * settings().getWithdrawalFee() /PERCENTAGE_PRECISION;
            payable(receiver).sendValue(amount - fee);
            payable(settings().getFeeReceiver()).sendValue(fee);          
        } else {
            payable(receiver).sendValue(amount);
        }
        _burn(msg.sender, shares);
        emit Withdraw(msg.sender, amount, shares);
    }

    /**
     * Percentage of borrowed per value provided
     */
    function loanToValue() public view returns (uint256 ltv) {
        (,, ltv) = _strategy.getPosition();    
    }

    /**
     * Total Amount of assets controlled by strategy
     */
    function totalCollateral() public view returns (uint256 totalCollateralInEth) {
        (totalCollateralInEth,, ) = _strategy.getPosition();
    }

    /**
     * Totaal of liabilities on the strategy
     */
    function totalDebt() public view returns (uint256 totalDebtInEth) {
        (, totalDebtInEth,) = _strategy.getPosition();
    }

    /**
     * Total Assets that belong to the Share Holders
     */
    function totalPosition() public view returns (uint256 amount) {
        (uint256 totalCollateralInEth, uint256 totalDebtInEth, ) = _strategy.getPosition();
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
        return totalSupply() * 1 ether / position;
    }

}
