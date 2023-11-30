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
 * @title BakerFi Vault 🏦🧑‍🍳
 *
 * @author Chef Kenji <chef.kenji@layerx.xyz>
 * @author Chef Kal-EL <chef.kal-el@layerx.xyz>
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
 * The Contract is upgradable and can use a BakerProxy in front of.
 * 
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

    /**
     * @dev The name of the ERC-20 token.
     *
     * This private constant string represents the name of the ERC-20 token used for the vault shares.
     */
    string constant private _NAME = "Bread ETH";

    /**
     * @dev The symbol of the ERC-20 token.
     *
     * This private constant string represents the symbol of the ERC-20 token used the vault shares.
     */
    string constant private _SYMBOL = "brETH";

    /**
     * @dev The ServiceRegistry contract used for managing service-related dependencies.
     * 
     * This private state variable holds the reference to the ServiceRegistry contract
     * that is utilized within the current contract for managing various service dependencies.
     */
    ServiceRegistry private _registry;
    /**
     * @dev The IStrategy contract representing the strategy for managing assets.
     * 
     * This private state variable holds the reference to the IStrategy contract,
     * which defines the strategy for managing assets within the current contract.
     */
    IStrategy       private _strategy;

    /**
     * @dev Modifier to restrict access to addresses that are whitelisted.
     *
     * This modifier ensures that only addresses listed in the account whitelist
     * within the contract's settings are allowed to proceed with the function call.
     * If the caller's address is not whitelisted, the function call will be rejected.
     */
    modifier onlyWhiteListed {
      require(settings().isAccountEnabled(msg.sender), "Account not allowed");
      _;
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
        ServiceRegistry registry,
        IStrategy strategy
    ) public initializer {
        __ERC20Permit_init(_NAME);
        __ERC20_init(_NAME, _SYMBOL);
        _initUseSettings(registry);
        require(initialOwner != address(0), "Invalid Owner Address");
        _transferOwnership(initialOwner);
        _registry = registry;
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
                    /**
                     *   feeInEth       -------------- totalAssets()
                     *   sharesToMint   -------------- totalSupply()
                     *    
                     *   sharesToMint = feeInEth * totalSupply() / totalAssets();
                     */
                    uint256 feeInEthScaled = uint256(balanceChange) * settings().getPerformanceFee();                                           
                    uint256 sharesToMint = feeInEthScaled * totalSupply() / totalAssets()  / PERCENTAGE_PRECISION;
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
     * Emits no events and allows the contract to accept Ether.
     */
    receive() external payable {}

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
     * @dev Withdraws a specified number of vault's shares, converting them to ETH and 
     * transferring to the caller.
     *
     * This function is externally callable, marked as non-reentrant, and restricted to whitelisted addresses.
     * It checks for sufficient balance, non-zero share amount, and undeploy the capital from the strategy 
     * to handle the withdrawal request. It calculates withdrawal fees, transfers Ether to the caller, and burns the
     * withdrawn shares.
     *
     * @param shares The number of shares to be withdrawn.
     * @return amount The amount of Ether withdrawn after fees.
     *
     * Emits a {Withdraw} event after successfully handling the withdrawal.
     */
    function withdraw(uint256 shares) external override nonReentrant onlyWhiteListed returns (uint256 amount) {
        require(balanceOf(msg.sender) >= shares, "No Enough balance to withdraw");
        require(shares > 0, "Cannot Withdraw Zero Shares");
        /**
         *   withdrawAmount -------------- totalAssets()
         *   shares         -------------- totalSupply()
         *    
         *   withdrawAmount = share * totalAssets() / totalSupply()
         */
        uint256 withdrawAmount = shares * totalAssets() / totalSupply();
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
     * @dev Retrieves the total assets controlled/belonging to the vault
     *
     * This function is publicly accessible and provides a view of the total assets currently
     * deployed in the current strategy.
     *
     * @return amount The total assets under management by the strategy.
     */
    function totalAssets() public override view returns (uint256 amount) {
        amount = _strategy.deployed();
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
    function convertToShares(uint256 assets) external override view returns (uint256 shares) {
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
    function convertToAssets(uint256 shares) external override view returns (uint256 assets) {
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
     * @return rate The calculated token-to-ETH exchange rate.
     */
    function tokenPerETH() external override  view returns (uint256) {
        uint256 position = totalAssets();
        if (totalSupply() == 0 || position == 0) {
            return 1 ether;
        }
        return totalSupply() * 1 ether / position;
    }
}
