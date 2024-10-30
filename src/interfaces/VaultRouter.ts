import { ContractSendMethod } from 'web3-eth-contract';
import { ContractCallMethod } from '@taikai/dappkit';

export type RouterCommand = {
  action: number;
  data: string;
};

export interface VaultRouterMethods {
  acceptOwnership(): ContractSendMethod;

  approveTokenForVault(vault: string, token: string): ContractSendMethod;

  approveTokenToSwap(token: string): ContractSendMethod;

  execute(commands: RouterCommand[]): ContractSendMethod;

  initialize(initialOwner: string, router: string, weth: string): ContractSendMethod;

  isTokenApprovedForVault(vault: string, token: string): ContractCallMethod<boolean>;

  isTokenApprovedToSwap(token: string): ContractCallMethod<boolean>;

  owner(): ContractCallMethod<string>;

  pendingOwner(): ContractCallMethod<string>;

  renounceOwnership(): ContractSendMethod;

  transferOwnership(newOwner: string): ContractSendMethod;

  unapproveTokenForVault(vault: string, token: string): ContractSendMethod;

  unapproveTokenToSwap(token: string): ContractSendMethod;
}
