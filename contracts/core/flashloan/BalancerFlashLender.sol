// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC3156FlashLenderUpgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashLenderUpgradeable.sol";
import {IFlashLoans, IFlashLoanRecipient} from "../../interfaces/balancer/IFlashLoan.sol";
import {ServiceRegistry, BALANCER_VAULT_CONTRACT} from "../../core/ServiceRegistry.sol";
import {UseStrategy} from "../../core/hooks/UseStrategy.sol";
import {IERC3156FlashBorrowerUpgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashBorrowerUpgradeable.sol";

/**
 * @title Balancer Flash Loan Balancer Adapter
 * 
 * @author Chef Kenji <chef.kenji@layerx.xyz>
 * @author Chef Kal-EL <chef.kal-el@layerx.xyz>
 * 
 * @dev This contract implements the ERC-3156 Flash Lender interface and serves as 
 * "Adapter" contract for the balancer flash loan interface. This approach allows us 
 * to have a static interface independent of the flash loan provider.
 * 
 */
contract BalancerFlashLender is IERC3156FlashLenderUpgradeable, IFlashLoanRecipient {
    using SafeERC20 for IERC20;

    bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

    IFlashLoans private immutable _balancerVault;

    constructor(ServiceRegistry registry) {
        _balancerVault = IFlashLoans(registry.getServiceFromHash(
            BALANCER_VAULT_CONTRACT
        ));
        require(address(_balancerVault) != address(0), "Invalid Balancer Vault");
    }

    /**
     * @dev Function to get the maximum flash loan amount available for a given token.
     * @param token The address of the token for which the maximum flash loan amount is queried.
     * @return The maximum flash loan amount available for the specified token.
     */
    function maxFlashLoan(address token) external view override returns (uint256) {
        return IERC20(token).balanceOf(address(_balancerVault));
    }

    
    function flashFee(address, uint256) external pure override returns (uint256) {
        return 0;
    }

    /**
     * @dev Function to initiate a flash loan from the Balancer Pool
     * 
     * @param borrower The address of the flash loan receiver.
     * @param token The address of the token being borrowed.
     * @param amount The amount of tokens to be borrowed.
     * @param data Arbitrary data to be passed to the flash loan recipient.
     * @return The unique identifier for the flash loan operation.
     */
    function flashLoan(
        IERC3156FlashBorrowerUpgradeable borrower,
        address token,
        uint256 amount,
        bytes calldata data
    ) external override returns (bool) {
        require(msg.sender == address(borrower), "Invalid Borrower");
        address[] memory tokens = new address[](1);
        tokens[0] = token;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        _balancerVault.flashLoan(address(this), tokens, amounts, abi.encode(borrower, data));

        return true;
    }

    /**
     * @dev Function to receive flash loans from the BalancerFlashLender contract.
     * @param tokens An array of token addresses representing the borrowed tokens.
     * @param amounts An array of amounts representing the borrowed token amounts.
     * @param feeAmounts An array of fee amounts charged for each flash loan.
     * @param userData Arbitrary data passed from the BalancerFlashLender contract.
     */
    function receiveFlashLoan(
        address[] memory tokens,
        uint256[] memory amounts,
        uint256[] memory feeAmounts,
        bytes memory userData
    ) external {
        require(msg.sender == address(_balancerVault), "Invalid Flash Loan Lender");
        require(tokens.length == 1, "Invalid Token List");
        require(amounts.length == 1, "Invalid Amount List");
        require(feeAmounts.length == 1, "Invalid Fees Amount");
        (address borrower, bytes memory originalCallData) = abi.decode(userData, (address, bytes));
        //require(borrower == address(this), "Invalid Flash Borrower");
        address asset = tokens[0];
        uint256 amount = amounts[0];
        uint256 fee = feeAmounts[0];
        // Transfer the loan received to borrower
        IERC20(asset).safeTransfer(borrower, amount);

        require(
            IERC3156FlashBorrowerUpgradeable(borrower).onFlashLoan(
                borrower,
                tokens[0],
                amounts[0],
                feeAmounts[0],
                originalCallData
            ) == CALLBACK_SUCCESS,
            "FlashBorrower: Callback failed"
        );
        // Verify that this contract is able to pay the debt
        require(
            IERC20(asset).allowance(address(borrower), address(this)) >= fee + amount,
            "No allowance to pay debt"
        );
        // Return the loan + fee to the vault
        IERC20(asset).safeTransferFrom(address(borrower), address(_balancerVault), amount + fee);
    }

}
