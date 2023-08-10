
import { ethers } from "hardhat";

export async function deployBaseServices(owner: string) {
    
    const erc20 = await deployMockERC20(owner);

    const serviceRegistry = await deployServiceRegistry(owner);

    const weth = await deployWETH();

    await serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("WETH")),
        await weth.getAddress()
    );

    return {erc20, weth, serviceRegistry };
}

export async function deployWETH(){

    const WETH = await ethers.getContractFactory("WETH");     
    const weth = await WETH.deploy();       
    await weth.waitForDeployment();
    return weth; 
}

export async function deployMockERC20(owner: string){

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const ERC20_MAX_SUPPLY = ethers.parseUnits("10000000", 18);
    const MOCK_TOKEN_NAME = "Mock ERC20";
    const MOCK_TOKEN_SYMBOL = "MTOKEN";        
    const erc20 = await ERC20Mock.deploy(
        MOCK_TOKEN_NAME,
        MOCK_TOKEN_SYMBOL, 
        ERC20_MAX_SUPPLY, 
        owner
    );       
    await erc20.waitForDeployment();
    return erc20; 
}


export async function deployVault(owner: string, serviceRegistry: string, levarage: string) {
    const Vault = await ethers.getContractFactory("LaundromatVault", {
        libraries: {
            Leverage: levarage,
        }
    });
    const vault = await Vault.deploy(owner, serviceRegistry);        
    await vault.waitForDeployment();
    return vault;
}

export async function deployServiceRegistry(owner: string) {
    const ServiceRegistry = await ethers.getContractFactory("ServiceRegistry");
    const serviceRegistry = await ServiceRegistry.deploy(
        owner
    );        
    await serviceRegistry.waitForDeployment();
    return serviceRegistry;
}