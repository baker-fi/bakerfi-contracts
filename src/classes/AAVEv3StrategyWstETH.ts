import {
  Model,
  Web3Connection,
  Web3ConnectionOptions,
  Deployable,
  XPromiseEvent,
} from "@taikai/dappkit";

import AAVEv3StrategyWstETHJson from "../../artifacts/contracts/core/strategies/AAVEv3StrategyWstETH.sol/AAVEv3StrategyWstETH.json";
import { AAVEv3StrategyWstETHMethods } from "src/interfaces/AAVEv3StrategyWstETH";
import * as Events from "src/events/AAVEv3StrategyWstETH";
import { PastEventOptions } from "web3-eth-contract";
import { AbiItem } from "web3-utils";

export class AAVEv3StrategyWstETH
  extends Model<AAVEv3StrategyWstETHMethods>
  implements Deployable
{
  constructor(
    web3Connection: Web3Connection | Web3ConnectionOptions,
    contractAddress?: string
  ) {
    super(
      web3Connection,
      AAVEv3StrategyWstETHJson.abi as AbiItem[],
      contractAddress
    );
  }

  async deployJsonAbi(
    initialOwner: string,
    registry: string,
    swapFeeTier: number,
    eModeCategory: number
  ) {
    const deployOptions = {
      data: AAVEv3StrategyWstETHJson.bytecode,
      arguments: [initialOwner, registry, swapFeeTier, eModeCategory],
    };
    return this.deploy(deployOptions, this.connection.Account);
  }

  async aaveV3() {
    return this.callTx(this.contract.methods.aaveV3());
  }

  async aaveV3A() {
    return this.callTx(this.contract.methods.aaveV3A());
  }

  async calcDeltaPosition(
    percentageToBurn: number,
    totalCollateralBaseInEth: number,
    totalDebtBaseInEth: number
  ) {
    return this.callTx(
      this.contract.methods.calcDeltaPosition(
        percentageToBurn,
        totalCollateralBaseInEth,
        totalDebtBaseInEth
      )
    );
  }

  async calculateDebtToPay(
    targetLoanToValue: number,
    collateral: number,
    debt: number
  ) {
    return this.callTx(
      this.contract.methods.calculateDebtToPay(
        targetLoanToValue,
        collateral,
        debt
      )
    );
  }

  async calculateLeverageRatio(
    baseValue: number,
    loanToValue: number,
    nrLoops: number
  ) {
    return this.callTx(
      this.contract.methods.calculateLeverageRatio(
        baseValue,
        loanToValue,
        nrLoops
      )
    );
  }

  async flashLender() {
    return this.callTx(this.contract.methods.flashLender());
  }

  async flashLenderA() {
    return this.callTx(this.contract.methods.flashLenderA());
  }

  async getPosition() {
    return this.callTx(this.contract.methods.getPosition());
  }

  async harvest() {
    return this.sendTx(this.contract.methods.harvest());
  }

  async ierc20() {
    return this.callTx(this.contract.methods.ierc20());
  }

  async ierc20A() {
    return this.callTx(this.contract.methods.ierc20A());
  }

  async onFlashLoan(
    initiator: string,
    token: string,
    amount: number,
    fee: number,
    callData: string
  ) {
    return this.sendTx(
      this.contract.methods.onFlashLoan(initiator, token, amount, fee, callData)
    );
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async registerSvc() {
    return this.callTx(this.contract.methods.registerSvc());
  }

  async renounceOwnership() {
    return this.sendTx(this.contract.methods.renounceOwnership());
  }

  async settings() {
    return this.callTx(this.contract.methods.settings());
  }

  async settingsA() {
    return this.callTx(this.contract.methods.settingsA());
  }

  async stETH() {
    return this.callTx(this.contract.methods.stETH());
  }

  async stETHA() {
    return this.callTx(this.contract.methods.stETHA());
  }

  async totalAssets() {
    return this.callTx(this.contract.methods.totalAssets());
  }

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async undeploy(amount: number) {
    return this.sendTx(this.contract.methods.undeploy(amount));
  }

  async uniQuoter() {
    return this.callTx(this.contract.methods.uniQuoter());
  }

  async uniQuoterA() {
    return this.callTx(this.contract.methods.uniQuoterA());
  }

  async uniRouter() {
    return this.callTx(this.contract.methods.uniRouter());
  }

  async uniRouterA() {
    return this.callTx(this.contract.methods.uniRouterA());
  }

  async wETH() {
    return this.callTx(this.contract.methods.wETH());
  }

  async wETHA() {
    return this.callTx(this.contract.methods.wETHA());
  }

  async wstETH() {
    return this.callTx(this.contract.methods.wstETH());
  }

  async wstETHA() {
    return this.callTx(this.contract.methods.wstETHA());
  }

  async getOwnershipTransferredEvents(
    filter: PastEventOptions
  ): XPromiseEvent<Events.OwnershipTransferredEvent> {
    return this.contract.self.getPastEvents("OwnershipTransferred", filter);
  }

  async getStrategyAmountUpdateEvents(
    filter: PastEventOptions
  ): XPromiseEvent<Events.StrategyAmountUpdateEvent> {
    return this.contract.self.getPastEvents("StrategyAmountUpdate", filter);
  }

  async getStrategyLossEvents(
    filter: PastEventOptions
  ): XPromiseEvent<Events.StrategyLossEvent> {
    return this.contract.self.getPastEvents("StrategyLoss", filter);
  }

  async getStrategyProfitEvents(
    filter: PastEventOptions
  ): XPromiseEvent<Events.StrategyProfitEvent> {
    return this.contract.self.getPastEvents("StrategyProfit", filter);
  }

  async getSwapEvents(
    filter: PastEventOptions
  ): XPromiseEvent<Events.SwapEvent> {
    return this.contract.self.getPastEvents("Swap", filter);
  }
}
