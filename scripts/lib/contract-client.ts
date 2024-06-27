
import { TransactionReceipt } from "ethers";
import { Transaction } from "ethers/transaction";

export type TxOptions = Pick<Transaction,
  | "gasLimit"
  | "gasPrice"
  | "maxPriorityFeePerGas"
  | "maxFeePerGas"
  | "value"
  | "chainId"
>;

export interface ContractClient {
  getAddress(): string;
  init(): Promise<void>;
  sign(tx: Transaction): Promise<Transaction>;
  deploy(
    contractName: string,
    args: any[],
    options?: TxOptions
  ): Promise<TransactionReceipt | null>;
  send(
    contractName: string,
    address: string,
    funcName: string,
    args: any[],
    options?: TxOptions
  ): Promise<TransactionReceipt | null>;
  call(
    contractName: string,
    address: string,
    funcName: string,
    args: any[],
    options?: TxOptions
  ): Promise<any>;
  broadcastTx(signedTx: Transaction): Promise<TransactionReceipt | null>;
}