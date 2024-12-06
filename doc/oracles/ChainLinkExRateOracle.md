# Solidity API

## ChainLinkExRateOracle

This contract provide safe and unsafe price retrieval functions

### constructor

```solidity
constructor(contract IOracle baseOracle, contract IChainlinkAggregator ratioFeed) public
```

### getRatio

```solidity
function getRatio() public view virtual returns (struct IOracle.Price ratio)
```

Get the wstETH/ETH Ratio from the External oracle

_This method is not part of the IOracle interface but it could be usefull
to show prices on the frontend_

