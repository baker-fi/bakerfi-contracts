// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {IWETH} from "../interfaces/tokens/IWETH.sol";
import {IPoolV3} from "../interfaces/aave/v3/IPoolV3.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import {WETH_CONTRACT, AAVE_V3, FLASH_LENDER, SWAP_HANDLER, ST_ETH_CONTRACT} from "./Constants.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {Leverage} from "../libraries/Leverage.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


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
    bytes32 constant SUCCESS_MESSAGE = keccak256("Success");
    
    ServiceRegistry public immutable    _registry;
    uint256 private                     _ownedCollateral;
    uint256 public immutable LOAN_TO_VALUE = 50000;
    
    event Deposit(address owner, address receiver, uint256 amount, uint256 shares);
   
    constructor( address owner, ServiceRegistry registry) 
        ERC20(NAME, SYMBOl) 
    {
        require(owner != address(0), "Invalid Owner Address");    
        _transferOwnership(owner);
        _registry = registry;
        _ownedCollateral = 0;
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
        IWETH weth = IWETH(_registry.getServiceFromHash(WETH_CONTRACT));       
        require(token == address(weth), "Invalid Tokens");
        FlashLoanData memory data =  abi.decode(callData, (FlashLoanData));        
        // Swap Total For stETH
        
        ISwapHandler swapHandler = ISwapHandler(_registry.getServiceFromHash(SWAP_HANDLER));               
        address stETH =_registry.getServiceFromHash(ST_ETH_CONTRACT);       

        ISwapHandler.SwapParams memory params = ISwapHandler.SwapParams(
                address(weth),
                stETH,
                0,
                data.originalAmount + amount,
                0,
                bytes("")
        );

        uint256 amountOut = swapHandler.executeSwap(params);
        uint256 amountToPayBack =  amount + fee;

        IPoolV3 aavePool = IPoolV3(_registry.getServiceFromHash(AAVE_V3));   
        aavePool.deposit(stETH, amountOut, address(this), 0);
        aavePool.borrow(address(weth), amountToPayBack ,  2, 0, address(this));
        Rebase memory total = Rebase(_ownedCollateral, totalSupply());        
        
        uint256 shares = total.toBase(amountOut, false);

        _mint(data.receiver, shares);                 
        _ownedCollateral = total.elastic.add(amountOut);

       //emit Deposit(initiator, data.receiver, data.originalAmount, shares);

        return SUCCESS_MESSAGE;
    }


    function totalAssets() external view returns (uint256 totalManagedAssets) {}

    function convertToShares(uint256 assets) external view returns (uint256 shares) {
        Rebase memory total = Rebase(_ownedCollateral, totalSupply());
        shares = total.toBase(assets, false);
    }

    function convertToAssets(uint256 shares) external view returns (uint256 assets) {
        Rebase memory total = Rebase(_ownedCollateral, totalSupply());
        assets = total.toElastic(shares, false);
    }

    function maxDeposit(address receiver) external view returns (uint256 maxAssets) {
        
    }

    function previewDeposit(uint256 assets) external view returns (uint256 shares) {}

    function maxMint(address receiver) external view returns (uint256 maxShares) {}

    function previewMint(uint256 shares) external view returns (uint256 assets) {}

    function mint(uint256 shares, address receiver) external payable returns (uint256 assets) {}

    function maxWithdraw(address owner) external view returns (uint256 maxAssets) {}

    function previewWithdraw(uint256 assets) external view returns (uint256 shares) {}

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external returns (uint256 shares) {}

    function maxRedeem(address owner) external view returns (uint256 maxShares) {}

    function previewRedeem(uint256 shares) external view returns (uint256 assets) {}

    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) external returns (uint256 assets) {}
}