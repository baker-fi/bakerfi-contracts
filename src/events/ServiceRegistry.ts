export interface OwnershipTransferredEvent {
  returnValues: { previousOwner: string; newOwner: string };
}
export interface ServiceRegisteredEvent {
  returnValues: { nameHash: string; service: string };
}
export interface ServiceUnregisteredEvent {
  returnValues: { nameHash: string };
}
