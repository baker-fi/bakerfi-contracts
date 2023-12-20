// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * 
 * @title BPIE ERC-20 Token
 *
 * @author Chef Kenji <chef.kenji@layerx.xyz>
 * @author Chef Kal-EL <chef.kal-el@layerx.xyz>
 * 
 * @dev Baker Pie , the BakerFi Governance ERC-20 Token 
 * 
 * 500M Total Supply 
 * 
 * No Taxes and no Bullshit 
 */
contract BPie is ERC20, Ownable, ERC20Permit, ERC20Votes {

    string private constant _NAME = "Baker Pie";
    string private constant _SYMBOL = "BPIE";
    uint256 private immutable _MAX_SUPPLY = 500_000_000*1e18; // 500M

    constructor(address initialOwner)
        ERC20(_NAME, _SYMBOL)
        Ownable()
        ERC20Permit(_NAME)
        ERC20Votes()
    {
        _mint(initialOwner, _MAX_SUPPLY);
        transferOwnership(initialOwner);
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
