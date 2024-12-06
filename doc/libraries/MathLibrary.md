# Solidity API

## MathLibrary

_Library for handling mathematical operations_

### InvalidDivDenominator

```solidity
error InvalidDivDenominator()
```

### OverflowDetected

```solidity
error OverflowDetected()
```

### toDecimals

```solidity
function toDecimals(uint256 value, uint8 from, uint8 to) internal pure returns (uint256 converted)
```

Converts a value from one decimal precision to another.

_This function converts a `value` from a `from` decimal precision to a `to` decimal precision.
     It checks for overflow and reverts if the conversion would cause an overflow._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The numerical value to convert. |
| from | uint8 | The current decimal precision of the `value`. |
| to | uint8 | The target decimal precision to convert to. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| converted | uint256 | The value converted to the target decimal precision. |

### mulDiv

```solidity
function mulDiv(uint256 x, uint256 y, uint256 denominator, bool roundUp) internal pure returns (uint256)
```

This function provides an option to round the division result up or down.
If `roundUp` is true, the function rounds up using the `mulDivUp` function;
otherwise, it rounds down using the `mulDivDown` function.
If `denominator` is zero, the function reverts with an `InvalidDivDenominator` error.

_Multiplies two unsigned integers `x` and `y`, then divides the result by `denominator`
and returns the result either rounded up or down based on the `roundUp` flag._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | uint256 | The first multiplicand as an unsigned integer. |
| y | uint256 | The second multiplicand as an unsigned integer. |
| denominator | uint256 | The divisor as an unsigned integer. Must not be zero. |
| roundUp | bool | A boolean flag indicating whether to round up or down. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The result of the multiplication and division, rounded up or down based on `roundUp`. |

### mulDivUp

```solidity
function mulDivUp(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256)
```

This function performs multiplication followed by division and rounds the result up towards
the next integer. If either `x` or `y` is zero, the function returns 0.
If `denominator` is zero, the function reverts with an `InvalidDivDenominator` error.

_Multiplies two unsigned integers `x` and `y`, then divides the result by `denominator`
and rounds the result up towards the next integer._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | uint256 | The first multiplicand as an unsigned integer. |
| y | uint256 | The second multiplicand as an unsigned integer. |
| denominator | uint256 | The divisor as an unsigned integer. Must not be zero. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The result of the multiplication and division, rounded up towards the next integer. |

### mulDivDown

```solidity
function mulDivDown(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256)
```

This function performs multiplication followed by division. It truncates the result towards zero.
If either `x` or `y` is zero, the function returns 0.
If `denominator` is zero, the function reverts with an `InvalidDivDenominator` error.

_Multiplies two unsigned integers `x` and `y`, then divides the result by `denominator` with truncation towards zero.
The function returns the result of the division._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | uint256 | The first multiplicand as an unsigned integer. |
| y | uint256 | The second multiplicand as an unsigned integer. |
| denominator | uint256 | The divisor as an unsigned integer. Must not be zero. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The result of `(x * y) / denominator`, truncated towards zero. |

