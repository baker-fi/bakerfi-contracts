import { ContractClientLedger } from '../lib/contract-client-ledger';
import { ContractClientWallet } from '../lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../../constants/test-accounts';

export async function getClient(ethers) {
  const [signerPKey] = STAGING_ACCOUNTS_PKEYS;
  let app;
  const contractTree = await import('../../src/contract-blob.json');
  if (process.env.DEPLOY_WITH_LEDGER === 'true') {
    app = new ContractClientLedger(
      ethers.provider,
      contractTree.default,
      process.env?.BAKERFI_LEDGER_PATH ?? '',
    );
  } else {
    app = new ContractClientWallet(ethers.provider, contractTree.default, signerPKey);
  }
  await app?.init();
  return app;
}
