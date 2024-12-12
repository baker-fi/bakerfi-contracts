import {
  Model,
  Web3Connection,
  Web3ConnectionOptions,
  Deployable,
  XPromiseEvent,
} from '@taikai/dappkit';

import AAVEv3StrategyAnyJson from '../../artifacts/contracts/core/strategies/StrategyLeverageAAVEv3.sol/StrategyLeverageAAVEv3.json';
import { AAVEv3StrategyAnyMethods } from 'src/interfaces/StrategyLeverageAAVEv3';
import * as Events from '@events/StrategyLeverageAAVEv3';
import { PastEventOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

export class StrategyLeverageAAVEv3 extends Model<AAVEv3StrategyAnyMethods> implements Deployable {
  constructor(web3Connection: Web3Connection | Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, AAVEv3StrategyAnyJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(
    initialOwner: string,
    registry: string,
    collateral: string,
    oracle: string,
    swapFeeTier: number,
    eModeCategory: number,
  ) {
    const deployOptions = {
      data: AAVEv3StrategyAnyJson.bytecode,
      arguments: [initialOwner, registry, collateral, oracle, swapFeeTier, eModeCategory],
    };
    return this.deploy(deployOptions, this.connection.Account);
  }

  async getPosition(priceOptions: { maxAge: number; maxConf: number }) {
    return this.callTx(this.contract.methods.getPosition(priceOptions));
  }

  async harvest() {
    return this.sendTx(this.contract.methods.harvest());
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async governor() {
    return this.callTx(this.contract.methods.governor());
  }

  async renounceOwnership() {
    return this.sendTx(this.contract.methods.renounceOwnership());
  }

  async totalAssets(priceOptions: { maxAge: number; maxConf: number }) {
    return this.callTx(this.contract.methods.totalAssets(priceOptions));
  }

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async undeploy(amount: number) {
    return this.sendTx(this.contract.methods.undeploy(amount));
  }

  async getLoanToValue() {
    return this.callTx(this.contract.methods.getLoanToValue());
  }

  async getMaxLoanToValue() {
    return this.callTx(this.contract.methods.getMaxLoanToValue());
  }

  async getNrLoops() {
    return this.callTx(this.contract.methods.getNrLoops());
  }

  async setLoanToValue(loanToValue: number) {
    return this.sendTx(this.contract.methods.setLoanToValue(loanToValue));
  }

  async setMaxLoanToValue(maxLoanToValue: number) {
    return this.sendTx(this.contract.methods.setMaxLoanToValue(maxLoanToValue));
  }

  async setNrLoops(nrLoops: number) {
    return this.sendTx(this.contract.methods.setNrLoops(nrLoops));
  }

  async getCollateralOracle() {
    return this.callTx(this.contract.methods.getCollateralOracle());
  }

  async getDebtOracle() {
    return this.callTx(this.contract.methods.getDebtOracle());
  }

  async getCollateralToken() {
    return this.callTx(this.contract.methods.getCollateralOracle());
  }

  async getDebtToken() {
    return this.callTx(this.contract.methods.getDebtOracle());
  }

  async setCollateralOracle(oracle: string) {
    return this.sendTx(this.contract.methods.setCollateralOracle(oracle));
  }

  async setDebtOracle(oracle: string) {
    return this.sendTx(this.contract.methods.setCollateralOracle(oracle));
  }

  async getOwnershipTransferredEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.OwnershipTransferredEvent> {
    return this.contract.self.getPastEvents('OwnershipTransferred', filter);
  }

  async getStrategyAmountUpdateEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.StrategyAmountUpdateEvent> {
    return this.contract.self.getPastEvents('StrategyAmountUpdate', filter);
  }

  async getStrategyLossEvents(filter: PastEventOptions): XPromiseEvent<Events.StrategyLossEvent> {
    return this.contract.self.getPastEvents('StrategyLoss', filter);
  }

  async getStrategyProfitEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.StrategyProfitEvent> {
    return this.contract.self.getPastEvents('StrategyProfit', filter);
  }

  async getSwapEvents(filter: PastEventOptions): XPromiseEvent<Events.SwapEvent> {
    return this.contract.self.getPastEvents('Swap', filter);
  }

  async getStrategyDeployEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.StrategyDeployEvent> {
    return this.contract.self.getPastEvents('StrategyDeploy', filter);
  }

  async getStrategyUndeployEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.StrategyUndeployEvent> {
    return this.contract.self.getPastEvents('StrategyUndeploy', filter);
  }

  async getLoanToValueChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.LoanToValueChangedEvent> {
    return this.contract.self.getPastEvents('LoanToValueChanged', filter);
  }

  async getNrLoopsChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.NrLoopsChangedEvent> {
    return this.contract.self.getPastEvents('NrLoopsChanged', filter);
  }

  async getSetMaxLoanToValueChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.SetMaxLoanToValueChangedEvent> {
    return this.contract.self.getPastEvents('SetMaxLoanToValueChanged', filter);
  }

  async getPriceMaxAgeChangeEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.PriceMaxAgeChangeEvent> {
    return this.contract.self.getPastEvents('PriceMaxAgeChange', filter);
  }

  async getPriceMaxConfChangeEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.PriceMaxConfChangeEvent> {
    return this.contract.self.getPastEvents('PriceMaxConfChange', filter);
  }
}
