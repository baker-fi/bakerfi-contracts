
// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IServiceRegistry} from "../interfaces/core/IServiceRegistry.sol";

// 
// !! The Constants that should be used to resolve the deployment contract addresses !!
//
bytes32 constant FLASH_LENDER_CONTRACT =         keccak256(bytes("FlashLender"));
bytes32 constant WETH_CONTRACT =                 keccak256(bytes("WETH"));
bytes32 constant ST_ETH_CONTRACT =               keccak256(bytes("stETH"));
bytes32 constant WST_ETH_CONTRACT =              keccak256(bytes("wstETH"));
bytes32 constant AAVE_V3_CONTRACT =              keccak256(bytes("AAVE_V3"));
bytes32 constant WSTETH_ETH_ORACLE_CONTRACT =    keccak256(bytes("wstETH/ETH Oracle"));
bytes32 constant CBETH_ETH_ORACLE_CONTRACT =     keccak256(bytes("cbETH/ETH Oracle"));
bytes32 constant ETH_USD_ORACLE_CONTRACT =       keccak256(bytes("ETH/USD Oracle"));
bytes32 constant CBETH_ERC20_CONTRACT =          keccak256(bytes("cbETH"));
bytes32 constant UNISWAP_ROUTER_CONTRACT =       keccak256(bytes("Uniswap Router"));
bytes32 constant SWAPPER_HANDLER_CONTRACT =      keccak256(bytes("Swapper Handler"));
bytes32 constant BALANCER_VAULT_CONTRACT =       keccak256(bytes("Balancer Vault"));
bytes32 constant SETTINGS_CONTRACT =             keccak256(bytes("Settings"));
bytes32 constant UNISWAP_QUOTER_CONTRACT =       keccak256(bytes("Uniswap Quoter"));
bytes32 constant STRATEGY_CONTRACT =             keccak256(bytes("Strategy"));

/**
 * @title Service used to save the addresses used on the deployment
 * @author BakerFi
 * @notice 
 */
contract ServiceRegistry is Ownable, IServiceRegistry {

    event ServiceUnregistered(bytes32 nameHash);
    event ServiceRegistered(bytes32 nameHash, address service);
    
    mapping(bytes32 => address) private _services;

    /**
     * 
     */
    constructor(address ownerToSet) Ownable()
    {
        require(ownerToSet != address(0), "Invalid Owner Address");
        _transferOwnership(ownerToSet);
    }

    /**
     * Register a Service contrat 
     * @param serviceNameHash Service Name's Keccak256
     * @param serviceAddress Contract Address 
     */
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

    /**
     * Unregister a service name 
     * @param serviceNameHash Service Name keccak256 
     */
    function unregisterService(bytes32 serviceNameHash) external onlyOwner {
        require(
            _services[serviceNameHash] != address(0),
            "Service does not exist"
        );
        _services[serviceNameHash] = address(0);
        emit ServiceUnregistered(serviceNameHash);
    }
    /**
     * Gets the Contract address for the service name provided
     * @param name  Service Name
     */
    function getServiceNameHash(
        string memory name
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(name));
    }
    
    /**
     * 
     */
    function getService(string memory serviceName) external view returns (address) {
        return _services[keccak256(abi.encodePacked(serviceName))];
    }

    /**
     * 
     * @param serviceHash Service Name keccak256 
     */
    function getServiceFromHash(bytes32  serviceHash) external view returns (address) {
        return _services[serviceHash];
    }  
}
