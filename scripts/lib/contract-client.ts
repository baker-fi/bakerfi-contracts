
import { TransactionReceipt, ethers } from "ethers";
import { Transaction } from "ethers/transaction";

export type TxOptions = Pick<Partial<Transaction>,
  | "gasLimit"
  | "gasPrice"
  | "maxPriorityFeePerGas"
  | "maxFeePerGas"
  | "value"
  | "chainId"
>;


export type ContractDefinition = {
    abi: ethers.InterfaceAbi,
    bytecode: ethers.BytesLike ,
}

export type ContractTreeType = {
  [key: string| number]: ContractDefinition
}

export interface ContractClient<ContractTree extends ContractTreeType> {
  getAddress(): string;
  init(): Promise<void>;
  sign(tx: Transaction): Promise<Transaction>;
  deploy<ContractName extends keyof ContractTree>(
    contractName: ContractName,
    args: any[],
    options?: TxOptions
  ): Promise<TransactionReceipt | null>;
  send<ContractName extends keyof ContractTree>(
    contractName: string,
    address: string,
    funcName: string,
    args: any[],
    options?: TxOptions
  ): Promise<TransactionReceipt | null>;
  call<ContractName extends keyof ContractTree>(
    contractName: string,
    address: string,
    funcName: string,
    args: any[],
    options?: TxOptions
  ): Promise<any>;
  broadcastTx(signedTx: Transaction): Promise<TransactionReceipt | null>;
}