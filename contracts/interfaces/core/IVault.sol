// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

/**
 * @title BakerFi IVault 🏦🧑‍🍳
 * @author Chef Kenji <chef.kenji@layerx.xyz>
 * @author Chef Kal-EL <chef.kal-el@layerx.xyz>
 * */
abstract contract IVault {    
    /**
     * @dev Emitted when a ETH deposit is made to the contract.
     *
     * This event provides information about the depositor, receiver, deposited amount,
     * and the corresponding number of shares minted as a result of the deposit.
     *
     * @param depositor The address initiating the deposit.
     * @param receiver The address receiving the minted shares.
     * @param amount The amount of Ether deposited.
     * @param shares The number of shares minted for the deposit.
     */
    event Deposit(address indexed depositor, address indexed receiver, uint256 indexed amount, uint256 shares);
    
    /**
     * @dev Emitted when a withdrawal is made from the contract.
     *
     * This event provides information about the owner initiating the withdrawal, the withdrawn amount,
     * and the corresponding number of shares burned as a result of the withdrawal.
     *
     * @param owner The address initiating the withdrawal.
     * @param amount The amount of Ether withdrawn after fees.
     * @param shares The number of shares burned for the withdrawal.
     */    
    event Withdraw(address indexed owner, uint256 amount, uint256 indexed shares);

    /**
     * @dev Deposits Ether into the contract and mints vault's shares for the specified receiver.
     *
     * @param receiver The address to receive the minted shares.
     * @return shares The number of shares minted for the specified receiver.
     */
    function deposit(address receiver) external virtual payable returns (uint256 shares);

    /**
     * @dev Withdraws a specified number of vault's shares, converting them to ETH and 
     * transferring to the caller.
     *
     * @param shares The number of shares to be withdrawn.
     * @return amount The amount of Ether withdrawn after fees.
     *
     * Emits a {Withdraw} event after successfully handling the withdrawal.
     */
    function withdraw(uint256 shares) external virtual returns (uint256 amount);
    
    /**
     * @dev Retrieves the total assets controlled/belonging to the vault
     *
     * This function is publicly accessible and provides a view of the total assets currently
     * deployed in the current strategy.
     *
     * @return amount The total assets under management by the strategy.
     */
    function totalAssets() public view virtual returns (uint256 amount);
    
    /**
     * @dev Converts the specified amount of ETH to shares.
     *
     * @param assets The amount of assets to be converted to shares.
     * @return shares The calculated number of shares.
     */
    function convertToShares(uint256 assets) external virtual view returns (uint256 shares);
    
    /**
     * @dev Converts the specified number of shares to ETH.
     *
     * @param shares The number of shares to be converted to assets.
     * @return assets The calculated amount of assets.
     */
    function convertToAssets(uint256 shares) external virtual view returns (uint256 assets);
    
    /**
     * @dev Retrieves the token-to-ETH exchange rate.
     *
     * @return rate The calculated token-to-ETH exchange rate.
     */
    function tokenPerETH() external view virtual returns (uint256 rate);
    
    /**
     * @dev Function to rebalance the strategy, prevent a liquidation and pay fees
     * to protocol by minting shares to the fee receiver
     *
     * @return balanceChange The change in balance after the rebalance operation.
     * 
     */
    function rebalance() external virtual returns (int256 balanceChange);
}