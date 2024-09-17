/**
 * @file contract-client.ts
 * Defines types and interfaces for Ethereum contract interactions.
 */

import { TransactionReceipt, ethers } from 'ethers';
import { Transaction } from 'ethers/transaction';

/**
 * Options for transaction execution.
 */
export type TxOptions = Pick<
  Partial<Transaction>,
  'gasLimit' | 'gasPrice' | 'maxPriorityFeePerGas' | 'maxFeePerGas' | 'value' | 'chainId'
> & {
  minTxConfirmations?: number;
};

/**
 * Represents the structure of a contract's ABI and bytecode.
 */
export type ContractDefinition = {
  abi: ethers.InterfaceAbi;
  bytecode: ethers.BytesLike;
};

/**
 * A tree-like structure of contract definitions.
 */
export type ContractTreeType = {
  [key: string | number]: ContractDefinition;
};

/**
 * Interface for a contract client.
 * @template ContractTree - Extends ContractTreeType
 */
export interface ContractClient<ContractTree extends ContractTreeType> {
  /**
   * Get the address associated with this client.
   */
  getAddress(): string;

  /**
   * Initialize the client.
   */
  init(): Promise<void>;

  /**
   * Sign a transaction.
   * @param tx - The transaction to sign
   */
  sign(tx: Transaction): Promise<Transaction>;

  /**
   * Deploy a Contract
   * @param contractName - Name of the contract in the ContractTree
   * @param contractAddress - Constructor arguments for the contract
   * @param options - Optional transaction options
   */
  deploy<ContractName extends keyof ContractTree>(
    contractName: ContractName,
    contractAddress: any[],
    options?: TxOptions,
  ): Promise<TransactionReceipt | null>;

  /**
   * Send a transaction to change the contract state
   * @param contractName - Name of the contract in the ContractTree
   * @param contractAddress - Address of the deployed contract
   * @param funcName - Name of the function to call
   * @param args - Arguments for the function call
   * @param options - Optional transaction options
   */
  send<ContractName extends keyof ContractTree>(
    contractName: ContractName,
    contractAddress: string,
    funcName: string,
    args: any[],
    options?: TxOptions,
  ): Promise<TransactionReceipt | null>;

  /**
   * Call a contract function to read the state
   * @param contractName - Name of the contract in the ContractTree
   * @param contractAddress - Address of the deployed contract
   * @param funcName - Name of the function to call
   * @param args - Arguments for the function call
   * @param options - Optional call options
   */
  call<ContractName extends keyof ContractTree>(
    contractName: ContractName,
    contractAddress: string,
    funcName: string,
    args: any[],
    options?: TxOptions,
  ): Promise<any>;

  /**
   * Broadcast a signed transaction
   * @param signedTx - The signed transaction to broadcast
   */
  broadcastTx(signedTx: Transaction): Promise<TransactionReceipt | null>;
}
