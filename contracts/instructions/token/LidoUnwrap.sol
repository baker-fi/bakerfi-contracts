import {Instruction} from "../../interfaces/core/Instruction.sol";

struct LidoUnWrapData {
    uint256 amount;
    address receiver;
}


contract LidoUnWrap is Instruction {

    
    function execute(bytes calldata data) external payable override {
        LidoUnWrapData memory inputData = parseInputs(data);       

    }

    function parseInputs(
        bytes memory _callData
    ) public pure returns (LidoUnWrapData memory params) {
        return abi.decode(_callData, (LidoUnWrapData));
    }
}