// SPDX-License-Identifier: BUSL-1.1
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

pragma solidity ^0.8.18;
contract OwnableUpgradeable2Step is Initializable  {
    
    address private _owner;
    address private _pendingOwner;

    error CallerNotTheOwner();
    error InvalidOwnerAddress();
    error CallerNotThePendingOwner();
    /**
     * 
     * Event Emmitted when there is a owner accepted
     * @param previousOwner Previous Contract Owner 
     * @param newOwner New Contract Owner 
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function __Ownable_init() internal onlyInitializing {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    modifier onlyOwner() {
       _checkOwner();
       _;
    }

    function _checkOwner() internal view virtual {
        if(owner() != msg.sender) revert CallerNotTheOwner();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if(newOwner == address(0)) revert InvalidOwnerAddress();
        _pendingOwner = newOwner;
    }

    function acceptOwnership() external {
        if(msg.sender != _pendingOwner) revert CallerNotThePendingOwner();
        _pendingOwner = address(0);
        emit OwnershipTransferred(_owner, msg.sender);
        _owner = msg.sender;
    }

    function pendingOwner() external view returns (address) {
        return _pendingOwner;
    }

    function owner() public view returns (address) {
        return _owner;
    }
}