# Solidity API

## VaultBase

_This contract serves as the base for the BakerFi Vault, providing core functionalities
for managing assets, deposits, withdrawals, and rebalancing strategies.
It inherits from several OpenZeppelin contracts to ensure security and upgradeability._

### InvalidAmount

```solidity
error InvalidAmount()
```

### InvalidAssetsState

```solidity
error InvalidAssetsState()
```

### InvalidAsset

```solidity
error InvalidAsset()
```

### MaxDepositReached

```solidity
error MaxDepositReached()
```

### NotEnoughBalanceToWithdraw

```solidity
error NotEnoughBalanceToWithdraw()
```

### NoAssetsToWithdraw

```solidity
error NoAssetsToWithdraw()
```

### NoPermissions

```solidity
error NoPermissions()
```

### InvalidShareBalance

```solidity
error InvalidShareBalance()
```

### InvalidReceiver

```solidity
error InvalidReceiver()
```

### NoAllowance

```solidity
error NoAllowance()
```

### PAUSER_ROLE

```solidity
bytes32 PAUSER_ROLE
```

### onlyWhiteListed

```solidity
modifier onlyWhiteListed()
```

_Modifier to restrict access to whitelisted accounts._

### constructor

```solidity
constructor() internal
```

### receive

```solidity
receive() external payable
```

_Fallback function to accept ETH transfers.
Reverts if the sender is not the wrapped ETH address._

### _initializeBase

```solidity
function _initializeBase(address initialOwner, string tokenName, string tokenSymbol, address weth) internal
```

_Initializes the base contract with the specified parameters._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the initial owner of the vault. |
| tokenName | string | The name of the token. |
| tokenSymbol | string | The symbol of the token. |
| weth | address | The address of the wrapped ETH contract. |

### _asset

```solidity
function _asset() internal view virtual returns (address)
```

_Returns the address of the asset being managed by the vault._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the asset. |

### _totalAssets

```solidity
function _totalAssets() internal view virtual returns (uint256 amount)
```

_Returns the total amount of assets managed by the vault._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The total assets amount. |

### _harvest

```solidity
function _harvest() internal virtual returns (int256 balanceChange)
```

_Harvests the assets and returns the balance change._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in balance after harvesting. |

### _afterHarvest

```solidity
function _afterHarvest() internal virtual
```

_Hook that is called after harvesting._

### _deploy

```solidity
function _deploy(uint256 assets) internal virtual returns (uint256)
```

_Deploys the specified amount of assets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to deploy. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of assets deployed. |

### _undeploy

```solidity
function _undeploy(uint256 assets) internal virtual returns (uint256)
```

_Undeploys the specified amount of assets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to undeploy. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of assets undeployed. |

### rebalance

```solidity
function rebalance() external returns (int256 balanceChange)
```

_Rebalances the vault's assets._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in balance after rebalancing. |

### maxMint

```solidity
function maxMint(address) external pure returns (uint256 maxShares)
```

_Returns the maximum number of shares that can be minted._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxShares | uint256 | The maximum number of shares. |

### previewMint

```solidity
function previewMint(uint256 shares) external view returns (uint256 assets)
```

_Returns the amount of assets that can be obtained for a given number of shares._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares to preview. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets corresponding to the shares. |

### mint

```solidity
function mint(uint256 shares, address receiver) external returns (uint256 assets)
```

_Mints shares for the specified receiver in exchange for assets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares to mint. |
| receiver | address | The address of the receiver. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets used to mint the shares. |

### maxDeposit

```solidity
function maxDeposit(address) external pure returns (uint256 maxAssets)
```

_Returns the maximum amount of assets that can be deposited._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxAssets | uint256 | The maximum amount of assets. |

### previewDeposit

```solidity
function previewDeposit(uint256 assets) external view returns (uint256 shares)
```

_Returns the number of shares that can be obtained for a given amount of assets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to preview. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares corresponding to the assets. |

### depositNative

```solidity
function depositNative(address receiver) external payable returns (uint256 shares)
```

_Deposits native ETH into the vault, wrapping it in WETH._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiver | address | The address of the receiver. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares minted for the deposit. |

### deposit

```solidity
function deposit(uint256 assets, address receiver) external returns (uint256 shares)
```

_Deposits the specified amount of assets into the vault._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to deposit. |
| receiver | address | The address of the receiver. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares minted for the deposit. |

### maxWithdraw

```solidity
function maxWithdraw(address shareHolder) external view returns (uint256 maxAssets)
```

_Returns the maximum amount of assets that can be withdrawn by a shareholder._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shareHolder | address | The address of the shareholder. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxAssets | uint256 | The maximum amount of assets that can be withdrawn. |

### previewWithdraw

```solidity
function previewWithdraw(uint256 assets) external view returns (uint256 shares)
```

_Returns the number of shares that can be obtained for a given amount of assets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to preview. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares corresponding to the assets. |

### withdrawNative

```solidity
function withdrawNative(uint256 assets) external returns (uint256 shares)
```

_Withdraws native ETH from the vault._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to withdraw. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares burned for the withdrawal. |

### redeemNative

```solidity
function redeemNative(uint256 shares) external returns (uint256 assets)
```

_Redeems native ETH from the vault for the specified number of shares._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares to redeem. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets withdrawn. |

### withdraw

```solidity
function withdraw(uint256 assets, address receiver, address holder) external returns (uint256 shares)
```

_Withdraws the specified amount of assets from the vault._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to withdraw. |
| receiver | address | The address of the receiver. |
| holder | address | The owner of the assets to withdraw. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares burned for the withdrawal. |

### maxRedeem

```solidity
function maxRedeem(address shareHolder) external view returns (uint256 maxShares)
```

_Returns the maximum number of shares that can be redeemed by a shareholder._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shareHolder | address | The address of the shareholder. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxShares | uint256 | The maximum number of shares that can be redeemed. |

### previewRedeem

```solidity
function previewRedeem(uint256 shares) external view returns (uint256 assets)
```

_Returns the amount of assets that can be obtained for a given number of shares._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares to preview. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets corresponding to the shares. |

### redeem

```solidity
function redeem(uint256 shares, address receiver, address holder) external returns (uint256 retAmount)
```

_Redeems the specified number of shares for assets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares to redeem. |
| receiver | address | The address of the receiver. |
| holder | address | The owner of the shares to redeem. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| retAmount | uint256 | The amount of assets received after redemption. |

### totalAssets

```solidity
function totalAssets() public view returns (uint256 amount)
```

_Retrieves the total assets controlled/belonging to the vault._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The total assets under management by the strategy. |

### convertToShares

```solidity
function convertToShares(uint256 assets) external view returns (uint256 shares)
```

_Converts the specified amount of ETH/ERC20 to shares._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to be converted to shares. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The calculated number of shares. |

### convertToAssets

```solidity
function convertToAssets(uint256 shares) external view returns (uint256 assets)
```

_Converts the specified number of shares to ETH/ERC20._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares to be converted to assets. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The calculated amount of assets. |

### asset

```solidity
function asset() external view returns (address)
```

_Returns the address of the asset being managed by the vault._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the asset. |

### tokenPerAsset

```solidity
function tokenPerAsset() public view returns (uint256)
```

_Retrieves the token-to-Asset exchange rate._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | rate The calculated token-to-ETH exchange rate. |

### pause

```solidity
function pause() external
```

_Pauses the Contract.
Only the Owner is able to pause the vault.
When the contract is paused, deposit, withdraw, and rebalance cannot be called without reverting._

### unpause

```solidity
function unpause() external
```

_Unpauses the contract.
Only the Owner is able to unpause the vault._

