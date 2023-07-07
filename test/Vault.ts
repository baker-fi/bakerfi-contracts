
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

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
        await erc20.waitForDeployment();
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

        await vault.waitForDeployment();
     
        return { vault, owner, otherAccount, anotherAccount,  erc20 };
    }
   
    describe("Vault Basic Functions", function () {
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
        it("The total collateral", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.collateral()).to.equal(0);
        });
        it("When i Deposit 10000 Tokens the vault should emit a Deposit event", async function () {
            const { owner, vault, erc20} = await loadFixture(deployVault);
            const amountToDeposit = ethers.parseUnits("100000", 18);
            const sharesExpected = ethers.parseUnits("100000", 18);
            await erc20.approve(await vault.getAddress(), amountToDeposit);
            await expect(vault.deposit(amountToDeposit, owner.address))
                .to.emit(vault, "Deposit")
                .withArgs(owner.address, owner.address, amountToDeposit, sharesExpected)
                .changeTokenBalances(
                    erc20,
                    [owner, await vault.getAddress()],
                    [`-${amountToDeposit}`, `${amountToDeposit}`]
                );   ;   
            expect(await vault.totalAssets()).to.equals(amountToDeposit);
            expect(await vault.balanceOf(owner.address)).to.equals(amountToDeposit);
        })
        
        it("When i mint 10000 Shares the vault should emit a Deposit event", async function () {
            const { owner, vault, erc20} = await loadFixture(deployVault);
            const amountToDeposit = ethers.parseUnits("100000", 18);
            const sharesExpected = ethers.parseUnits("100000", 18);
            await erc20.approve(await vault.getAddress(), amountToDeposit);
            await expect(vault.mint(sharesExpected, owner.address))
                .to.emit(vault, "Deposit")
                .withArgs(owner.address, owner.address, amountToDeposit, sharesExpected)
                .changeTokenBalances(
                    erc20,
                    [owner, await vault.getAddress()],
                    [`-${amountToDeposit}`, `${amountToDeposit}`]
                );   
            expect(await vault.totalAssets()).to.equals(amountToDeposit);
            expect(await vault.balanceOf(owner.address)).to.equals(amountToDeposit);
        })

        it("When i Deposit 10000 Tokens and other account deposit 10000 ", async function () {
            const { owner, otherAccount, vault, erc20} = await loadFixture(deployVault);
            const amountToDepositA = ethers.parseUnits("100000", 18);
            const amountToDepositB = ethers.parseUnits("50000", 18);
            // Approve Transfers
            await erc20.approve(await vault.getAddress(), amountToDepositA);
            await erc20.connect(otherAccount).approve(await vault.getAddress(), amountToDepositB);
            // Deposit
            await vault.deposit(amountToDepositA, owner.address);
            await vault.connect(otherAccount).deposit(amountToDepositB, otherAccount.address);   
            expect(await vault.totalAssets()).to.equals(ethers.parseUnits("150000", 18));
            expect(await vault.totalSupply()).to.equals(ethers.parseUnits("150000", 18));
        })

        async function twoShareSholders() {
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
            await erc20.waitForDeployment();
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
    
            await vault.waitForDeployment();

            const amountToDepositA = ethers.parseUnits("100000", 18);
            const amountToDepositB = ethers.parseUnits("50000", 18);
            // Approve Transfers
            await erc20.approve(await vault.getAddress(), amountToDepositA);
            await erc20.connect(otherAccount).approve(await vault.getAddress(), amountToDepositB);
            // Deposit
            await vault.deposit(amountToDepositA, owner.address);
            await vault.connect(otherAccount).deposit(amountToDepositB, otherAccount.address);   
         
            return { vault, owner, otherAccount, anotherAccount,  erc20 };
        }
       

        it("When i Withdraw all shares from user1 ", async function () {
            const { owner, otherAccount, vault, erc20} = await loadFixture(twoShareSholders);
            await expect(vault.withdraw(ethers.parseUnits("100000", 18), owner.address, owner.address))
                .to.emit(vault, "Withdraw")
                .withArgs(owner.address, owner.address,owner.address, ethers.parseUnits("100000", 18), ethers.parseUnits("100000", 18));   
            expect(await vault.totalAssets()).to.equals(ethers.parseUnits("50000", 18));
            expect(await vault.totalSupply()).to.equals(ethers.parseUnits("50000", 18));
        });

        it("When i Reddem all shares from user1 ", async function () {
            const { owner, otherAccount, vault, erc20} = await loadFixture(twoShareSholders);
            await expect(vault.redeem(ethers.parseUnits("100000", 18), owner.address, owner.address))
                .to.emit(vault, "Withdraw")
                .withArgs(owner.address, owner.address,owner.address, ethers.parseUnits("100000", 18), ethers.parseUnits("100000", 18));   
            expect(await vault.totalAssets()).to.equals(ethers.parseUnits("50000", 18));
            expect(await vault.totalSupply()).to.equals(ethers.parseUnits("50000", 18));
        });
      

        
    });


});