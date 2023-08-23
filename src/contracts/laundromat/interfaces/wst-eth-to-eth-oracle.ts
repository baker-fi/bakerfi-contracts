import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit';

export interface WstETHToETHOracleMethods {


    _stETHToETHPriceFeed(): ContractCallMethod<string>;

  _wstETH(): ContractCallMethod<string>;

  getLatestPrice(): ContractCallMethod<number>;

  getPrecision(): ContractCallMethod<number>;

}