## BakerFi Tasks

## Ethereum Balance

```
npx hardhat --network arbitrum balance --account 0xfF432D4E9B4Cd848a32294EFE01157AF0660B1F9
```

## Vault Tasks

### Deposit
```
npx hardhat --network arbitrum vault:deposit --account 0xfF432D4E9B4Cd848a32294EFE01157AF0660B1F9  --amount 10000
```

### Withdraw
```
npx hardhat --network arbitrum vault:withdraw --account 0xfF432D4E9B4Cd848a32294EFE01157AF0660B1F9  --amount 10000
```

### Rebalance Vault
```
npx hardhat --network arbitrum vault:rebalance
```

### Balance
```
npx hardhat --network arbitrum vault:balance --account 0xfF432D4E9B4Cd848a32294EFE01157AF0660B1F9
```

### Assets
```
npx hardhat --network arbitrum vault:assets
```

### Shares/ETH Ratio
```
npx hardhat --network arbitrum vault:tokenPerAsset
```

## Settings

### Enable/Disable an Account
```
npx hardhat --network arbitrum settings:enableAccount --account 0xfF432D4E9B4Cd848a32294EFE01157AF0660B1F9 --enabled true
# Disable
npx hardhat --network arbitrum settings:enableAccount --account 0xfF432D4E9B4Cd848a32294EFE01157AF0660B1F9 --enabled true

```

### Verify an Account on White List

```
npx hardhat --network arbitrum settings:isAccountEnabled --account 0xEcFd04634a13E1f449c8436EBF489BE02C57FeA2
```

### Fee Receiver Account
```
npx hardhat --network local settings:getFeeReceiver
npx hardhat --network local settings:setFeeReceiver --account 0x508893f4E26412fe4Bbeb4895335882b655Bcf65
```

## Perfomance Fee

```
npx hardhat --network local settings:getPerformanceFee
npx hardhat --network local settings:setPerformanceFee --value 16000000
```

## Withdrawal Fee

```
npx hardhat --network local settings:getWithdrawalFee
npx hardhat --network local settings:setWithdrawalFee --value 160000000
```

## Read and Write Max Loan To Value

```
npx hardhat --network local strategy:setMaxLoanToValue --value 86000000
npx hardhat --network local strategy:getMaxLoanToValue
```
### Read and Write Loan To Value

```
npx hardhat --network local strategy:getLoanToValue
npx hardhat --network local strategy:setLoanToValue --value 810000000
```

### Read and Write Number of Loops

```
npx hardhat --network local strategy:getNrLoops
npx hardhat --network local strategy:getNrLoops --value 810000000
```

## Smart Contract Storage Analyss

```
npx hardhat storage-layout --update
# Check if the contract is storage compatible
npx hardhat storage-layout --check
```
