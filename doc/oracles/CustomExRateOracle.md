# Solidity API

## CustomExRateOracle

This contract provide safe and unsafe price retrieval functions

### Call

```solidity
struct Call {
  address target;
  bytes callData;
}
```

### constructor

```solidity
constructor(contract IOracle baseOracle, struct CustomExRateOracle.Call call, uint8 resultDecimals) public
```

### getRatio

```solidity
function getRatio() public view virtual returns (struct IOracle.Price ratio)
```

Get a Ratio from the External oracle

_This method is not part of the IOracle interface but it could be usefull
to show prices on the frontend

Example: Could be used to get stETH-WSETH conversion rate from Lido Contracts_

