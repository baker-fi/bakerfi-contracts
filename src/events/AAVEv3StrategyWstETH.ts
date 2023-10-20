export interface OwnershipTransferredEvent { returnValues: {'previousOwner': string;'newOwner': string;} }
export interface StrategyAmountUpdateEvent { returnValues: {'newDeployment': number;} }
export interface StrategyLossEvent { returnValues: {'amount': number;} }
export interface StrategyProfitEvent { returnValues: {'amount': number;} }
export interface SwapEvent { returnValues: {'assetIn': string;'assetOut': string;'assetInAmount': number;'assetOutAmount': number;} }