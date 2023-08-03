// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ServiceRegistry} from "./ServiceRegistry.sol";
import {Lock} from "./Lock.sol";
import { STACK_SERVICE } from "./Constants.sol";

contract Stack is Lock {
    
    ServiceRegistry internal immutable   _registry;
    address private                      _initiator;
    bytes32[] public                     _intructions;
    mapping(address => bytes32[]) public _returnValues;
    address[] public                     _valuesHolders;

    constructor(ServiceRegistry registry) {
        _registry = registry;
    }

    function setInitiator(address initiator) external {
        _initiator = initiator;
    }

    function setInstructions(bytes32[] memory actions) external {
        _intructions = actions;
    }

    function push(bytes32 value) external {
        address who = msg.sender;
        if (_returnValues[who].length == 0) {
            _valuesHolders.push(who);
        }
        _returnValues[who].push(value);
    }

    function at(uint256 index, address who) external view returns (bytes32) {
        return _returnValues[who][index];
    }

    function len(address who) external view returns (uint256) {
        return _returnValues[who].length;
    }

    /**
     * @dev Clears storage in preparation for the next Operation
     */
    function clearStorage() external {
        delete _intructions;
        for (uint256 i = 0; i < _valuesHolders.length; i++) {
            delete _returnValues[_valuesHolders[i]];
        }
        delete _valuesHolders;
    }
}

contract UseStack {
    ServiceRegistry internal immutable _registry;

    constructor(address registry) {
        _registry = ServiceRegistry(registry);
    }

    function stack() internal view returns (Stack) {
        return
            Stack(
                _registry.getServiceFromHash(STACK_SERVICE)
            );
    }
}


library Read {
  function read(
    Stack _stack,
    bytes32 param,
    uint256 paramMapping,
    address who
  ) internal view returns (bytes32) {
    if (paramMapping > 0) {
      return _stack.at(paramMapping - 1, who);
    }

    return param;
  }

  function readUint(
    Stack _stack,
    bytes32 param,
    uint256 paramMapping,
    address who
  ) internal view returns (uint256) {
    return uint256(read(_stack, param, paramMapping, who));
  }
}

library Write {
  function write(Stack _storage, bytes32 value) internal {
    _storage.push(value);
  }
}