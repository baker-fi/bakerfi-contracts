import {
  Model,
  Web3Connection,
  Web3ConnectionOptions,
  Deployable,
  XPromiseEvent,
} from '@taikai/dappkit';

import StrategyLeverageMorphoBlueJson from '../../artifacts/contracts/core/strategies/StrategyLeverageMorphoBlue.sol/StrategyLeverageMorphoBlue.json';
import { StrategyLeverageMorphoBlueMethods } from '@interfaces/StrategyLeverageMorphoBlue';
import * as Events from '@events/StrategyLeverageMorphoBlue';
import { PastEventOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

export class StrategyLeverageMorphoBlue
  extends Model<StrategyLeverageMorphoBlueMethods>
  implements Deployable
{
  constructor(web3Connection: Web3Connection | Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, StrategyLeverageMorphoBlueJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(
    initialOwner: string,
    initialGovernor: string,
    registry: string,
    collateralToken: string,
    debtToken: string,
    collateralOracle: string,
    debtOracle: string,
    swapFeeTier: number,
    morphoOracle: string,
    irm: string,
    lltv: bigint,
  ) {
    const deployOptions = {
      data: StrategyLeverageMorphoBlueJson.bytecode,
      arguments: [
        initialOwner,
        initialGovernor,
        registry,
        [
          collateralToken,
          debtToken,
          collateralOracle,
          debtOracle,
          swapFeeTier,
          morphoOracle,
          irm,
          lltv,
        ],
      ],
    };
    return this.deploy(deployOptions, this.connection.Account);
  }

  async asset() {
    return this.callTx(this.contract.methods.asset());
  }

  async getBalances() {
    return this.callTx(this.contract.methods.getBalances());
  }

  async getCollateralAsset() {
    return this.callTx(this.contract.methods.getCollateralAsset());
  }

  async getCollateralOracle() {
    return this.callTx(this.contract.methods.getCollateralOracle());
  }

  async getDebAsset() {
    return this.callTx(this.contract.methods.getDebAsset());
  }

  async getDebtOracle() {
    return this.callTx(this.contract.methods.getDebtOracle());
  }

  async getLoanToValue() {
    return this.callTx(this.contract.methods.getLoanToValue());
  }

  async getMaxLoanToValue() {
    return this.callTx(this.contract.methods.getMaxLoanToValue());
  }

  async getMaxSlippage() {
    return this.callTx(this.contract.methods.getMaxSlippage());
  }

  async getNrLoops() {
    return this.callTx(this.contract.methods.getNrLoops());
  }

  async getPosition(params: { priceOptions: { maxAge: number; maxConf: number } }) {
    return this.callTx(this.contract.methods.getPosition(params));
  }

  async governor() {
    return this.callTx(this.contract.methods.governor());
  }

  async harvest() {
    return this.sendTx(this.contract.methods.harvest());
  }

  async initialize(
    initialOwner: string,
    initialGovernor: string,
    registry: string,
    params: {
      params: {
        collateralToken: string;
        debtToken: string;
        collateralOracle: string;
        debtOracle: string;
        swapFeeTier: number;
        morphoOracle: string;
        irm: string;
        lltv: number;
      };
    },
  ) {
    return this.sendTx(
      this.contract.methods.initialize(initialOwner, initialGovernor, registry, params),
    );
  }

  async onFlashLoan(
    initiator: string,
    token: string,
    amount: number,
    fee: number,
    callData: string,
  ) {
    return this.sendTx(this.contract.methods.onFlashLoan(initiator, token, amount, fee, callData));
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async renounceOwnership() {
    return this.sendTx(this.contract.methods.renounceOwnership());
  }

  async setCollateralOracle(oracle: string) {
    return this.sendTx(this.contract.methods.setCollateralOracle(oracle));
  }

  async setDebtOracle(oracle: string) {
    return this.sendTx(this.contract.methods.setDebtOracle(oracle));
  }

  async setLoanToValue(loanToValue: number) {
    return this.sendTx(this.contract.methods.setLoanToValue(loanToValue));
  }

  async setMaxLoanToValue(maxLoanToValue: number) {
    return this.sendTx(this.contract.methods.setMaxLoanToValue(maxLoanToValue));
  }

  async setMaxSlippage(slippage: number) {
    return this.sendTx(this.contract.methods.setMaxSlippage(slippage));
  }

  async setNrLoops(nrLoops: number) {
    return this.sendTx(this.contract.methods.setNrLoops(nrLoops));
  }

  async totalAssets(params: { priceOptions: { maxAge: number; maxConf: number } }) {
    return this.callTx(this.contract.methods.totalAssets(params));
  }

  async transferGovernorship(_newGovernor: string) {
    return this.sendTx(this.contract.methods.transferGovernorship(_newGovernor));
  }

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async undeploy(amount: number) {
    return this.sendTx(this.contract.methods.undeploy(amount));
  }

  async getGovernshipTransferredEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.GovernshipTransferredEvent> {
    return this.contract.self.getPastEvents('GovernshipTransferred', filter);
  }

  async getInitializedEvents(filter: PastEventOptions): XPromiseEvent<Events.InitializedEvent> {
    return this.contract.self.getPastEvents('Initialized', filter);
  }

  async getLoanToValueChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.LoanToValueChangedEvent> {
    return this.contract.self.getPastEvents('LoanToValueChanged', filter);
  }

  async getMaxLoanToValueChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.MaxLoanToValueChangedEvent> {
    return this.contract.self.getPastEvents('MaxLoanToValueChanged', filter);
  }

  async getMaxSlippageChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.MaxSlippageChangedEvent> {
    return this.contract.self.getPastEvents('MaxSlippageChanged', filter);
  }

  async getNrLoopsChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.NrLoopsChangedEvent> {
    return this.contract.self.getPastEvents('NrLoopsChanged', filter);
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

  async getStrategyDeployEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.StrategyDeployEvent> {
    return this.contract.self.getPastEvents('StrategyDeploy', filter);
  }

  async getStrategyLossEvents(filter: PastEventOptions): XPromiseEvent<Events.StrategyLossEvent> {
    return this.contract.self.getPastEvents('StrategyLoss', filter);
  }

  async getStrategyProfitEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.StrategyProfitEvent> {
    return this.contract.self.getPastEvents('StrategyProfit', filter);
  }

  async getStrategyUndeployEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.StrategyUndeployEvent> {
    return this.contract.self.getPastEvents('StrategyUndeploy', filter);
  }

  async getSwapEvents(filter: PastEventOptions): XPromiseEvent<Events.SwapEvent> {
    return this.contract.self.getPastEvents('Swap', filter);
  }
}
