import { task } from 'hardhat/config';

const fs = require('fs');
const path = require('path');

task('build:artifactTree', 'Generate an artifact tree').setAction(
  async (taskArgs, { network, config, run }) => {
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

task(
  'build:calculateSelectors',
  'Generate function and error selectors based on the contract blob ABIs',
).setAction(async (taskArgs, { config }) => {
  const ethers = require('ethers').ethers;
  const contractBlobPath = path.join(__dirname, '..', '..', 'src', 'contract-blob.json');
  const contractBlobString = fs.readFileSync(contractBlobPath, 'utf8');
  const contractBlob = JSON.parse(contractBlobString);
  const output = {};

  for (const contractName in contractBlob) {
    output[contractName] = { functions: [], errors: [] };

    const functionOrErrorABIs = contractBlob[contractName].abi.filter(
      (input) => input.type == 'function' || input.type == 'error',
    );

    for (const abi of functionOrErrorABIs) {
      // signature
      const paramsTypes = abi.inputs.map((input) => input.type);
      const paramTypesString = paramsTypes.join(',');

      const signature = `${abi.name}(${paramTypesString})`;

      // calculate selector
      const id = ethers.id(signature);
      const selector = id.slice(0, 10); // 0x + first 4 bytes

      // add to object
      const outputObject = {
        name: abi.name,
        signature: signature,
        selector: selector,
      };
      if (abi.type == 'error') {
        output[contractName].errors.push(outputObject);
      } else if (abi.type == 'function') {
        output[contractName].functions.push(outputObject);
      }
    }
  }

  // Output the result to a JSON file
  const outputPath = path.join(__dirname, '..', '..', 'src', 'contract-selectors.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Contracts selectors exported to ${outputPath}`);
});
