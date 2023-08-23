import {Model, Web3Connection, Web3ConnectionOptions, Deployable, XPromiseEvent} from '@taikai/dappkit';

import WstETHToETHOracleJson from '../../../../artifacts/contracts/oracles/WstETHToETHOracle.sol/WstETHToETHOracle.json';
import { WstETHToETHOracleMethods } from 'src/contracts/laundromat/interfaces/wst-eth-to-eth-oracle';
import {AbiItem} from 'web3-utils';

export class WstETHToETHOracle extends Model<WstETHToETHOracleMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, WstETHToETHOracleJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(stETHToETHPriceFeed: string, wstETH: string) {
    const deployOptions = {
      data: WstETHToETHOracleJson.bytecode,
      arguments: [
        stETHToETHPriceFeed, wstETH
      ]
    }
    return this.deploy(deployOptions, this.connection.Account);
  }

    async _stETHToETHPriceFeed() { 
    return this.callTx(this.contract.methods._stETHToETHPriceFeed());
  }

  async _wstETH() { 
    return this.callTx(this.contract.methods._wstETH());
  }

  async getLatestPrice() { 
    return this.callTx(this.contract.methods.getLatestPrice());
  }

  async getPrecision() { 
    return this.callTx(this.contract.methods.getPrecision());
  }


}