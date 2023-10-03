
// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IServiceRegistry} from "../interfaces/core/IServiceRegistry.sol";

contract ServiceRegistry is Ownable, IServiceRegistry {

    event ServiceUnregistered(bytes32 nameHash);
    event ServiceRegistered(bytes32 nameHash, address service);
    
    mapping(bytes32 => address) private _services;

    constructor(address owner) {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
    }

    function registerService(
        bytes32 serviceNameHash,
        address serviceAddress
    ) external onlyOwner {
        require(
            _services[serviceNameHash] == address(0),
            "Service is already set"
        );
        _services[serviceNameHash] = serviceAddress;
        emit ServiceRegistered(serviceNameHash, serviceAddress);
    }

    function unregisterService(bytes32 serviceNameHash) external onlyOwner {
        require(
            _services[serviceNameHash] != address(0),
            "Service does not exist"
        );
        _services[serviceNameHash] = address(0);
        emit ServiceUnregistered(serviceNameHash);
    }

    function getServiceNameHash(
        string memory name
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(name));
    }

    function getService(string memory serviceName) external view returns (address) {
        return _services[keccak256(abi.encodePacked(serviceName))];
    }

    function getServiceFromHash(bytes32  serviceHash) external view returns (address) {
        return _services[serviceHash];
    }  
}
