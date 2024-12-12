// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

/**
 * @title BakerFi Service Registy Interface
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 */
interface IVaultRegistry {
  /**
   * @dev Emitted when a service is unregistered from the VaultRegistry.
   *
   * This event provides the name hash of the unregistered service.
   *
   * @param nameHash The hash of the name of the unregistered service.
   */
  event ServiceUnregistered(bytes32 nameHash);

  /**
   * @dev Emitted when a service is registered in the VaultRegistry.
   *
   * This event provides the name hash of the registered service and its address.
   *
   * @param nameHash The hash of the name of the registered service.
   * @param service The address of the registered service.
   */
  event ServiceRegistered(bytes32 nameHash, address service);

  /**
   * @dev Registers a new service in the VaultRegistry.
   *
   * @param serviceNameHash The hash of the name of the service to be registered.
   * @param serviceAddress The address of the service to be registered.
   */
  function registerService(bytes32 serviceNameHash, address serviceAddress) external;

  /**
   * @dev Unregisters an existing service from the VaultRegistry.
   *
   * @param serviceNameHash The hash of the name of the service to be unregistered.
   *
   */
  function unregisterService(bytes32 serviceNameHash) external;

  /**
   * @dev Retrieves the address of a registered service by its name hash.
   *
   * @param serviceHash The keccak256 hash of the service name for which the address is to be retrieved.
   * @return serviceAddress The address of the registered service.
   */
  function getServiceFromHash(bytes32 serviceHash) external view returns (address);

  /**
   * @dev Retrieves the address of a registered service by its name.
   *
   * @param serviceName The name of the service for which the address is to be retrieved.
   * @return serviceAddress The address of the registered service.
   */
  function getService(string memory serviceName) external view returns (address);
}
