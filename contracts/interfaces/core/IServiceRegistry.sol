// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

interface IServiceRegistry {
    function registerService( bytes32 serviceNameHash,address serviceAddress) external;
    function unregisterService(bytes32 serviceNameHash) external;
    function getServiceFromHash(bytes32  serviceHash) external view returns (address);
    function getService(string memory serviceName) external view returns (address);
}