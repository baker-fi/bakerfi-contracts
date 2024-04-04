// SPDX-License-Identifier: BUSL-1.1
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

pragma solidity ^0.8.18;

/**
 * @title OwnableUpgradeable2Step
 * @dev This contract implements a two-step ownership transfer mechanism.
 */
contract OwnableUpgradeable2Step is Initializable {
    address private _owner;
    address private _pendingOwner;

    error CallerNotTheOwner();
    error InvalidOwnerAddress();
    error CallerNotThePendingOwner();

    /**
     * @dev Emitted when ownership is transferred.
     * @param previousOwner The address of the previous owner.
     * @param newOwner The address of the new owner.
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the initial owner.
     * @param initialOwner The address of the initial owner.
     */
    function _Ownable2Step_init(address initialOwner) internal onlyInitializing {
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), _owner);
    }

    /**
     * @dev Modifier that checks if the caller is the current owner.
     * Throws an error if the caller is not the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Internal function to check if the caller is the owner.
     * Throws an error if the caller is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != msg.sender) revert CallerNotTheOwner();
    }

    /**
     * @dev Transfers ownership to a new address.
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner == address(0)) revert InvalidOwnerAddress();
        _transferOwnership(newOwner);
    }

    /**
     * @dev Internal function to transfer ownership to a new address.
     * @param newOwner The address of the new owner.
     */
    function _transferOwnership(address newOwner) internal virtual {
        _pendingOwner = newOwner;
    }

    /**
     * @dev Accepts ownership after it has been transferred.
     */
    function acceptOwnership() external {
        if (msg.sender != _pendingOwner) revert CallerNotThePendingOwner();
        _pendingOwner = address(0);
        emit OwnershipTransferred(_owner, msg.sender);
        _owner = msg.sender;
    }

    /**
     * @dev Gets the address of the pending owner.
     * @return The address of the pending owner.
     */
    function pendingOwner() external view returns (address) {
        return _pendingOwner;
    }

    /**
     * @dev Gets the address of the current owner.
     * @return The address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }
}
