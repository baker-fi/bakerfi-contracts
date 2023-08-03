// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

contract Lock {
    
    bool private _locked = false;
    address private _whoLocked;

    function lock() external {
        _locked = true;
        _whoLocked = msg.sender;
    }

    function unlock() external {
        require(_whoLocked == msg.sender, "Only the locker can unlock");
        require(_locked, "Not locked");
        _locked = false;
        _whoLocked = address(0);
  }

  function isLocked() public view returns (bool){
    return _locked;
  }

  function whoLocked()public view returns (address) { 
    return _whoLocked;
  }
}
