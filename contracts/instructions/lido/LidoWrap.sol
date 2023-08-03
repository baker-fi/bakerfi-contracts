
import {Instruction} from "../../interfaces/core/Instruction.sol";
import {Read, Stack, UseStack} from "../../core/Stack.sol";

struct LidoWrapData {
    uint256 amount;
    address receiver;
}

contract LidoWrap is Instruction, UseStack {
    
    constructor(address registry) UseStack(registry) {}
    
    function run(bytes calldata data, uint8[] memory replaceArgs) external payable override {
        LidoWrapData memory inputData = parseInputs(data);       
    }

    function parseInputs(
        bytes memory _callData
    ) public pure returns (LidoWrapData memory params) {
        return abi.decode(_callData, (LidoWrapData));
    }
}