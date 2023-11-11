// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import {IVault} from "../interfaces/core/IVault.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {PERCENTAGE_PRECISION} from "./Constants.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {UseSettings} from "./hooks/UseSettings.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * BakerFi Vault
 * This pool allows a user to leverage their yield position and exposure 
 * using a recursive strategy based on flash loans and borrow markets.
 *
 * @title BakerFi Vault smart contract
 * @author BakerFi
 * @notice
 */
contract BakerFiVault is 
    OwnableUpgradeable,
    PausableUpgradeable,     
    ReentrancyGuardUpgradeable,
    ERC20PermitUpgradeable, 
    UseSettings,
    IVault
{
    using RebaseLibrary for Rebase;
    using SafeERC20Upgradeable for ERC20Upgradeable;
    using AddressUpgradeable for address;
    using AddressUpgradeable for address payable;

    string constant private _NAME = "Bread ETH";
    string constant private _SYMBOL = "brETH";

    // The System System register
    ServiceRegistry private _registry;
    IStrategy private _strategy;

    event Deposit(address indexed depositor, address indexed receiver, uint256 indexed amount, uint256 shares);
    event Withdraw(address indexed owner, uint256 amount, uint256 indexed shares);

    modifier onlyWhiteListed {
      require(settings().isAccountEnabled(msg.sender), "Account not allowed");
      _;
    }

    /**
     * Deploy The Vaults
     * @param initialOwner The owner of this contract that is able to change the settings
     * @param registry The Contract Registry address
     * @param strategy  The Strategy applied on this vault
     */
    function initialize(
        address initialOwner,
        ServiceRegistry registry,
        IStrategy strategy
    ) public initializer {
        __ERC20Permit_init(_NAME);
        __ERC20_init(_NAME, _SYMBOL);
        __initUseSettings(registry);
        require(initialOwner != address(0), "Invalid Owner Address");
        _transferOwnership(initialOwner);
        _registry = registry;
        _strategy = strategy;
    }

    /**
     * Function to rebalance the strategy, prevent a liquidation and pay fees
     * to protocol by minting shares to the fee receiver
     */
    function rebalance() external override nonReentrant returns (int256 balanceChange)  {
        uint256 currentPos = totalAssets();
        if (currentPos > 0) {
            balanceChange = _strategy.harvest();           
            if (balanceChange > 0) {
                if (
                    settings().getFeeReceiver() != address(this) &&
                    settings().getFeeReceiver() != address(0) && 
                    settings().getPerformanceFee() > 0
                ) {           
                    uint256 updatedPos = totalAssets();
                    uint256 feeInEth = uint256(balanceChange) * 
                        settings().getPerformanceFee() / 
                        PERCENTAGE_PRECISION;                    
                    
                    uint256 percToTreasury = feeInEth *  PERCENTAGE_PRECISION / updatedPos ;
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
    function deposit(address receiver) external override payable nonReentrant onlyWhiteListed returns (uint256 shares) {
        require(msg.value > 0, "Invalid Amount to be deposit");
        Rebase memory total = Rebase(totalAssets(), totalSupply());
        require(
            // Or the Rebase is unititialized 
            (total.elastic == 0 && total.base == 0 ) 
            // Or Both are positive
            || (total.base > 0 && total.elastic > 0), 
            "Invalid Assets/Shares state"
        );

        bytes memory result = (address(_strategy)).functionCallWithValue(
            abi.encodeWithSignature("deploy()"), 
            msg.value
        );
       
        uint256 amount = abi.decode(result, (uint256));
        shares = total.toBase(amount, false);
        _mint(receiver, shares);
        emit Deposit(msg.sender, receiver, msg.value, shares);
    }

    /**
     * Burn shares and receive the ETH unrolled to a receiver
     * @param shares The amount of shares (mateETH) to be burned
     */
    function withdraw(uint256 shares) external override nonReentrant onlyWhiteListed returns (uint256 amount) {
        require(balanceOf(msg.sender) >= shares, "No Enough balance to withdraw");
        require(shares > 0, "Cannot Withdraw Zero Shares");
        uint256 percentageToBurn = shares * PERCENTAGE_PRECISION / totalSupply();
        uint256 withdrawAmount = totalAssets() * percentageToBurn / PERCENTAGE_PRECISION;
        require(withdrawAmount > 0, "No Assets to withdraw");
        amount = _strategy.undeploy(withdrawAmount);
        uint256 fee = 0;
        // Withdraw ETh to Receiver and pay withdrawal Fees
        if (settings().getWithdrawalFee() != 0  && settings().getFeeReceiver() != address(0)) {
            fee = amount * settings().getWithdrawalFee() /PERCENTAGE_PRECISION;
            payable(msg.sender).sendValue(amount - fee);
            payable(settings().getFeeReceiver()).sendValue(fee);          
        } else {
            payable(msg.sender).sendValue(amount);
        }
        _burn(msg.sender, shares);
        emit Withdraw(msg.sender, amount - fee, shares);
    }

    /**
     * Total Assets that belong to the Share Holders
     */
    function totalAssets() public override view returns (uint256 amount) {
        amount = _strategy.deployed();
    } 

    /**
     * Convert an Ammount of Assets to shares
     * @param assets The amount of assets to convert
     */
    function convertToShares(uint256 assets) external override view returns (uint256 shares) {
        Rebase memory total = Rebase(totalAssets(), totalSupply());
        shares = total.toBase(assets, false);
    }

    /**
     * Convert a number of shares to the ETH value
     * @param shares The amount of shares to be converted
     */
    function convertToAssets(uint256 shares) external override view returns (uint256 assets) {
        Rebase memory total = Rebase(totalAssets(), totalSupply());
        assets = total.toElastic(shares, false);
    }

    /**
     * The Value of a share per 1ETH
     */
    function tokenPerETH() external override  view returns (uint256) {
        uint256 position = totalAssets();
        if (totalSupply() == 0 || position == 0) {
            return 1 ether;
        }
        return totalSupply() * 1 ether / position;
    }

}
