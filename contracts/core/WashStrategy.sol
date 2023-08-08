
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IStETH} from "../interfaces/lido/IStETH.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IPoolV3} from "../interfaces/aave/v3/IPoolV3.sol";
import {ICurvePool} from "../interfaces/curve/ICurvePool.sol";

contract WashStrategy is IStrategy {
    using SafeMath for uint256;

    uint256 constant MAX_PERCENT = 10000;
    uint64 private constant STRATEGY_DELAY = 1 weeks;
    uint64 private constant BORROW_PERCENTAGE = 55000; 
    uint8 private constant MAX_ROTATIONS = 10; 

    uint256 _deployedAmountETH;
    uint256 _leverageAmountETH; 

    IStETH  public  immutable _stETH;
    IWStETH public immutable _wstETH;
    IPoolV3 public immutable _aavePool;
    address public immutable _borrowAsset;
    ICurvePool public immutable _curvePool;

    struct Rotation {
        uint256 amount;
        uint256 rotatedAt;
    }

    Rotation[MAX_ROTATIONS] private _rotations;
    uint8 private _currentRotation = 0;


    constructor(        
        IStETH stETH,
        IWStETH wstETH,
        IPoolV3 aavePool,
        address borrowAsset,
        ICurvePool curvePool
    ) {
        _stETH = stETH;
        _wstETH= wstETH;
        _aavePool = aavePool;
        _borrowAsset = borrowAsset;
        _curvePool  = curvePool;
    }


    function deploy(uint256 amount) external override {
        require(_currentRotation == 0, "Program has not ended");        
        _currentRotation = 1;   
        _rotations[0].amount = amount;
        _rotations[0].rotatedAt = block.timestamp;
        rotate();
    }

    function rotate() public  {
        require(_currentRotation <= MAX_ROTATIONS, "Invalid Rotation");        
        uint256 washingAmount = _rotations[_currentRotation-1].amount;
         //1. Deposit ETH  
        uint256 stkETH = _stETH.submit{value: washingAmount}(address(0));
        uint256 wSkETH = _wstETH.wrap(stkETH);
        // Verify id the program is terminated for today
        if(_currentRotation > MAX_ROTATIONS) {
            for (uint8 i = 0; i < MAX_ROTATIONS; i++) {
                _rotations[i].amount = 0;
            }
            _currentRotation = 0;   
        } else {
             //2. Deposit wstETH on AAVE       
            _aavePool.supply(
                address(_wstETH),
                wSkETH,
                address(this),
                0
            );
            _aavePool.setUserUseReserveAsCollateral(
                address(_wstETH),
                true
            );
            //3. Borrow cbETH on AAVE 
            uint256 borrowAmount = wSkETH * MAX_PERCENT/BORROW_PERCENTAGE;
            _aavePool.borrow(
                _borrowAsset,
                borrowAmount,
                2,
                0,
                address(this)
            );
            //4. Swap cbETH -> ETH                
            uint256 ethRcvd = _curvePool.exchange(1, 0, borrowAmount, 0);
            _rotations[_currentRotation+1].amount = ethRcvd;
            _currentRotation++;
        }

    }

    function harvest(
        uint256 balance,
        address sender
    ) external override returns (int256 amountAdded) {
        // W
    }

    function withdraw(
        uint256 amount
    ) external override returns (uint256 actualAmount) {


    }

    function exit(
        uint256 balance
    ) external override returns (int256 amountAdded) {


    }
}