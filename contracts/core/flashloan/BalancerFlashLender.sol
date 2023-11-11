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
 *  Balancer Flash Loan Adapter
 *
 * */
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

    function maxFlashLoan(address token) external view override returns (uint256) {
        return IERC20(token).balanceOf(address(_balancerVault));
    }

    function flashFee(address, uint256) external pure override returns (uint256) {
        return 0;
    }

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
