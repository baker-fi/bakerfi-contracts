import { task } from 'hardhat/config';

const fs = require('fs');
const path = require('path');

task('build:artifactTree', 'Generate an artifact tree').setAction(
  async (taskArgs, { ethers, network, config, run }) => {
    await run('compile');
    // Ensure the contracts are compiled
    const artifactsPath = config.paths.artifacts;
    const contractsPath = config.paths.sources;
    const output = {};
    // Read the contracts directory
    const contractFiles = fs.readdirSync(contractsPath, { recursive: true });
    for (const file of contractFiles) {
      if (file.endsWith('.sol') && !file.includes('Mock')) {
        const contractName = path.basename(file).replace('.sol', '');
        const artifactPath = path.join(artifactsPath, 'contracts', file, `${contractName}.json`);
        if (fs.existsSync(artifactPath)) {
          const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
          output[contractName] = {
            abi: artifact.abi,
            bytecode: artifact.bytecode,
          };
        }
      }
    }
    // Output the result to a JSON file
    const outputPath = path.join(__dirname, '..', '..', 'src', 'contract-blob.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Contracts info exported to ${outputPath}`);
  },
);
