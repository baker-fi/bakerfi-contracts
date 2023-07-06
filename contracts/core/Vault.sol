
// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IVault} from "../interfaces/core/IVault.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract Vault is ERC20, IVault, Ownable, Pausable, ReentrancyGuard {
     
    event Deposit(address indexed from, address indexed to, uint256 amount, uint256 share);
    event Withdraw(address indexed from, address indexed to, uint256 amount, uint256 share);
    
    using SafeMath for uint256;
    using RebaseLibrary for Rebase;

    IERC20  private             _asset;
    uint256 private             _collateralTotal;
    uint256 private immutable   MINIMUM_SHARE_BALANCE = 1000; // To prevent the ratio going off
    
    constructor(
        address asset, 
        address owner, 
        string memory name, 
        string memory symbol
    ) ERC20(name, symbol) Ownable() Pausable() ReentrancyGuard() {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
        _asset = ERC20(asset);
    }

    function collateral() public view returns(uint256) {
        return _collateralTotal;
    }


    function deposit(address from, address to, uint256 amount, uint256 share) external returns (uint256 amountOut, uint256 shareOut){
        require(to != address(0), "BentoBox: to not set"); // To avoid a bad UI from burning funds
        require(from != address(this) , "Deposit from the vault");        
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        if (share == 0) {
            // value of the share may be lower than the amount due to rounding, that's ok
            share = total.toBase(amount, false);
            // Any deposit should lead to at least the minimum share balance, otherwise it's ignored (no amount taken)
            if (total.base.add(share) < MINIMUM_SHARE_BALANCE) {
                return (0, 0);
            }
        } else {
            // amount may be lower than the value of share due to rounding, in that case, add 1 to amount (Always round up)
            amount = total.toElastic(share, true);
        }
        _mint(to, share);
        _collateralTotal = total.elastic.add(amount);        
        _asset.transferFrom(from, address(this), amount);        
        emit Deposit(from, to, amount, share);
        // Amount of Tokens Deposited
        amountOut = amount;
        // Ammount of Tokens Minted
        shareOut = share;
    }

    function toAmount(uint256 share, bool roundUp) external view returns (uint256 amount) {
        Rebase memory total = Rebase(_collateralTotal, totalSupply());
        amount = total.toElastic(share, roundUp);
    }
    
    function toShare(uint256 amount, bool roundUp) external view returns (uint256 share) {
         Rebase memory total = Rebase(_collateralTotal, totalSupply());
         share = total.toBase(amount, roundUp);
    }

    function withdraw(address from, address to, uint256 amount, uint256 share) external returns (uint256 amountOut, uint256 shareOut) {
        require(to != address(0), "Vault: to not set"); // To avoid a bad UI from burning funds
        Rebase memory total = Rebase(_collateralTotal, totalSupply());        
        if (share == 0) {
            // value of the share paid could be lower than the amount paid due to rounding, in that case, add a share (Always round up)
            share = total.toBase(amount, true);
        } else {
            // amount may be lower than the value of share due to rounding, that's ok
            amount = total.toElastic(share, false);
        }
        _burn(from, share);
        _collateralTotal = total.elastic.sub(amount);
        require(total.base >= MINIMUM_SHARE_BALANCE || total.base == 0, "Vault: cannot empty");
        _asset.transfer(to, amount);        
        emit Withdraw(from, to, amount, share);
        amountOut = amount;
        shareOut = share;
    }

}