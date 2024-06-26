
import { TransactionReceipt, ethers } from "ethers";
import { Transaction } from "ethers/transaction";
import { BigNumberish, parseUnits } from "ethers/utils";
import ContractTree from "../../src/contract-blob.json"


type TxOptions = {
  gasLimit?: null | BigNumberish;

  /**
   *  The gas price for legacy and berlin transactions.
   */
  gasPrice?: null | BigNumberish;

  /**
   *  The maximum priority fee per gas for london transactions.
   */

  maxPriorityFeePerGas?: null | BigNumberish;
  /**
   *  The maximum total fee per gas for london transactions.
   */
  maxFeePerGas?: null | BigNumberish;

  /**
   *  The value (in wei) to send.
   */
  value?: null | BigNumberish;
  /**
   *  The chain ID the transaction is valid on.
   */
  chainId?: null | BigNumberish;

  factoryOptions?: null | object;
};

export interface ContractClient {
  getAddress(): string;
  init(): Promise<void>;
  sign(tx: Transaction): Promise<Transaction>;
  deploy(
    contractName: string,
    args: any[],
    options?: TxOptions
  ): Promise<TransactionReceipt | null>;
  call(
    contractName: string,
    address: string,
    funcName: string,
    args: any[],
    options?: TxOptions
  ): Promise<TransactionReceipt | null>;
  broadcastTx(signedTx: Transaction): Promise<TransactionReceipt | null>;
}

/**
 *
 */
export abstract class BaseContractClient implements ContractClient {

  _provider:  ethers.Provider;

  constructor(provider: ethers.Provider) {
    this._provider = provider;
  }


  abstract getAddress(): string;

  abstract init(): Promise<void>;

  abstract sign(tx: Transaction): Promise<Transaction>;

  public async deploy(
    factoryName: string,
    args: any[],
    options?: TxOptions
  ): Promise<TransactionReceipt | null> {

    const factory = new ethers.ContractFactory(
      ContractTree[factoryName].abi,
      ContractTree[factoryName].bytecode,
     // options?.factoryOptions ?? {}
    );
    const deployTx = await factory.getDeployTransaction(...args);
    const tx = Transaction.from({
      ...deployTx,
      ...options?.value? {value: options.value}: {},
      nonce: await  this._provider.getTransactionCount(this.getAddress()),
      chainId: options?.chainId ?? 1,
      ...(await this.buildGasOptions(options)),
    });
    tx.gasLimit =
      options?.gasLimit ?? (await  this._provider.estimateGas(deployTx)) * 2n;
    const signedTx = await this.sign(tx);
    return await this.broadcastTx(signedTx);
  }
  async broadcastTx(signedTx: Transaction) {
    const response = await  this._provider.broadcastTransaction(
      signedTx.serialized
    );
    const txReceipt = await response.wait();
    return txReceipt;
  }

  private async buildGasOptions(options: TxOptions | undefined) {
    const feeData = await  this._provider.getFeeData();
    const block = await this._provider.getBlock("latest");
    const gasOptions = {
      gasLimit: block?.gasLimit ?? 300000000n,
      gasPrice: options?.gasPrice ?? feeData.gasPrice,
      maxFeePerGas: options?.maxFeePerGas ?? feeData?.maxFeePerGas ?? 0,
      maxPriorityFeePerGas:
        options?.maxPriorityFeePerGas ?? feeData.maxPriorityFeePerGas,
    };
    return gasOptions;
  }

  public async call(
    factoryName: string,
    to: string,
    funcName: string,
    args: any[],
    options?: TxOptions
  ): Promise<TransactionReceipt | null> {
    const factory = new ethers.ContractFactory(
      ContractTree[factoryName].abi,
      ContractTree[factoryName].bytecode,
     // options?.factoryOptions ?? {}
    );
    const data = factory.interface.encodeFunctionData(funcName, args);
    const baseTx = Transaction.from({
      data: data,
      to: to,
      ...options?.value? {value: options.value}: {},
      nonce: await this._provider.getTransactionCount(this.getAddress()),
      chainId: options?.chainId ?? 1,
      ...(await this.buildGasOptions(options)),
    });
    baseTx.gasLimit =
      options?.gasLimit ?? (await this._provider.estimateGas(baseTx)) * 2n;
    const signedTx = await this.sign(baseTx);
    return await this.broadcastTx(signedTx);
  }
}
