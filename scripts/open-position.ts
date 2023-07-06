import { Web3Connection, Model, ERC20 } from "@taikai/dappkit";
import * as PoolV3Artifact from '@aave/core-v3/artifacts/contracts/protocol/pool/Pool.sol/Pool.json';


async function main(){

    const AAVE_POOL_ADDRESS = "0xE7EC1B0015eb2ADEedb1B7f9F1Ce82F9DAD6dF08";
    const USDC_ADDRESS = "0xda9d4f9b69ac6c22e444ed9af0cfc043b7a7f53f";
    const USDT_ADDRESS = "0x0Bd5F04B456ab34a2aB3e9d556Fe5b3A41A0BC8D";

    const web3Connection = new Web3Connection({
        web3Host: "https://gateway.tenderly.co/public/sepolia",
        debug: false,
        privateKey: "9c6bae349b7f1d2662ff71ff649f5d7cacb643524b2414aef52657ca81579631"
    });
    const erc20 = new ERC20(web3Connection, "0xda9d4f9b69ac6c22e444ed9af0cfc043b7a7f53f");
    await erc20.approve(AAVE_POOL_ADDRESS, "100000000");
    const aavePool = new Model(web3Connection, PoolV3Artifact.abi as any, AAVE_POOL_ADDRESS)
    await aavePool.loadAbi();
    /*console.log("Supplying ...");
    await aavePool.sendTx(aavePool.contract.methods["supply"](
        USDC_ADDRESS, 
        "100000000",
        "0xbE59659aCEbDbFe4aB4EbB9f65f7D56a15ca9717",
        0
    ));   
    console.log("Borrowing ...");*/
    await aavePool.sendTx(aavePool.contract.methods["borrow"](
        USDT_ADDRESS, 
        "100000000",
        "2",
        0,
        "0xbE59659aCEbDbFe4aB4EbB9f65f7D56a15ca9717"
    ));
    
    console.log("Suplly Done");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });