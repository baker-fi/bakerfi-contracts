# Storage Layout Compatibility


## 1.1.1 to 1.4.0

### Vault

1.4.0 Slot 0: _initialized      <= 1.3.0 Slot 0: _initialized
1.4.0 Slot 0: _initializing     <= 1.3.0 Slot 0: _initializing
1.4.0 Slot 151: _paused         <= 1.3.0 Slot 151: _paused
1.4.0 Slot 201: _status         <= 1.3.0 Slot 201: _status
1.4.0 Slot 251: _balances       <= 1.3.0 Slot 251: _balances
1.4.0 Slot 252: _allowances     <= 1.3.0 Slot 252: _allowances
1.4.0 Slot 253: _totalSupply    <= 1.3.0 Slot 253: _totalSupply
1.4.0 Slot 254: _name           <= 1.3.0 Slot 254: _name
1.4.0 Slot 255: _symbol         <= 1.3.0 Slot 255: _symbol
1.4.0 Slot 301: _withdrawalFee  <= 1.3.0 Slot 301: _hashedName
1.4.0 Slot 302: _performanceFee <= 1.3.0 Slot 302: _hashedVersion
1.4.0 Slot 303: _feeReceiver     <= 1.3.0 Slot 303: _name
1.4.0 Slot 304: _maxDeposit      <= 1.3.0 Slot 304: _version
1.4.0 Slot 305: _enabledAccounts <= 1.3.0 Slot 305: __gap
1.4.0 Slot 405: _wETH            <= 1.3.0 Slot 405: _strategy
1.4.0 Slot 456: _roles          <= 1.3.0 Slot 456: __gap
1.4.0 Slot 606: _strategy       <= 1.3.0 Slot 606: __gap
1.4.0 Slot 607: _strategyAsset  <= 1.3.0 Slot 607: __gap


### StrategyLeverageAAVEv3

1.4.0 Slot 0: _initialized      <= 1.3.0 Slot 0: _initialized
1.4.0 Slot 0: _initializing     <= 1.3.0 Slot 0: _initializing
1.4.0 Slot 51: _owner           <= 1.3.0 Slot 51: _owner
1.4.0 Slot 101: _governor       <= 1.3.0 Slot 101: _governor
1.4.0 Slot 102: _loanToValue    <= 1.3.0 Slot 102: _loanToValue
1.4.0 Slot 103: __gap           <= 1.3.0 Slot 103: __gap
1.4.0 Slot 104: _nrLoops        <= 1.3.0 Slot 104: _nrLoops
1.4.0 Slot 105: _maxSlippage    <= 1.3.0 Slot 105: _maxSlippage
1.4.0 Slot 131: _status         <= 1.3.0 Slot 131: _status
1.4.0 Slot 181: _routes         <= 1.3.0 Slot 181: __gap
1.4.0 Slot 182: _fLender           <= 1.3.0 Slot 182: __gap
1.4.0 Slot 184: _deployedAssets    <= 1.3.0 Slot 184: __gap
1.4.0 Slot 185: _collateralToken   <= 1.3.0 Slot 185: __gap
1.4.0 Slot 186: _debtToken         <= 1.3.0 Slot 186: __gap
1.4.0 Slot 187: _oracle             <= 1.3.0 Slot 187: __gap
1.4.0 Slot 189: _flashLoanArgsHash  <= 1.3.0 Slot 189: __gap
1.4.0 Slot 190: _pendingAmount      <= 1.3.0 Slot 190: __gap
1.4.0 Slot 216: _aavev3             <= 1.3.0 Slot 216: __gap


## 1.3.0 to 1.4.0

### Vault

1.3.0 Slot 0: _initialized          => 1.4.0 Slot 0: _initialized
1.3.0 Slot 0: _initializing         => 1.4.0 Slot 0: _initializing
1.3.0 Slot 151: _paused             => 1.4.0 Slot 151: _paused
1.3.0 Slot 201: _status             => 1.4.0 Slot 201: _status
1.3.0 Slot 251: _balances           => 1.4.0 Slot 251: _balances
1.3.0 Slot 252: _allowances         => 1.4.0 Slot 252: _allowances
1.3.0 Slot 253: _totalSupply        => 1.4.0 Slot 253: _totalSupply
1.3.0 Slot 254: _name               => 1.4.0 Slot 254: _name
1.3.0 Slot 301: _hashedName         => 1.4.0 Slot 301: _withdrawalFee
1.3.0 Slot 302: _performanceFee     => 1.4.0 Slot 302: _withdrawalFee
1.3.0 Slot 303: _name               => 1.4.0 Slot 303: _feeReceiver
1.3.0 Slot 304: _version            => 1.4.0 Slot 304: _maxDeposit
1.3.0 Slot 305: _enabledAccounts    => 1.4.0 Slot 305: __gap
1.3.0 Slot 405: _wETH               => 1.4.0 Slot 405: _wETH
1.3.0 Slot 606: _strategy           => 1.4.0 Slot 456: _strategy
1.3.0 Slot 607: _gap                => 1.4.0 Slot 607: _strategyAsset


### StrategyLeverageMorphoBlue

1.3.0 Slot 0: _initialized          => 1.4.0 Slot 0: _initialized
1.3.0 Slot 0: _initializing         => 1.4.0 Slot 0: _initializing
1.3.0 Slot 51: _owner               => 1.4.0 Slot 51: _owner
1.3.0 Slot 101: _governor           => 1.4.0 Slot 101: _governor
1.3.0 Slot 102: _loanToValue        => 1.4.0 Slot 102: _loanToValue
1.3.0 Slot 103: _gap                => 1.4.0 Slot 103: __gap
1.3.0 Slot 104: _nrLoops            => 1.4.0 Slot 104: _nrLoops
1.3.0 Slot 105: _maxSlippage        => 1.4.0 Slot 105: _maxSlippage
1.3.0 Slot 131: _status             => 1.4.0 Slot 131: _status
1.3.0 Slot 181: _uniRouter          => 1.4.0 Slot 181: _routes
1.3.0 Slot 182: _gap                => 1.4.0 Slot 182: _fLender
1.3.0 Slot 184: _deployedAssets     => 1.4.0 Slot 184: _deployedAssets
1.3.0 Slot 185: _collateralToken    => 1.4.0 Slot 185: _collateralToken
1.3.0 Slot 186: _debtToken          => 1.4.0 Slot 186: _debtToken
1.3.0 Slot 187: _collateralOracle   => 1.4.0 Slot 187: _oracle
1.3.0 Slot 188: _flashLoanArgsHash  => 1.4.0 Slot 189: _flashLoanArgsHash
1.3.0 Slot 189: _pendingAmount      => 1.4.0 Slot 189: _pendingAmount
1.3.0 Slot 190: _gap                => 1.4.0 Slot 190: __gap
1.3.0 Slot 216: _marketParams       => 1.4.0 Slot 216: _marketParams
1.3.0 Slot 221: _morpho             => 1.4.0 Slot 221: _morpho
