import { ethers, Transaction, TransactionReceipt } from 'ethers';
import { ContractClient, ContractTreeType, TxOptions } from './contract-client';

/**
 * Abstract base class for contract clients.
 *
 * Provides core functionality for interacting with Ethereum smart contracts,
 * including deployment, transaction sending, and function calls.
 *
 * @template ContractTree - A type extending ContractTreeType, representing the structure of contract ABIs and bytecode.
 */
export abstract class ContractClientBase<ContractTree extends ContractTreeType>
  implements ContractClient<ContractTree>
{
  _provider: ethers.Provider;

  _contractsTree: ContractTree;

  constructor(provider: ethers.Provider, contractTree: ContractTree) {
    this._provider = provider;
    this._contractsTree = contractTree;
  }
  abstract getAddress(): string;

  abstract init(): Promise<void>;

  abstract sign(tx: Transaction): Promise<Transaction>;

  public async deploy<ContractName extends keyof ContractTree>(
    factoryName: ContractName,
    args: any[],
    options?: TxOptions,
  ): Promise<TransactionReceipt | null> {
    const factory = new ethers.ContractFactory(
      this._contractsTree[factoryName].abi,
      this._contractsTree[factoryName].bytecode,
    );
    const deployTx = await factory.getDeployTransaction(...args);
    const estimatedGas = await this._provider.estimateGas(deployTx);
    const tx = Transaction.from({
      ...deployTx,
      ...(options?.value ? { value: options.value } : {}),
      nonce: await this._provider.getTransactionCount(this.getAddress()),
      chainId: options?.chainId ?? 1,
      ...(await this.buildGasOptions(options)),
      gasLimit: options?.gasLimit ?? estimatedGas * 2n,
    });
    const signedTx = await this.sign(tx);
    return await this.broadcastTx(signedTx);
  }
  async broadcastTx(signedTx: Transaction, options?: TxOptions) {
    const response = await this._provider.broadcastTransaction(signedTx.serialized);
    const txReceipt = await response.wait(options?.minTxConfirmations ?? 0);
    return txReceipt;
  }

  private async buildGasOptions(options: TxOptions | undefined) {
    const feeData = await this._provider.getFeeData();
    const gasOptions = {
      maxFeePerGas: options?.maxFeePerGas ?? feeData?.maxFeePerGas ?? 0,
      maxPriorityFeePerGas: options?.maxPriorityFeePerGas ?? feeData.maxPriorityFeePerGas,
    };
    return gasOptions;
  }

  public async send<ContractName extends keyof ContractTree>(
    factoryName: ContractName,
    to: string,
    funcName: string,
    args: any[],
    options?: TxOptions,
  ): Promise<TransactionReceipt | null> {
    const factory = new ethers.ContractFactory(
      this._contractsTree[factoryName].abi,
      this._contractsTree[factoryName].bytecode,
    );
    const data = factory.interface.encodeFunctionData(funcName, args);
    const baseTx = Transaction.from({
      data: data,
      to: to,
      ...(options?.value ? { value: options.value } : {}),
      nonce: await this._provider.getTransactionCount(this.getAddress()),
      chainId: options?.chainId ?? 1,
      ...(await this.buildGasOptions(options)),
    });
    const estimatedGas = await this._provider.estimateGas({
      ...baseTx.toJSON(),
      from: this.getAddress(),
    });
    baseTx.gasLimit = options?.gasLimit ?? estimatedGas * 2n;
    const signedTx = await this.sign(baseTx);
    return await this.broadcastTx(signedTx, options);
  }

  public async call<ContractName extends keyof ContractTree>(
    factoryName: ContractName,
    to: string,
    funcName: string,
    args: any[],
  ): Promise<any> {
    const contract = new ethers.Contract(to, this._contractsTree[factoryName].abi, this._provider);
    const functionInt = contract.interface.getFunction(funcName);
    const ret = await contract[functionInt?.name ?? ''](...args);
    return ret;
  }
}
