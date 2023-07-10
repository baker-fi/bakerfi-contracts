
// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";

contract Vault is IERC4626, ERC20, Ownable, Pausable, ReentrancyGuard {
    using SafeMath for uint256;
    using RebaseLibrary for Rebase;

    struct StrategyData {
        uint256 strategyStartDate;
        uint256 targetPercentage;
        uint256 balance; // the balance of the strategy deployed
    }

    uint256 private constant MINIMUM_SHARE_BALANCE = 1000; // To prevent the ratio going off
    uint256 constant MAX_PERCENT = 10000;
    uint64 private constant STRATEGY_DELAY = 1 weeks;
    uint64 private constant MAX_TARGET_PERCENTAGE = 95000; // 95%
    
    IStrategy private _currentStrategy;
    IStrategy private _pendingStrategy;
    StrategyData private _strategyData;


    address private _asset;
    uint256 private _collateralTotal;

    modifier allowed(address receiver) {
        require(receiver == msg.sender, "Vault: Invalid Receiver");    
        require(receiver != address(this), "Vault: Invalid Receiver");
        require(receiver != address(0), "Vault: Invalid Receiver");
        _;
    }

     modifier allowedOwner(address owner) {
        require(owner == msg.sender, "Vault: Invalid Owner");    
        require(owner != address(this), "Vault: Invalid Owner");
        require(owner != address(0), "Vault: Invalid Owner");
        _;
    }

    constructor(
        address asset_,
        address owner,
        string memory name,
        string memory symbol
    ) IERC4626() ERC20(name, symbol) Ownable() Pausable() ReentrancyGuard() {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
        _asset = asset_;
        _collateralTotal = 0;
    }

    
    function collateral() public view returns (uint256) {
        return _collateralTotal;
    }

    function asset()
        external
        view
        override
        returns (address assetTokenAddress)
    {
        return _asset;
    }

    function totalAssets()
        external
        view
        override
        returns (uint256 totalManagedAssets)
    {
        totalManagedAssets = _collateralTotal;
    }

        function toShare(
        uint256 amount,
        bool roundUp
    ) external view returns (uint256 share) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        share = total.toBase(amount, roundUp);
    }


    function convertToShares(
        uint256 assets
    ) external view override returns (uint256 shares) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        shares = total.toBase(assets, false);
    }

    function convertToAssets(
        uint256 shares
    ) external view override returns (uint256 assets) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        assets = total.toElastic(shares, false);
    }

    function maxDeposit(
        address
    ) external view override returns (uint256 maxAssets) {
        return IERC20(_asset).totalSupply() - IERC20(_asset).balanceOf(address(this));
    }

    function previewDeposit(
        uint256 assets
    ) external view override returns (uint256 shares) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        shares = total.toBase(assets, false);
    }

    function deposit(
        uint256 assets,
        address receiver
    ) external override allowed(receiver) returns (uint256 shares) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        // value of the share may be lower than the amount due to rounding, that's ok
        shares = total.toBase(assets, false);
        // Any deposit should lead to at least the minimum share balance, otherwise it's ignored (no amount taken)
        if (total.base.add(shares) < MINIMUM_SHARE_BALANCE) {
            return 0;
        }      
        _mint(receiver, shares);
        _collateralTotal = total.elastic.add(assets);
        IERC20(_asset).transferFrom(msg.sender, address(this), assets);
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function maxMint(
        address receiver
    ) external view override returns (uint256 maxShares) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        maxShares = total.toBase( IERC20(_asset).balanceOf(receiver), false);
    }

    function previewMint(
        uint256 shares
    ) external view override returns (uint256 assets) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        assets = total.toElastic(shares, false);
    }

    function mint(
        uint256 shares,
        address receiver
    ) external override allowed(receiver) returns (uint256 assets) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        assets = total.toElastic(shares, true);
        if (total.base.add(shares) < MINIMUM_SHARE_BALANCE) {
            return 0;
        }   
        _mint(receiver, shares);
        _collateralTotal = total.elastic.add(assets);
        IERC20(_asset).transferFrom(msg.sender, address(this), assets);
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function maxWithdraw(
        address owner
    ) external view override returns (uint256 maxAssets) {
         Rebase memory total = Rebase(_collateralTotal, totalSupply());
         maxAssets =  total.toElastic(balanceOf(owner), true);
    }

    function previewWithdraw(
        uint256 assets
    ) external view override returns (uint256 shares) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        shares = total.toBase(assets, true);  
    }

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external override allowedOwner(owner) returns (uint256 shares) {
        require(msg.sender == owner, "Withdrawer is not owner");
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        // value of the share paid could be lower than the amount paid due to rounding, in that case, add a share (Always round up)
        shares = total.toBase(assets, true);        
        _collateralTotal = total.elastic.sub(assets);
        require(
            total.base >= MINIMUM_SHARE_BALANCE || total.base == 0,
            "Vault: cannot empty"
        );
        _burn(owner, shares);
        IERC20(_asset).transfer(receiver, assets);
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    function maxRedeem(
        address owner
    ) external view override returns (uint256 maxShares) {
        maxShares = balanceOf(owner);
    }

    function previewRedeem(
        uint256 shares
    ) external view override returns (uint256 assets) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        assets = total.toElastic(shares, false);
    }

    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) external override allowedOwner(owner) returns (uint256 assets) {
        require(msg.sender == owner, "Withdrawer is not owner");
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        assets = total.toElastic(shares, false);    
        _burn(owner, shares);
        IERC20(_asset).transfer(receiver, assets);
        _collateralTotal = total.elastic.sub(assets);
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }


    event StrategyTargetPercentage(uint256 targetPercentage);
    event StrategyQueued(IStrategy indexed strategy);
    event StrategySet(IStrategy indexed strategy);
    event StrategyInvest( uint256 amount);
    event StrategyDivest(uint256 amount);
    event StrategyProfit(uint256 amount);
    event StrategyLoss(uint256 amount);

    /**
     * Change the maximum amount of funds applied to farm
     * @param targetPercentage Percentage of assets applied on the strategy
     */
    function setStrategyTargetPercentage(uint64 targetPercentage) public onlyOwner {
        // Checks
        require(targetPercentage <= MAX_TARGET_PERCENTAGE, "StrategyManager: Target too high");

        // Effects
        _strategyData.targetPercentage = targetPercentage;
        emit StrategyTargetPercentage(targetPercentage);
    }


    function setStrategy(IStrategy newStrategy) public onlyOwner {
          // Strategy Queue to start, it could take 1 week to start
          if (_strategyData.strategyStartDate == 0 || _pendingStrategy != newStrategy) {
            _pendingStrategy = newStrategy;
            _strategyData.strategyStartDate = block.timestamp + STRATEGY_DELAY;
            emit StrategyQueued(newStrategy);
          } else {
            require(_strategyData.strategyStartDate != 0 && block.timestamp >= _strategyData.strategyStartDate, "StrategyManager: Too early");
            // Exit the old strategy 
            if (address(_currentStrategy) != address(0)) {
                int256 balanceChange = _currentStrategy.exit(_strategyData.balance);
                // Effects
                if (balanceChange > 0) {
                    uint256 add = uint256(balanceChange);
                    _collateralTotal = _collateralTotal.add(add);
                    emit StrategyProfit(add);
                } else if (balanceChange < 0) {
                    uint256 sub = uint256(-balanceChange);
                    _collateralTotal = _collateralTotal.sub(sub);
                    emit StrategyLoss(sub);
                }
                emit StrategyDivest(_strategyData.balance);
            }
            _currentStrategy = _pendingStrategy;
            _strategyData.strategyStartDate = 0;
            _strategyData.balance = 0;
            _pendingStrategy = IStrategy(address(0));
            emit StrategySet(newStrategy);
        }
    }

    function harvest(
        bool balance,
        uint256 maxChangeAmount) public
    {
        int256 balanceChange = _currentStrategy.harvest(_strategyData.balance, msg.sender);
        if (balanceChange == 0 && !balance) {
            return;
        }

        if (balanceChange > 0) {
            uint256 add = uint256(balanceChange);
            _collateralTotal = _collateralTotal.add(add);
            emit StrategyProfit(add);
        } else if (balanceChange < 0) {
            uint256 sub = uint256(-balanceChange);
            _collateralTotal = _collateralTotal.sub(sub);
            emit StrategyLoss(sub);
        }

        if (balance) {
            uint256 targetBalance = _collateralTotal.mul(_strategyData.targetPercentage) / MAX_TARGET_PERCENTAGE;
            // if data.balance == targetBalance there is nothing to update
            if (_strategyData.balance < targetBalance) {
                uint256 amountOut = targetBalance.sub(_strategyData.balance);
                if (maxChangeAmount != 0 && amountOut > maxChangeAmount) {
                    amountOut = maxChangeAmount;
                }
                IERC20(_asset).transfer(address(_currentStrategy), amountOut);
                _strategyData.balance = _strategyData.balance.add(amountOut);
                _currentStrategy.farm(amountOut);
                emit StrategyInvest(amountOut);
            } else if (_strategyData.balance > targetBalance) {
                uint256 amountIn = _strategyData.balance.sub(targetBalance);
                if (maxChangeAmount != 0 && amountIn > maxChangeAmount) {
                    amountIn = maxChangeAmount;
                }

                uint256 actualAmountIn = _currentStrategy.withdraw(amountIn);
                _strategyData.balance = _strategyData.balance.sub(actualAmountIn);
                emit StrategyDivest(actualAmountIn);
            }
        }

    }

 
    
}