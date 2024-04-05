// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract GovernableOwnable is OwnableUpgradeable {
    
    address private _governor;
    
    error CallerNotTheGovernor();
    error InvalidGovernorAddress();

    event GovernshipTransferred(address indexed previousGovernor, address indexed newGovernor);

    function _initializeGovernableOwnable(address initialOwner, address initialGovernor) public initializer {
        _transferOwnership(initialOwner);
        _transferGovernorship(initialGovernor); 
    }

    modifier onlyGovernor() {
        if(msg.sender != governor()) revert CallerNotTheGovernor();
        _;
    }

    function governor() public view virtual returns (address) {
        return _governor;
    }

    function transferGovernorship(address _newGovernor) public virtual onlyGovernor {
        if(_newGovernor == address(0)) revert InvalidGovernorAddress();
        _transferGovernorship(_newGovernor);
    }

    function _transferGovernorship(address newGovernor) internal virtual {
        emit GovernshipTransferred(_governor, newGovernor);
        _governor = newGovernor;
    }

}
