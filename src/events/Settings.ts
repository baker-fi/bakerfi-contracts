export interface FeeReceiverChangedEvent { returnValues: {'value': number;} }
export interface LoanToValueChangedEvent { returnValues: {'value': number;} }
export interface NrLoopsChangedEvent { returnValues: {'value': number;} }
export interface OwnershipTransferredEvent { returnValues: {'previousOwner': string;'newOwner': string;} }
export interface PerformanceFeeChangedEvent { returnValues: {'value': number;} }
export interface SetMaxLoanToValueChangedEvent { returnValues: {'value': number;} }
export interface WithdrawalFeeChangedEvent { returnValues: {'value': number;} }
export interface AccountWhiteListEvent { returnValues: {'account': string , 'enabled': boolean; } }
export interface PriceMaxAgeChangeEvent { returnValues: {'value': number;} }
export interface RebalancePriceMaxAgeChangeEvent { returnValues: {'value': number;} }
