import {
  Model,
  Web3Connection,
  Web3ConnectionOptions,
  Deployable,
  XPromiseEvent,
} from '@taikai/dappkit';

import BalancerFlashLenderJson from '../../artifacts/contracts/core/flashloan/BalancerFlashLender.sol/BalancerFlashLender.json';
import { BalancerFlashLenderMethods } from '@interfaces/BalancerFlashLender';
import { AbiItem } from 'web3-utils';

export class BalancerFlashLender extends Model<BalancerFlashLenderMethods> implements Deployable {
  constructor(web3Connection: Web3Connection | Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, BalancerFlashLenderJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(registry: string) {
    const deployOptions = {
      data: BalancerFlashLenderJson.bytecode,
      arguments: [registry],
    };
    return this.deploy(deployOptions, this.connection.Account);
  }

  async CALLBACK_SUCCESS() {
    return this.callTx(this.contract.methods.CALLBACK_SUCCESS());
  }

  async flashFee(arg1: string, arg2: number) {
    return this.callTx(this.contract.methods.flashFee(arg1, arg2));
  }

  async flashLoan(borrower: string, token: string, amount: number, data: string) {
    return this.sendTx(this.contract.methods.flashLoan(borrower, token, amount, data));
  }

  async maxFlashLoan(token: string) {
    return this.callTx(this.contract.methods.maxFlashLoan(token));
  }

  async receiveFlashLoan(
    tokens: string[],
    amounts: number[],
    feeAmounts: number[],
    userData: string,
  ) {
    return this.sendTx(
      this.contract.methods.receiveFlashLoan(tokens, amounts, feeAmounts, userData),
    );
  }
}
