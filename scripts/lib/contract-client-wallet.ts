import { Wallet } from 'ethers/wallet';
import { ContractClientBase } from './contract-client-base';
import { ethers } from 'ethers';
import { Transaction } from 'ethers';
import { ContractTreeType } from './contract-client';

export class ContractClientWallet<
  ContractTree extends ContractTreeType,
> extends ContractClientBase<ContractTree> {
  _wallet: Wallet;
  _address: string;

  constructor(provider: ethers.Provider, contractTree: ContractTree, pKey: string) {
    super(provider, contractTree);
    this._wallet = new ethers.Wallet(pKey);
  }

  async init() {
    this._address = this._wallet.address;
  }

  getAddress(): string {
    return this._address;
  }

  async sign(tx: Transaction): Promise<Transaction> {
    const unsignedTx = tx.unsignedSerialized.slice(2);
    const bSignedTx = await this._wallet.signTransaction(tx);
    const signedTx = Transaction.from(bSignedTx);
    return signedTx;
  }
}
