import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import Eth, { ledgerService } from "@ledgerhq/hw-app-eth";
import { Transaction } from "ethers/transaction";
import { parseUnits } from "ethers/utils";
import { TransactionReceipt } from "ethers";
import { ethers } from "hardhat";

export class LedgerApp {

    _path: string;
    _address: string;
    _ledgerApp: any;
  
    constructor(path: string) {
      this._path = path;  
    }  
  
    getAddress(): string {
      return this._address;
    }
  
    async init(){
      const transport = await TransportNodeHid.open("");
      this._ledgerApp = new Eth(transport);
      const ledgerResp = await this._ledgerApp.getAddress(this._path);
      this._address = ledgerResp.address;
    }
  
    async deploy(chainId: number |undefined, factoryName: string,  args: any[], factoryOptions?: object): Promise<TransactionReceipt| null>{
      const factory = await ethers.getContractFactory(factoryName, factoryOptions);
      const deployTx = await factory.getDeployTransaction(...args);
      const tx = Transaction.from({
        ...deployTx,
        nonce: await ethers.provider.getTransactionCount(this._address),
        gasLimit: 30000000n,
        gasPrice: parseUnits("2", "gwei"),
        maxFeePerGas: parseUnits("20", "gwei"),
        maxPriorityFeePerGas: parseUnits("1", "gwei"),
        chainId: chainId,
      });
      const signedTx = await this.sign(tx);
      const response = await ethers.provider.broadcastTransaction(
        signedTx.serialized
      );
      const txReceipt = await response.wait();
      return txReceipt;
    }
  
    async call(chainId: number|undefined, factoryName: string,  to: string, funcName: string, args: any[]): Promise<TransactionReceipt| null> {
      const factory = await ethers.getContractFactory(factoryName);
      const data = factory.interface.encodeFunctionData(funcName, args);
      const tx = Transaction.from({
        data: data,
        to: to,
        nonce: await ethers.provider.getTransactionCount(this._address),
        gasLimit: 30000000n,
        gasPrice: parseUnits("2", "gwei"),
        maxFeePerGas: parseUnits("20", "gwei"),
        maxPriorityFeePerGas: parseUnits("1", "gwei"),
        chainId: chainId,
      });
      const signedTx = await this.sign(tx);
      const response = await ethers.provider.broadcastTransaction(
        signedTx.serialized
      );
      const txReceipt = await response.wait();
      return txReceipt;
    }
  
    async sign(tx: Transaction): Promise<Transaction>{
      const unsignedTx = tx.unsignedSerialized.slice(2);
      const resolution = await ledgerService.resolveTransaction(
        unsignedTx,
        this._ledgerApp.loadConfig,
        {
          externalPlugins: false,
          erc20: false,
          nft: false,
        }
      );
      const signature = await this._ledgerApp.signTransaction(this._path, unsignedTx, resolution);
      const signedTx = Transaction.from({
        ...tx.toJSON(),
        signature: {
          v: parseInt(signature.v, 16),
          r: "0x" + signature.r,
          s: "0x" + signature.s,
        },
      }); 
      return signedTx;
    }
  
  }