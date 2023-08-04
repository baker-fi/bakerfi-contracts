
import { ethers } from "hardhat";

export async function deployBaseServices(owner: string) {
    
    const erc20 = await deployMockERC20(owner);

    const proxyFactory = await deployDSProxyFactory();
    const proxyFactoryAddress = await proxyFactory.getAddress();

    const proxyRegistry = await deployDSProxyRegistry(proxyFactoryAddress);
    await proxyRegistry.build();

    const serviceRegistry = await deployServiceRegistry(owner);

    const stack = await deployStackService(
        owner
    );
    const stackAddress = await stack.getAddress();

    await serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("StackService")),
        stackAddress
    );
    return {erc20, proxyRegistry, proxyFactory, stack, serviceRegistry };
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


export async function deployDSProxyFactory() {
    const DSProxyFactory = await ethers.getContractFactory("DSProxyFactory");
    const proxyFactory = await DSProxyFactory.deploy();        
    await proxyFactory.waitForDeployment();
    return proxyFactory;
}



export async function deployDSProxyRegistry(proxyFactoryAddress:  string) {
    const DSProxyRegistry = await ethers.getContractFactory("DSProxyRegistry");
    const proxyRegistry = await DSProxyRegistry.deploy(proxyFactoryAddress);
    await proxyRegistry.waitForDeployment();
    return proxyRegistry;
}


export async function deployServiceRegistry(owner: string) {
    const ServiceRegistry = await ethers.getContractFactory("ServiceRegistry");
    const serviceRegistry = await ServiceRegistry.deploy(
        owner
    );        
    await serviceRegistry.waitForDeployment();
    return serviceRegistry;
}

export async function deployStackService(serviceRegistry: string) {
    const Stack = await ethers.getContractFactory("Stack");
    const stack = await Stack.deploy(
        serviceRegistry
    );     
    await stack.waitForDeployment();
    return stack;
}

export async function deploySetApproval(serviceRegistry: string) {
    const SetApproval = await ethers.getContractFactory("SetApproval");
    const setApproval = await SetApproval.deploy(
        serviceRegistry
    );     
    await setApproval.waitForDeployment();
    return setApproval;
}

export async function deployAction(contractName: string, serviceRegistry: string) {
    const factory = await ethers.getContractFactory(contractName);
    const contract = await factory.deploy(
        serviceRegistry
    );     
    await contract.waitForDeployment();
    return contract;
}