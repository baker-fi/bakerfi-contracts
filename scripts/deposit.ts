import { ethers } from 'hardhat';

async function main() {
  const [owner] = await ethers.getSigners();
  const Vault = await ethers.getContractFactory('Vault');
  const vault = await ethers.getContractAt('Vault', '0xE8A1e868E4736669b73B9E26BE22129bD6B4E83d');
  await vault.deposit(owner.address, { value: ethers.parseUnits('100', 18) });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
