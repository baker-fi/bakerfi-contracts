

import {Instruction} from "../../interfaces/core/Instruction.sol";


struct LidoWrapData {
    uint256 amount;
    address receiver;
}


contract LidoWrap is Instruction {

    
    function execute(bytes calldata data, bytes8[] memory replaceArgs) external payable override {
        LidoWrapData memory inputData = parseInputs(data);       

    }

    function parseInputs(
        bytes memory _callData
    ) public pure returns (LidoWrapData memory params) {
        return abi.decode(_callData, (LidoWrapData));
    }
}