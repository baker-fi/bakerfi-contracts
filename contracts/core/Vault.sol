// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Rebase, RebaseLibrary} from "../libraries/RebaseLibrary.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {IVault} from "../interfaces/core/IVault.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {PERCENTAGE_PRECISION} from "./Constants.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {UseSettings} from "./hooks/UseSettings.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

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
    using SafeERC20Upgradeable for ERC20Upgradeable;
    using AddressUpgradeable for address;
    using AddressUpgradeable for address payable;

    error InvalidOwner();
    error InvalidDepositAmount();
    error InvalidAssetsState();
    error MaxDepositReached();
    error NotEnoughBalanceToWithdraw();
    error InvalidWithdrawAmount();
    error NoAssetsToWithdraw();
    error NoPermissions();
    error ETHTransferNotAllowed(address sender);

    /**
     * @dev The IStrategy contract representing the strategy for managing assets.
     *
     * This private state variable holds the reference to the IStrategy contract,
     * which defines the strategy for managing assets within the current contract.
     */
    IStrategy private _strategy;

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
    function rebalance()
        external
        override
        nonReentrant
        whenNotPaused
        returns (int256 balanceChange)
    {
        uint256 maxPriceAge = settings().getRebalancePriceMaxAge();
        uint256 currentPos = _totalAssets(maxPriceAge);
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
                    uint256 feeInEthScaled = uint256(balanceChange) *
                        settings().getPerformanceFee();
                    uint256 sharesToMint = (feeInEthScaled * totalSupply()) /
                        _totalAssets(maxPriceAge) /
                        PERCENTAGE_PRECISION;
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
        if (msg.sender != address(_strategy)) revert ETHTransferNotAllowed(msg.sender);
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
    function deposit(
        address receiver
    )
        external
        payable
        override
        nonReentrant
        whenNotPaused
        onlyWhiteListed
        returns (uint256 shares)
    {
        if (msg.value == 0) revert InvalidDepositAmount();
        uint256 maxPriceAge = settings().getPriceMaxAge();
        Rebase memory total = Rebase(_totalAssets(maxPriceAge), totalSupply());
        if (
            // Or the Rebase is unititialized
            !((total.elastic == 0 && total.base == 0) ||
                // Or Both are positive
                (total.base > 0 && total.elastic > 0))
        ) revert InvalidAssetsState();
        // Verify if the Deposit Value exceeds the maximum per wallet
        uint256 maxDeposit = settings().getMaxDepositInETH();
        if (maxDeposit > 0) {
            uint256 afterDeposit = msg.value +
                ((balanceOf(msg.sender) * _tokenPerETH(maxPriceAge)) / 1e18);
            if (afterDeposit > maxDeposit) revert MaxDepositReached();
        }

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
    function withdraw(
        uint256 shares
    ) external override nonReentrant onlyWhiteListed whenNotPaused returns (uint256 amount) {
        if (balanceOf(msg.sender) < shares) revert NotEnoughBalanceToWithdraw();
        if (shares == 0) revert InvalidWithdrawAmount();
        /**
         *   withdrawAmount -------------- totalAssets()
         *   shares         -------------- totalSupply()
         *
         *   withdrawAmount = share * totalAssets() / totalSupply()
         */
        uint256 withdrawAmount = (shares * _totalAssets(settings().getPriceMaxAge())) /
            totalSupply();
        if (withdrawAmount == 0) revert NoAssetsToWithdraw();
        amount = _strategy.undeploy(withdrawAmount);
        uint256 fee = 0;
        _burn(msg.sender, shares);
        // Withdraw ETh to Receiver and pay withdrawal Fees
        if (settings().getWithdrawalFee() != 0 && settings().getFeeReceiver() != address(0)) {
            fee = (amount * settings().getWithdrawalFee()) / PERCENTAGE_PRECISION;
            payable(msg.sender).sendValue(amount - fee);
            payable(settings().getFeeReceiver()).sendValue(fee);
        } else {
            payable(msg.sender).sendValue(amount);
        }     
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
    function totalAssets() public view override returns (uint256 amount) {
        amount = _strategy.deployed(0);
    }

    function _totalAssets(uint256 priceMaxAge) private view returns (uint256 amount) {
        amount = _strategy.deployed(priceMaxAge);
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
     * @return rate The calculated token-to-ETH exchange rate.
     */
    function tokenPerETH() external view override returns (uint256) {
        return _tokenPerETH(0);
    }

    function _tokenPerETH(uint256 priceMaxAge) internal view returns (uint256) {
        uint256 position = _totalAssets(priceMaxAge);
        if (totalSupply() == 0 || position == 0) {
            return 1 ether;
        }
        return (totalSupply() * 1 ether) / position;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * 
     */
    uint256[49] private __gap;
}
