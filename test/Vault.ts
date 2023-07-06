import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";

describe("Vault", function () {


    async function deployVault() {
        const [owner, otherAccount, anotherAccount] = await ethers.getSigners();

        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        const Vault = await ethers.getContractFactory("Vault");
        // Mock Token has 10M of Supply
        const ERC20_MAX_SUPPLY = ethers.parseUnits("10000000", 18);
        const MOCK_TOKEN_NAME = "Mock ERC20";
        const MOCK_TOKEN_SYMBOL = "MTOKEN";        
        const VAULT_TOKEN_NAME = "xMock ERC20";
        const VAULT_TOKEN_SYMBOL = "xMTOKEN";        
        const erc20 = await ERC20Mock.deploy(
            MOCK_TOKEN_NAME,
            MOCK_TOKEN_SYMBOL, 
            ERC20_MAX_SUPPLY, 
            owner.address 
        );        
        // Transfer 100K of MTOKENS to Other Account
        await erc20.transfer(otherAccount.address, ethers.parseUnits("100000", 18));
        // Transfer 100K of MTOKENS to Another Account        
        await erc20.transfer(anotherAccount.address, ethers.parseUnits("100000", 18));

        const vault = await Vault.deploy(
            await erc20.getAddress(), 
            owner.address, 
            VAULT_TOKEN_NAME, 
            VAULT_TOKEN_SYMBOL
        );
        return { vault, owner, otherAccount, anotherAccount,  erc20 };
    }
   
    describe("Vault Initialization", function () {
        it("The owner of the contract is provided account", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.owner()).to.equal(owner.address);
        });
        it("The Token name", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.name()).to.equal("xMock ERC20");
        });

        it("The symbol name", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.symbol()).to.equal("xMTOKEN");
        });

        it("The total supply", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.totalSupply()).to.equal(0);
        });
    });

});