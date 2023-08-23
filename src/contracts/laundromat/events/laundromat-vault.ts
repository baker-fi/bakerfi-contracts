export interface ApprovalEvent { returnValues: {'owner': string;'spender': string;'value': number;} }
export interface DepositEvent { returnValues: {'depositor': string;'receiver': string;'amount': number;'shares': number;} }
export interface OwnershipTransferredEvent { returnValues: {'previousOwner': string;'newOwner': string;} }
export interface PausedEvent { returnValues: {'account': string;} }
export interface TransferEvent { returnValues: {'from': string;'to': string;'value': number;} }
export interface UnpausedEvent { returnValues: {'account': string;} }
export interface WithdrawEvent { returnValues: {'owner': string;'amount': number;'shares': number;} }