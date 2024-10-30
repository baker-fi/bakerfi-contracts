import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import Eth, { ledgerService } from '@ledgerhq/hw-app-eth';
import { Transaction } from 'ethers/transaction';
import { ContractClientBase } from './contract-client-base';
import { ethers } from 'ethers';
import { ContractTreeType } from './contract-client';

/**
 * Class for interacting with Ethereum smart contracts using a Ledger device.
 * @template ContractTree - Extends ContractTreeType
 */
export class ContractClientLedger<
  ContractTree extends ContractTreeType,
> extends ContractClientBase<ContractTree> {
  _path: string;
  _address: string;
  _ledgerApp: any;

  /**
   * Constructor for the ContractClientLedger.
   * @param provider - The Ethereum provider to use for network interactions.
   * @param contractTree - The contract tree structure containing ABIs and bytecode for each contract.
   * @param path - The path to the Ledger device.
   */
  constructor(provider: ethers.Provider, contractTree: ContractTree, path: string) {
    super(provider, contractTree);
    this._path = path;
  }

  /**
   * Get the address associated with this client.
   * @returns The address of the client.
   */
  getAddress(): string {
    return this._address;
  }

  /**
   * Initialize the client.
   * @returns A promise that resolves when the client is initialized.
   */
  async init(): Promise<void> {
    const transport = await TransportNodeHid.open('');
    this._ledgerApp = new Eth(transport);
    const ledgerResp = await this._ledgerApp.getAddress(this._path);
    this._address = ledgerResp.address;
  }

  /**
   * Sign a transaction.
   * @param tx - The transaction to sign.
   * @returns A promise that resolves to the signed transaction.
   */
  async sign(tx: Transaction): Promise<Transaction> {
    const unsignedTx = tx.unsignedSerialized.slice(2);
    const resolution = await ledgerService.resolveTransaction(
      unsignedTx,
      this._ledgerApp.loadConfig,
      {
        externalPlugins: false,
        erc20: false,
        nft: false,
      },
    );

    const signature = await this._ledgerApp.signTransaction(this._path, unsignedTx, resolution);
    const signedTx = Transaction.from({
      ...tx.toJSON(),
      signature: {
        v: parseInt(signature.v, 16),
        r: '0x' + signature.r,
        s: '0x' + signature.s,
      },
    });
    return signedTx;
  }
}
