// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Mock is ERC20, Ownable {
    
    constructor( 
        string memory name, 
        string memory symbol, 
        uint256 _cap, 
        address owner
    ) 
        ERC20(name, symbol) 
        Ownable() 
    {
        _mint(owner, _cap);
        _transferOwnership(owner);
    }
}