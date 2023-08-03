// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";

/**
* Landromat is powerfull catalyst that deposits an asset 
* - 
* - List of Treasury Managers
* - Permit ERC20 Token 
*/
contract LaundromatVault is Ownable, Pausable, ERC20 {
        
    using SafeMath for uint256;
    using RebaseLibrary for Rebase;

    uint256 constant MAX_PERCENT = 10000;
    uint256 public    _minWithDrawalTime = 3 days;
    uint256 private   _harvestFee = 1000;
    int256  private   _pendingAmount; 
    uint256 private   _deployedAmount;
    uint256 private   _lastBlockDeploy;
    uint256 private   _collateralTotal;
    
    // Yield Farming Contract to Generate Return;
    IStrategy private _strategy;
    
    event Deposit(address indexed owner, address indexed receiver, uint256 amount, uint256 shares);
    event WithdrawRequest(address indexed owner,address indexed receiver,  uint256 amount, uint256 shares);
    event WithdrawClaim(address indexed owner, uint256 amount);
    event LogStrategyProfit(uint256 amount);
    event LogStrategyLoss(uint256 amount);
    event LogStrategyInvest(uint256 amount);
    event LogStrategyDivest(uint256 amount);

    struct PendingWithdrawal {
        uint256 amount;
        uint256 availableOn;
    }

    mapping(address=> PendingWithdrawal[]) private _pendingWithdrawals;

    modifier allowedOwner(address owner) {
        require(owner == msg.sender, "Vault: Invalid Owner");
        require(owner != address(0), "Vault: Invalid Owner");
        _;
    }
    
    constructor(
           address owner,
           string memory name,
           string memory symbol,
           IStrategy strategy
    ) 
           ERC20(name, symbol)
    {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
        _pendingAmount = 0;
        _deployedAmount = 0;
        _collateralTotal = 0;
        _strategy = strategy;
    }

    function collateral() public view returns (uint256) {
        return _collateralTotal;
    }

    function getPendingBalance() public view returns(int256) {
        return _pendingAmount;
    }

    function getDeployedBalance() public view returns(uint256) {
        return _deployedAmount;
    }

    /**
     * Deposit ETH and receive X Shares on exchange, the balance starts on pending state 
     * and waits to deployed once it is activated by the treasuryManager
     * @param receiver The Shares Owner
     */
    function deposit(address receiver) external payable returns (uint256 shares) {   
        require(msg.value != 0, "ZERO_DEPOSIT");     
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        shares = total.toBase(msg.value, false);
        _mint(receiver, shares);
        _collateralTotal = total.elastic.add(msg.value);
        _pendingAmount+= int256(msg.value);
        emit Deposit(msg.sender, receiver, msg.value, shares);
    }

    /**
     * Withdrawal Request shares and set the receiving of the underlying asset
     * @param shares The Shares that you want to withdraw
     * @param receiver the Receiver
     */
    function withdrawalRequest(
        uint256 shares,
        address receiver
        ) external  returns (uint256 amount) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        amount = total.toElastic(shares, false);
    
        _burn(msg.sender, shares);
        _pendingWithdrawals[receiver].push(
            PendingWithdrawal(amount,  block.timestamp.add(_minWithDrawalTime)) 
         );
        _pendingAmount-= int256(amount);
        _collateralTotal -= amount;
        emit WithdrawRequest(msg.sender, receiver, amount, shares);
    }


    function convertToShares(
        uint256 assets
    ) external view  returns (uint256 shares) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        shares = total.toBase(assets, false);
    }

    function convertToEth(
        uint256 shares
    ) external view  returns (uint256 assets) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        assets = total.toElastic(shares, false);
    }


    function getPendingWithdrawals(address owner) public view returns (PendingWithdrawal[] memory) {
        return _pendingWithdrawals[owner];
    }

    function withdrawalClaim(uint8 index) external payable returns (uint256 amount) {   
        PendingWithdrawal[] memory pendings = getPendingWithdrawals(msg.sender);     
        require(pendings.length != 0, "No Pending Witdrawal");    
        require(pendings[index].amount > 0, "Not available yer");                        
        require(pendings[index].availableOn < block.timestamp, "Not available yer");                
        (bool success, ) = msg.sender.call{value: amount}("");
        amount = pendings[index].amount;
        pendings[index].amount = 0;
        pendings[index].availableOn = 0;        
        require(success, "Failed to send ETH.");
        emit WithdrawClaim(msg.sender, amount);
    }

    /**
     * Harvest any farming generated
     * 
     * TODO: Take Profit
     */
    function harvest() public onlyOwner{
        int256 balanceChange = _strategy.harvest(_deployedAmount, msg.sender);
        if (balanceChange != 0 ) {
           if(balanceChange > 0) {
                uint256 add = uint256(balanceChange);
                Rebase memory total = Rebase(_collateralTotal, totalSupply());
                _collateralTotal = total.elastic.add(add);
                emit LogStrategyProfit(add);
           } else if (balanceChange < 0) {
                uint256 sub = uint256(-balanceChange);
                _collateralTotal = _collateralTotal.sub(sub);
                _deployedAmount = _deployedAmount.sub(sub);
                emit LogStrategyLoss(sub);
           }
        }      
    }

    /**
     * Deploy ETH if there is ETH Queue to be generated
     */
    function deploy() public onlyOwner {
        require(_pendingAmount!=0, "No Deployment Required");
        if (_pendingAmount > 0) {             
            _deployedAmount = _deployedAmount.add(uint256(_pendingAmount));
            // Send ETH To Strategy
             (bool success, ) = address(_strategy).call{value: uint256(_pendingAmount)}("");
            require(success, "Failed to send ETH.");
            _strategy.deploy(uint256(_pendingAmount));             
            emit LogStrategyDivest(uint256(_pendingAmount));
        } 
        else if (_pendingAmount < 0) {
            // Expect to Receive ETH 
            _strategy.withdraw(uint256(-_pendingAmount)); 
            _deployedAmount = _deployedAmount.sub(uint256(-_pendingAmount));
            emit LogStrategyDivest(uint256(-_pendingAmount));
        }
        _lastBlockDeploy = block.timestamp;
    }
}