import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import Eth, { ledgerService } from "@ledgerhq/hw-app-eth";
import { Transaction } from "ethers/transaction";
import { ContractClient } from "./contract-client";

export class ContractClientLedger extends ContractClient {

    _path: string;
    _address: string;
    _ledgerApp: any;
  
    constructor(path: string) {
        super();
        this._path = path;  
    }  
  
    getAddress(): string {
      return this._address;
    }
  
    async init() : Promise<void>{
      const transport = await TransportNodeHid.open("");
      this._ledgerApp = new Eth(transport);
      const ledgerResp = await this._ledgerApp.getAddress(this._path);
      this._address = ledgerResp.address;
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

 