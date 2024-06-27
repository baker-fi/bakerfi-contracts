import { ethers, Transaction, TransactionReceipt } from "ethers";
import { ContractClient, TxOptions } from "./contract-client";
import ContractTree from "../../src/contract-blob.json"


export abstract class ContractClientBase implements ContractClient {

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
  
    public async send(
      factoryName: string,
      to: string,
      funcName: string,
      args: any[],
      options?: TxOptions
    ): Promise<TransactionReceipt | null> {
      const factory = new ethers.ContractFactory(
        ContractTree[factoryName].abi,
        ContractTree[factoryName].bytecode,
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
  
    public async call(
      factoryName: string,
      to: string,
      funcName: string,
      args: any[]
    ): Promise<any> {
      const contract = new ethers.Contract(to, ContractTree[factoryName].abi, this._provider);
      const functionInt = contract.interface.getFunction(funcName);
      const ret = await contract[functionInt?.name??""](...args);
      return ret;
    }
  }
  