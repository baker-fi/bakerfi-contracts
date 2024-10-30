import { ContractSendMethod } from 'web3-eth-contract';
import { ContractCallMethod } from '@taikai/dappkit';

export interface VaultRegistryMethods {
  getService(serviceName: string): ContractCallMethod<string>;

  getServiceFromHash(serviceHash: string): ContractCallMethod<string>;

  getServiceNameHash(name: string): ContractCallMethod<string>;

  owner(): ContractCallMethod<string>;

  registerService(serviceNameHash: string, serviceAddress: string): ContractSendMethod;

  renounceOwnership(): ContractSendMethod;

  transferOwnership(newOwner: string): ContractSendMethod;

  unregisterService(serviceNameHash: string): ContractSendMethod;
}
