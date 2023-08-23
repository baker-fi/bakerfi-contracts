export interface OwnershipTransferredEvent { returnValues: {'previousOwner': string;'newOwner': string;} }
export interface StrategyLossEvent { returnValues: {'amount': number;} }
export interface StrategyProfitEvent { returnValues: {'amount': number;} }