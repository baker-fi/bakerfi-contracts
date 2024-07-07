import { TransactionReceipt, ethers } from 'ethers';
import { Transaction } from 'ethers/transaction';

export type TxOptions = Pick<
  Partial<Transaction>,
  'gasLimit' | 'gasPrice' | 'maxPriorityFeePerGas' | 'maxFeePerGas' | 'value' | 'chainId'
> & {
  minTxConfirmations?: number;
};

export type ContractDefinition = {
  abi: ethers.InterfaceAbi;
  bytecode: ethers.BytesLike;
};

export type ContractTreeType = {
  [key: string | number]: ContractDefinition;
};

export interface ContractClient<ContractTree extends ContractTreeType> {
  getAddress(): string;

  init(): Promise<void>;

  sign(tx: Transaction): Promise<Transaction>;

  /**
   * Deploy a Contract
   * @param contractName
   * @param args
   * @param options
   */
  deploy<ContractName extends keyof ContractTree>(
    contractName: ContractName,
    contractAddress: any[],
    options?: TxOptions,
  ): Promise<TransactionReceipt | null>;

  /**
   * Send a Tx to change the state
   *
   * @param contractName
   * @param contractAddress
   * @param funcName
   * @param args
   * @param options
   */
  send<ContractName extends keyof ContractTree>(
    contractName: ContractName,
    contractAddress: string,
    funcName: string,
    args: any[],
    options?: TxOptions,
  ): Promise<TransactionReceipt | null>;

  /**
   * Call a contract to read the state
   * @param contractName
   * @param contractAddress
   * @param funcName
   * @param args
   * @param options
   */
  call<ContractName extends keyof ContractTree>(
    contractName: ContractName,
    contractAddress: string,
    funcName: string,
    args: any[],
    options?: TxOptions,
  ): Promise<any>;

  broadcastTx(signedTx: Transaction): Promise<TransactionReceipt | null>;
}
