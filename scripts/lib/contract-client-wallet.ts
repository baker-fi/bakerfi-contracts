import { Wallet } from "ethers/wallet";
import { BaseContractClient } from "./contract-client";
import { ethers } from "ethers";
import { Transaction } from "ethers";

export class ContractClientWallet extends BaseContractClient {

    _wallet: Wallet;
    _address: string;

    constructor(pKey: string) {
        super();
        this._wallet = new ethers.Wallet(pKey);  
    }  

    async init(){
        this._address = this._wallet.address;
    }

    getAddress(): string {
        return this._address;
    }

    async sign(tx: Transaction): Promise<Transaction>{
        const unsignedTx = tx.unsignedSerialized.slice(2);
        const bSignedTx = await this._wallet.signTransaction(tx);     
        const signedTx = Transaction.from(bSignedTx);
        return signedTx;
      }

}