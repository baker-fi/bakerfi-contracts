// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Ownable2StepUpgradeable } from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import { IVaultZap } from "../interfaces/core/IVaultZap.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VaultZap is IVaultZap , Ownable2StepUpgradeable  {

  constructor() {
    _disableInitializers();
  }

  function initialize(address initialOwner) public initializer {
    __Ownable2Step_init();
    _transferOwnership(initialOwner);
  }

 function zapIn(
        IERC4626 vault,
        IERC20 inputAsset,
        uint256 inputAmount,
        address receiver
    ) external payable returns (uint256 shares) {
        return 0;
    }

    function estimateZapInShares(
        IERC4626 vault,
        IERC20 inputAsset,
        uint256 inputAmount
    ) external view returns (uint256 estimatedShares){
        return 0;
    }

     function zapOut(
        IERC4626 vault,
        uint256 vaultShares,
        IERC20 outputAsset,
        address receiver
    ) external returns (uint256 outputAmount){
        return 0;
    }


 function estimateZapOutAmount(
        address vault,
        uint256 vaultShares,
        address outputAsset
    ) external view returns (uint256 estimatedOutput){
        return 0;
    }




  uint256[50] private __gap;
}
