# Solidity API

## UseIERC4626

_Contract to integrate the use of ERC4626 vaults._

### InvalidVaultAddress

```solidity
error InvalidVaultAddress()
```

_Error thrown when an invalid vault address is provided._

### FailedToApproveAllowanceForVault

```solidity
error FailedToApproveAllowanceForVault()
```

### initializeUseIERC4626

```solidity
function initializeUseIERC4626(address initialOwner) internal
```

### approveTokenForVault

```solidity
function approveTokenForVault(contract IERC4626 vault, contract IERC20 token) public
```

### isTokenApprovedForVault

```solidity
function isTokenApprovedForVault(contract IERC4626 vault, contract IERC20 token) public view returns (bool)
```

### unapproveTokenForVault

```solidity
function unapproveTokenForVault(contract IERC4626 vault, contract IERC20 token) public
```

### convertToVaultAssets

```solidity
function convertToVaultAssets(contract IERC4626 vault, uint256 shares) internal view returns (uint256)
```

_Converts a specified amount of shares to assets within a vault._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| shares | uint256 | The amount of shares to convert. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of assets equivalent to the shares. |

### convertToVaultShares

```solidity
function convertToVaultShares(contract IERC4626 vault, uint256 assets) internal view returns (uint256)
```

_Converts a specified amount of assets to shares within a vault._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| assets | uint256 | The amount of assets to convert. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of shares equivalent to the assets. |

### totalVaultAssets

```solidity
function totalVaultAssets(contract IERC4626 vault) internal view virtual returns (uint256)
```

_Returns the total amount of assets managed by a vault._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The total amount of assets managed by the vault. |

### vaultAsset

```solidity
function vaultAsset(contract IERC4626 vault) internal view returns (address)
```

_Returns the address of the asset token used by a vault._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the asset token. |

### depositVault

```solidity
function depositVault(contract IERC4626 vault, uint256 assets, address receiver) internal virtual returns (uint256 shares)
```

_Deposits a specified amount of assets into a vault for a receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| assets | uint256 | The amount of assets to deposit. |
| receiver | address | The address to receive the shares. |

### mintVault

```solidity
function mintVault(contract IERC4626 vault, uint256 shares, address receiver) internal virtual returns (uint256 assets)
```

_Mints a specified amount of shares in a vault for a receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| shares | uint256 | The amount of shares to mint. |
| receiver | address | The address to receive the shares. |

### withdrawVault

```solidity
function withdrawVault(contract IERC4626 vault, uint256 assets, address receiver, address owner) internal virtual returns (uint256 shares)
```

_Withdraws a specified amount of assets from a vault to a receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| assets | uint256 | The amount of assets to withdraw. |
| receiver | address | The address to receive the assets. |
| owner | address | The owner of the shares. |

### redeemVault

```solidity
function redeemVault(contract IERC4626 vault, uint256 shares, address receiver, address owner) internal virtual returns (uint256 assets)
```

_Redeems a specified amount of shares in a vault for a receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| shares | uint256 | The amount of shares to redeem. |
| receiver | address | The address to receive the assets. |
| owner | address | The owner of the shares. |

## UseIERC4626Mock

_Mock implementation of UseIERC4626 for testing purposes._

### initialize

```solidity
function initialize(address initialOwner) public
```

### test__depositVault

```solidity
function test__depositVault(contract IERC4626 vault, uint256 assets, address receiver) external returns (uint256)
```

_Deposits a specified amount of assets into a vault for a receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| assets | uint256 | The amount of assets to deposit. |
| receiver | address | The address to receive the shares. |

### test__mintVault

```solidity
function test__mintVault(contract IERC4626 vault, uint256 shares, address receiver) external returns (uint256)
```

_Mints a specified amount of shares in a vault for a receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| shares | uint256 | The amount of shares to mint. |
| receiver | address | The address to receive the shares. |

### test__withdrawVault

```solidity
function test__withdrawVault(contract IERC4626 vault, uint256 assets, address receiver, address owner) external returns (uint256)
```

_Withdraws a specified amount of assets from a vault to a receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| assets | uint256 | The amount of assets to withdraw. |
| receiver | address | The address to receive the assets. |
| owner | address | The owner of the shares. |

### test__redeemVault

```solidity
function test__redeemVault(contract IERC4626 vault, uint256 shares, address receiver, address owner) external returns (uint256)
```

_Redeems a specified amount of shares in a vault for a receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vault | contract IERC4626 | The address of the ERC4626 vault. |
| shares | uint256 | The amount of shares to redeem. |
| receiver | address | The address to receive the assets. |
| owner | address | The owner of the shares. |

