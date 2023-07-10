// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract StrategyManager is Ownable, Pausable, ReentrancyGuard {
    
    using SafeMath for uint256;

    
    IStrategy private       _currentStrategy;
    IStrategy private       _pendingStrategy;
    address   private       _asset;
    uint256   private       _strategyStartDate;
    uint256   private       _targetPercentage;
    uint256   private       _deployedAmount; // the balance of the strategy deployed
    
    uint256 constant MAX_PERCENT = 10000;
    uint64 private constant STRATEGY_DELAY = 1 weeks;
    uint64 private constant MAX_TARGET_PERCENTAGE = 95000; 

    event StrategyTargetPercentage(uint256 targetPercentage);
    event StrategyQueued(IStrategy indexed strategy);
    event StrategySet(IStrategy indexed strategy);
    event StrategyInvest( uint256 amount);
    event StrategyDivest(uint256 amount);
    event StrategyProfit(uint256 amount);
    event StrategyLoss(uint256 amount);
    

    constructor( 
        address asset,
        address owner)  Ownable() Pausable() ReentrancyGuard() {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
        _asset = asset;
    }

    /**
     * Change the maximum amount of funds applied to farm
     * @param targetPercentage Percentage of assets applied on the strategy
     */
    function setStrategyTargetPercentage(uint64 targetPercentage) public onlyOwner {
        // Checks
        require(targetPercentage <= MAX_TARGET_PERCENTAGE, "StrategyManager: Target too high");

        // Effects
        _targetPercentage = targetPercentage;
        emit StrategyTargetPercentage(targetPercentage);
    }


    function _getTotalAssets() public virtual returns(uint256);
    
    function _setTotalAssets(uint256 amount) public virtual;


    function setStrategy(IStrategy newStrategy) public onlyOwner {
          // Strategy Queue to start, it could take 1 week to start
          if (_strategyStartDate == 0 || _pendingStrategy != newStrategy) {
            _pendingStrategy = newStrategy;
            _strategyStartDate = block.timestamp + STRATEGY_DELAY;
            emit StrategyQueued(newStrategy);
          } else {
            require(_strategyStartDate != 0 && block.timestamp >= _strategyStartDate, "StrategyManager: Too early");
            // Exit the old strategy 
            if (address(_currentStrategy) != address(0)) {
                int256 balanceChange = _currentStrategy.exit(_deployedAmount);
                // Effects
                if (balanceChange > 0) {
                    uint256 add = uint256(balanceChange);
                     _setTotalAssets(_getTotalAssets().add(add));
                    emit StrategyProfit(add);
                } else if (balanceChange < 0) {
                    uint256 sub = uint256(-balanceChange);
                    _setTotalAssets(_getTotalAssets().sub(sub));
                    emit StrategyLoss(sub);
                }
                emit StrategyDivest(_deployedAmount);
            }
            _currentStrategy = _pendingStrategy;
            _strategyStartDate = 0;
            _deployedAmount = 0;
            _pendingStrategy = IStrategy(address(0));
            emit StrategySet(newStrategy);
        }
    }

    function harvest(
        bool balance,
        uint256 maxChangeAmount) public
    {
        int256 balanceChange = _currentStrategy.harvest(_deployedAmount, msg.sender);
        if (balanceChange == 0 && !balance) {
            return;
        }

        if (balanceChange > 0) {
            uint256 add = uint256(balanceChange);
            _setTotalAssets(_getTotalAssets().add(add));
            emit StrategyProfit(add);
        } else if (balanceChange < 0) {
            uint256 sub = uint256(-balanceChange);
            _setTotalAssets(_getTotalAssets().sub(sub));
            emit StrategyLoss(sub);
        }

        if (balance) {
            uint256 targetBalance = _getTotalAssets().mul(_targetPercentage) / MAX_TARGET_PERCENTAGE;
            // if data.balance == targetBalance there is nothing to update
            if (_deployedAmount < targetBalance) {
                uint256 amountOut = targetBalance.sub(_deployedAmount);
                if (maxChangeAmount != 0 && amountOut > maxChangeAmount) {
                    amountOut = maxChangeAmount;
                }
                IERC20(_asset).transfer(address(_currentStrategy), amountOut);
                _deployedAmount = _deployedAmount.add(amountOut);
                _currentStrategy.farm(amountOut);
                emit StrategyInvest(amountOut);
            } else if (_deployedAmount > targetBalance) {
                uint256 amountIn = _deployedAmount.sub(targetBalance);
                if (maxChangeAmount != 0 && amountIn > maxChangeAmount) {
                    amountIn = maxChangeAmount;
                }

                uint256 actualAmountIn = _currentStrategy.withdraw(amountIn);
                _deployedAmount = _deployedAmount.sub(actualAmountIn);
                emit StrategyDivest(actualAmountIn);
            }
        }

    }

}