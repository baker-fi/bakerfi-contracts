import { Wallet } from 'ethers/wallet'; // Import the Wallet class from ethers for wallet operations
import { ContractClientBase } from './contract-client-base'; // Import the base class for contract clients
import { ethers } from 'ethers'; // Import ethers for general Ethereum operations
import { Transaction } from 'ethers'; // Import Transaction from ethers for transaction operations
import { ContractTreeType } from './contract-client'; // Import ContractTreeType for contract tree structure

/**
 * A contract client that uses a wallet for signing transactions.
 * @template ContractTree - Extends ContractTreeType, representing the structure of contract ABIs and bytecode.
 */
export class ContractClientWallet<
  ContractTree extends ContractTreeType,
> extends ContractClientBase<ContractTree> {
  _wallet: Wallet; // The wallet instance used for signing transactions
  _address: string; // The address associated with this client

  /**
   * Constructor for the ContractClientWallet.
   * @param provider - The Ethereum provider to use for network interactions.
   * @param contractTree - The contract tree structure containing ABIs and bytecode for each contract.
   * @param pKey - The private key to use for the wallet.
   */
  constructor(provider: ethers.Provider, contractTree: ContractTree, pKey: string) {
    super(provider, contractTree); // Call the base class constructor
    this._wallet = new ethers.Wallet(pKey); // Initialize the wallet with the provided private key
  }

  /**
   * Initializes the client by setting the address from the wallet.
   * @returns A promise that resolves when the client is initialized.
   */
  async init() {
    this._address = this._wallet.address; // Set the client's address from the wallet
  }

  /**
   * Gets the address associated with this client.
   * @returns The address of the client.
   */
  getAddress(): string {
    return this._address; // Return the client's address
  }

  /**
   * Signs a transaction using the client's wallet.
   * @param tx - The transaction to sign.
   * @returns A promise that resolves to the signed transaction.
   */
  async sign(tx: Transaction): Promise<Transaction> {
    const unsignedTx = tx.unsignedSerialized.slice(2); // Extract the unsigned transaction data
    const bSignedTx = await this._wallet.signTransaction(tx); // Sign the transaction using the wallet
    const signedTx = Transaction.from(bSignedTx); // Convert the signed transaction data to a Transaction object
    return signedTx; // Return the signed transaction
  }
}
