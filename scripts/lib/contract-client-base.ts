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
/**
 * Abstract base class for contract clients.
 *
 * This class provides core functionality for interacting with Ethereum smart contracts,
 * including deployment, transaction sending, and function calls. It is designed to be
 * extended by specific contract client implementations.
 *
 * @template ContractTree - A type extending ContractTreeType, representing the structure of contract ABIs and bytecode.
 */
export abstract class ContractClientBase<ContractTree extends ContractTreeType>
  implements ContractClient<ContractTree>
{
  /**
   * The Ethereum provider used for network interactions.
   */
  _provider: ethers.Provider;

  /**
   * The contract tree structure containing ABIs and bytecode for each contract.
   */
  _contractsTree: ContractTree;

  /**
   * Constructor for the ContractClientBase.
   *
   * Initializes the contract client with a provider and a contract tree structure.
   *
   * @param provider - The Ethereum provider to use for network interactions.
   * @param contractTree - The contract tree structure containing ABIs and bytecode for each contract.
   */
  constructor(provider: ethers.Provider, contractTree: ContractTree) {
    this._provider = provider;
    this._contractsTree = contractTree;
  }

  /**
   * Abstract method to get the address associated with this client.
   *
   * This method must be implemented by subclasses to return the address of the client.
   *
   * @returns A promise that resolves to the address of the client.
   */
  abstract getAddress(): string;

  /**
   * Abstract method to initialize the client.
   *
   * This method must be implemented by subclasses to perform any necessary initialization steps.
   *
   * @returns A promise that resolves when the client is initialized.
   */
  abstract init(): Promise<void>;

  /**
   * Abstract method to sign a transaction.
   *
   * This method must be implemented by subclasses to sign a transaction with the client's credentials.
   *
   * @param tx - The transaction to sign.
   * @returns A promise that resolves to the signed transaction.
   */
  abstract sign(tx: Transaction): Promise<Transaction>;

  /**
   * Deploys a contract.
   *
   * Prepares and broadcasts a deployment transaction for a contract specified by its name in the contract tree.
   *
   * @param factoryName - The name of the contract factory in the ContractTree.
   * @param args - The arguments to pass to the contract constructor.
   * @param options - Optional transaction options, such as value, chainId, and fee options.
   * @returns A promise that resolves to the transaction receipt or null if the transaction fails.
   */
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
      ...(await this.buildFeeOptions(options)),
      gasLimit: options?.gasLimit ?? estimatedGas * 2n,
    });
    const signedTx = await this.sign(tx);
    return await this.broadcastTx(signedTx);
  }

  /**
   * Broadcasts a signed transaction.
   *
   * Sends a signed transaction to the network and waits for it to be mined.
   *
   * @param signedTx - The signed transaction to broadcast.
   * @param options - Optional transaction options, such as minimum transaction confirmations.
   * @returns A promise that resolves to the transaction receipt or null if the transaction fails.
   */
  async broadcastTx(signedTx: Transaction, options?: TxOptions) {
    const response = await this._provider.broadcastTransaction(signedTx.serialized);
    const txReceipt = await response.wait(options?.minTxConfirmations ?? 0);
    return txReceipt;
  }

  /**
   * Builds fee options for a transaction.
   *
   * Prepares fee options for a transaction based on the provided options and current network fees.
   *
   * @param options - Optional transaction options, such as maxFeePerGas and maxPriorityFeePerGas.
   * @returns A promise that resolves to the fee options.
   */
  private async buildFeeOptions(options: TxOptions | undefined) {
    const feeData = await this._provider.getFeeData();
    const gasOptions = {
      maxFeePerGas: options?.maxFeePerGas ?? feeData?.maxFeePerGas ?? 0,
      maxPriorityFeePerGas: options?.maxPriorityFeePerGas ?? feeData.maxPriorityFeePerGas,
    };
    return gasOptions;
  }

  /**
   * Sends a transaction to change the state of a deployed contract.
   *
   * This method prepares and broadcasts a transaction to call a function on a deployed contract.
   * It estimates the gas required for the transaction, signs it, and then broadcasts it to the network.
   *
   * @param factoryName - The name of the contract factory in the ContractTree.
   * @param to - The address of the deployed contract.
   * @param funcName - The name of the function to call on the contract.
   * @param args - The arguments to pass to the function call.
   * @param options - Optional transaction options, such as value, chainId, and fee options.
   * @returns A promise that resolves to the transaction receipt or null if the transaction fails.
   */
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
      ...(await this.buildFeeOptions(options)),
      gasLimit: 2000000,
    });
    const estimatedGas = await this._provider.estimateGas({
      ...baseTx.toJSON(),
      from: this.getAddress(),
    });
    baseTx.gasLimit = estimatedGas * 2n;
    const signedTx = await this.sign(baseTx);
    return await this.broadcastTx(signedTx, options);
  }

  /**
   * Calls a function on a deployed contract to read its state.
   *
   * This method creates a new instance of a contract using the provided factory name, address, and ABI.
   * It then uses the contract interface to get the function by its name and calls it with the provided arguments.
   * The result of the function call is returned as a promise.
   *
   * @param factoryName - The name of the contract factory in the ContractTree.
   * @param to - The address of the deployed contract.
   * @param funcName - The name of the function to call on the contract.
   * @param args - The arguments to pass to the function call.
   * @returns A promise that resolves to the result of the function call.
   */
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
