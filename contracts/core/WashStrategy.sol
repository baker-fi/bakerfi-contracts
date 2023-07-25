
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IStETH} from "../interfaces/lido/IStETH.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IPoolV3} from "../interfaces/aave/v3/IPoolV3.sol";

contract WashStrategy is IStrategy {
    using SafeMath for uint256;


    uint256 constant MAX_PERCENT = 10000;
    uint64 private constant STRATEGY_DELAY = 1 weeks;
    uint64 private constant BORROW_PERCENTAGE = 55000; 

    uint256 _deployedAmountETH;
    uint256 _leverageAmountETH; 

    IStETH  public  immutable _stETH;
    IWStETH public immutable _wstETH;
    IPoolV3 public immutable _aavePool;
    address public immutable _borrowAsset;


    constructor(        
        IStETH stETH,
        IWStETH wstETH,
        IPoolV3 aavePool,
        address borrowAsset
    ) {
        _stETH = stETH;
        _wstETH= wstETH;
        _aavePool = aavePool;
        _borrowAsset = borrowAsset;
    }


    function deploy(uint256 amount) external override {

        //1. Deposit ETH  
        uint256 stkETH = _stETH.submit{value: amount}(address(0));
        uint256 wSkETH = _wstETH.wrap(stkETH);
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
        // TODO: Convert between prices
        _aavePool.borrow(
            _borrowAsset,
            wSkETH * MAX_PERCENT/BORROW_PERCENTAGE,
            2,
            0,
            address(this)
        );
        //4. Swap cbETH -> ETH         

        //

    }

    function rotate() external {

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