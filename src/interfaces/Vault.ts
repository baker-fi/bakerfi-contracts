import { ContractSendMethod } from "web3-eth-contract";
import { ContractCallMethod } from "@taikai/dappkit";

export interface VaultMethods {

  DOMAIN_SEPARATOR(): ContractCallMethod<string>;

  allowance(owner: string, spender: string): ContractCallMethod<number>;

  approve(spender: string, amount: number): ContractSendMethod;

  balanceOf(account: string): ContractCallMethod<number>;

  convertToAssets(shares: number): ContractCallMethod<{ assets: number }>;

  convertToShares(assets: number): ContractCallMethod<{ shares: number }>;

  decimals(): ContractCallMethod<number>;

  decreaseAllowance(
    spender: string,
    subtractedValue: number
  ): ContractSendMethod;

  deposit(receiver: string): ContractSendMethod;

  eip712Domain(): ContractCallMethod<{
    fields: string;
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
    extensions: number[];
  }>;

  increaseAllowance(spender: string, addedValue: number): ContractSendMethod;

  name(): ContractCallMethod<string>;

  nonces(owner: string): ContractCallMethod<number>;

  owner(): ContractCallMethod<string>;

  paused(): ContractCallMethod<boolean>;

  pause(): ContractSendMethod;

  unpause(): ContractSendMethod;

  permit(
    owner: string,
    spender: string,
    value: number,
    deadline: number,
    v: number,
    r: string,
    s: string
  ): ContractSendMethod;

  rebalance(): ContractSendMethod;

  renounceOwnership(): ContractSendMethod;

  settings(): ContractCallMethod<string>;

  settingsA(): ContractCallMethod<string>;

  symbol(): ContractCallMethod<string>;

  tokenPerETH(): ContractCallMethod<number>;

  totalAssets(): ContractCallMethod<{ amount: number }>;

  totalSupply(): ContractCallMethod<number>;

  transfer(to: string, amount: number): ContractSendMethod;

  transferFrom(from: string, to: string, amount: number): ContractSendMethod;

  transferOwnership(newOwner: string): ContractSendMethod;

  withdraw(shares: number): ContractSendMethod;
}
