// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {IWETH} from "../interfaces/tokens/IWETH.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IPoolV3} from "../interfaces/aave/v3/IPoolV3.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import {WETH_CONTRACT, AAVE_V3, FLASH_LENDER, SWAP_HANDLER, ST_ETH_CONTRACT, WST_ETH_CONTRACT} from "./Constants.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {Leverage} from "../libraries/Leverage.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";

contract Vault is Ownable, Pausable, ERC20, IERC3156FlashBorrower {
    
    using SafeMath for uint256;
    using RebaseLibrary for Rebase;
    using Leverage for uint256;
    using SafeERC20 for ERC20;
    struct FlashLoanData {
        uint256 originalAmount;
        address receiver;
    }

    string constant NAME = "laundromat ETH";
    string constant SYMBOl = "lndETH";
    bytes32 constant SUCCESS_MESSAGE = keccak256("ERC3156FlashBorrower.onFlashLoan");
    
    ServiceRegistry public immutable    _registry;
    uint256 private                     _ownedCollateral;
    uint256 public immutable LOAN_TO_VALUE = 80000;
    
    event Deposit(address owner, address receiver, uint256 amount, uint256 shares);
   
    constructor( address owner, ServiceRegistry registry) 
        ERC20(NAME, SYMBOl) 
    {
        require(owner != address(0), "Invalid Owner Address");    
        _transferOwnership(owner);
        _registry = registry;
        _ownedCollateral = 0;
    }

    function maxDeposit(address receiver) external view returns (uint256 maxAssets) {
        
    }

    function previewDeposit(uint256 assets) external view returns (uint256 shares) {

    }


    function deposit(address receiver) external payable returns (uint256 shares) {
        require(msg.value != 0, "ZERO_DEPOSIT");     
        // 1. Wrap Ethereum 
        IWETH weth = IWETH(_registry.getServiceFromHash(WETH_CONTRACT));       
        weth.deposit{ value: msg.value }();

        // 2. Initiate a Flash Loan
        IERC3156FlashLender flashLender = IERC3156FlashLender(_registry.getServiceFromHash(FLASH_LENDER));
        uint256 leverage = Leverage.calculateLeverageRatio(msg.value, LOAN_TO_VALUE, 10);
        uint256 loanAmount = leverage - msg.value;
        uint256 fee = flashLender.flashFee(address(weth), loanAmount);

        uint256 allowance = weth.allowance(
            address(this),
            address(flashLender)
        );

        weth.approve(address(flashLender), loanAmount + fee + allowance );        
        require(flashLender.flashLoan(
            IERC3156FlashBorrower(this),
            address(weth), 
            loanAmount, 
            abi.encode(
                msg.value,
                loanAmount,
                receiver
        )), "Failed to run Flash Loan");     
    }

    function onFlashLoan(address initiator, address token, uint256 amount, uint256 fee, bytes memory callData) external returns (bytes32 ) {   
        require(initiator == address(this), "FlashBorrower: Untrusted loan initiator");
        address weth = _registry.getServiceFromHash(WETH_CONTRACT);       
        address wstETH = _registry.getServiceFromHash(WST_ETH_CONTRACT);
        address stETH =_registry.getServiceFromHash(ST_ETH_CONTRACT);                  

        require(token == weth, "Invalid INput");
        require(stETH != address(0), "Invalid Output");        
        
        FlashLoanData memory data =  abi.decode(callData, (FlashLoanData));        
        // Swap WETH -> stETH
        uint256 stEThAmount = _swaptoken( weth, stETH, data.originalAmount + amount);
        // Wrap stETH -> wstETH
        uint256 wstETHAmount = wrapStETH(stETH, wstETH,  stEThAmount);
        // 1 ETH -> X WST
        // Deposit wstETH and Borrow ETH
        supplyAndBorrow(address(wstETH), wstETHAmount, weth, amount + fee);
        Rebase memory total = Rebase(_ownedCollateral, totalSupply());                      
        
        uint256 shares = total.toBase(data.originalAmount, false);        

        _mint(data.receiver, shares);                 
        _ownedCollateral = total.elastic.add(wstETHAmount);
        emit Deposit(initiator, data.receiver, data.originalAmount, shares);

        return SUCCESS_MESSAGE;
    }



    function wrapStETH(address stETh, address wstETh, uint256 toWrap) private returns (uint256 amountOut) {
        ERC20(stETh).safeApprove(wstETh, toWrap);        
        amountOut = IWStETH(wstETh).wrap(toWrap);      
        //uint256 wstkETHRate = wstETHAmount*1e9/(data.originalAmount + amount);
    }


    function supplyAndBorrow(address assetIn, uint256 amountIn, address assetOut, uint256 borrowOut ) private {
        IPoolV3 aavePool = IPoolV3(_registry.getServiceFromHash(AAVE_V3));         
        ERC20(assetIn).approve(address(aavePool), amountIn);        
        aavePool.supply(assetIn, amountIn, address(this), 0);
        aavePool.borrow(assetOut, borrowOut, 2, 0, address(this));
    }

    function _swaptoken(address assetIn,address assetOut, uint256 amountIn) private returns (uint256 amountOut) {
        ISwapHandler swapHandler = ISwapHandler(_registry.getServiceFromHash(SWAP_HANDLER));                                   
        ERC20(assetIn).approve(address(swapHandler), amountIn);
        ISwapHandler.SwapParams memory params = ISwapHandler.SwapParams(
                assetIn,
                assetOut,
                0,
                amountIn,
                0,
                bytes("")
        );
        amountOut = swapHandler.executeSwap(params);
    }


    function totalAssets() public view returns (uint256 totalManagedAssets) {
        IPoolV3 aavePool = IPoolV3(_registry.getServiceFromHash(AAVE_V3));  
        (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 _1, uint256 _2 ,uint256 _3, uint256 _4) = aavePool.getUserAccountData(address(this));
        return totalCollateralBase - totalDebtBase;
    }

    function convertToShares(uint256 assets) external view returns (uint256 shares) {
        Rebase memory total = Rebase(_ownedCollateral, totalSupply());
        shares = total.toBase(assets, false);
    }

    function convertToAssets(uint256 shares) external view returns (uint256 assets) {
        Rebase memory total = Rebase(_ownedCollateral, totalSupply());
        assets = total.toElastic(shares, false);
    }

    
    function maxWithdraw(address owner) external view returns (uint256 maxAssets) {

    }

    function previewWithdraw(uint256 assets) external view returns (uint256 shares) {

    }

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external returns (uint256 shares) {}

}