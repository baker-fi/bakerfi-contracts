
import {ServiceRegistry} from "./ServiceRegistry.sol";
import {
    WETH_CONTRACT, 
    WSTETH_ETH_ORACLE, 
    AAVE_V3, 
    FLASH_LENDER, 
    SWAP_HANDLER, 
    ST_ETH_CONTRACT, 
    WST_ETH_CONTRACT
} from "./Constants.sol";
import {IWETH} from "../interfaces/tokens/IWETH.sol";
import {IServiceRegistry} from "../interfaces/core/IServiceRegistry.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IPoolV3} from "../interfaces/aave/v3/IPoolV3.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract UseServiceRegistry {
    
    ServiceRegistry private immutable _registry;    

    constructor(ServiceRegistry registry) {
      _registry = registry;
    }
    function registerSvc() internal view returns (IServiceRegistry) {
      return _registry;
    }
}



abstract contract UseWETH {
  

  IWETH immutable _wETH;

  constructor(ServiceRegistry registry) {
    _wETH = IWETH(registry.getServiceFromHash(WETH_CONTRACT));
  }

  function wETH() internal view returns (IWETH) {
    return _wETH;
  }
  
  function wETHA() internal view returns (address) {
    return address(_wETH);
  }
}

abstract contract UseStETH {
  
  IERC20 immutable _stETH;

  constructor(ServiceRegistry registry) {
    _stETH = IERC20(registry.getServiceFromHash(ST_ETH_CONTRACT));
  }

  function stETH() internal view returns (IERC20) {
    return _stETH;
  }
  
  function stETHA() internal view returns (address) {
    return address(_stETH);
  }
}

abstract contract UseWstETH {
  
  IWStETH immutable _wstETH;

  constructor(ServiceRegistry registry) {
    _wstETH = IWStETH(registry.getServiceFromHash(WST_ETH_CONTRACT));
  }

  function wstETH() internal view returns (IWStETH) {
    return _wstETH;
  }
  function wstETHA() internal view returns (address) {
    return address(_wstETH);
  }
}


abstract contract UseAAVEv3 {
  
  IPoolV3 immutable _aavev3;

  constructor(ServiceRegistry registry) {
    _aavev3 = IPoolV3(registry.getServiceFromHash(AAVE_V3));
  }

  function aaveV3() internal view returns (IPoolV3) {
    return _aavev3;
  }

  function aaveV3A() internal view returns (address) {
    return address(_aavev3);
  }
}
