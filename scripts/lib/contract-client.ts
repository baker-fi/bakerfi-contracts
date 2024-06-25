
import { Transaction } from "ethers/transaction";
import { BigNumberish, parseUnits } from "ethers/utils";
import { TransactionReceipt } from "ethers";
import { ethers } from "hardhat";


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

  factoryOptions?: null| object;
}
/**
 * 
 */
export abstract class ContractClient {
    
    abstract getAddress(): string;
    
    abstract init(): Promise<void>;
    
    abstract sign(tx: Transaction): Promise<Transaction>;

    public async deploy(factoryName: string,  args: any[], options?: TxOptions): Promise<TransactionReceipt| null> {
        const factory = await ethers.getContractFactory(factoryName, options?.factoryOptions ?? {});
        const deployTx = await factory.getDeployTransaction(...args);
        const tx = Transaction.from({
          ...deployTx,
          nonce: await ethers.provider.getTransactionCount(this.getAddress()),
          gasLimit: options?.gasLimit ?? 30000000n,
          gasPrice: options?.maxFeePerGas ?? parseUnits("2", "gwei"),
          maxFeePerGas: options?.maxFeePerGas ?? parseUnits("20", "gwei"),
          maxPriorityFeePerGas: options?.maxPriorityFeePerGas ?? parseUnits("1", "gwei"),
          chainId : options?.chainId ?? 1
        });
        const signedTx = await this.sign(tx);
        const response = await ethers.provider.broadcastTransaction(
          signedTx.serialized
        );
        const txReceipt = await response.wait();
        return txReceipt;
    }


    public async call(factoryName: string,  to: string, funcName: string, args: any[], options?: TxOptions): Promise<TransactionReceipt| null> {
        const factory = await ethers.getContractFactory(factoryName);
        const data = factory.interface.encodeFunctionData(funcName, args);
        const tx = Transaction.from({
          data: data,
          to: to,
          nonce: await ethers.provider.getTransactionCount(this.getAddress()),
          gasLimit: options?.gasLimit ?? 30000000n,
          gasPrice: options?.gasPrice ?? parseUnits("2", "gwei"),
          maxFeePerGas: options?.maxFeePerGas?? parseUnits("20", "gwei"),
          maxPriorityFeePerGas:options?.maxFeePerGas?? parseUnits("1", "gwei"),
          chainId: options?.chainId ?? 1
        });
        const signedTx = await this.sign(tx);
        const response = await ethers.provider.broadcastTransaction(
          signedTx.serialized
        );
        const txReceipt = await response.wait();
        return txReceipt;
    }
    
}