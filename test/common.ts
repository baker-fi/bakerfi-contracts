export const describeif = (condition) => (condition ? describe : describe.skip);
export const itif = (condition) => (condition ? it : it.skip);

/**
 * Vault Router Command Actions
 * Hexadecimal identifiers for various vault operations and token management functions
 */
export const VAULT_ROUTER_COMMAND_ACTIONS = {
  // Uniswap V3 Operations
  V3_UNISWAP_SWAP: 0x01, // Execute a token swap using Uniswap V3

  // Basic Token Operations
  PULL_TOKEN: 0x02, // Transfer tokens from user to the vault
  PULL_TOKEN_FROM: 0x03, // Transfer tokens from a specified address to the vault
  PUSH_TOKEN: 0x04, // Transfer tokens from the vault to a specified address
  PUSH_TOKEN_FROM: 0x05, // Transfer tokens from one address to another through the vault
  SWEEP_TOKENS: 0x06, // Collect and transfer all tokens of a specific type from the vault

  // ETH Wrapper Operations
  WRAP_ETH: 0x07, // Convert ETH to WETH
  UNWRAP_ETH: 0x08, // Convert WETH back to ETH

  // Native Token Operations
  SEND_NATIVE: 0x0a, // Send native tokens to a specified address
  SWEEP_NATIVE: 0x0b, // Sweep native tokens from the vault

  // ERC4626 Vault Operations
  ERC4626_VAULT_DEPOSIT: 0x10, // Deposit assets into an ERC4626 vault
  ERC4626_VAULT_MINT: 0x11, // Mint vault shares by depositing assets
  ERC4626_VAULT_REDEEM: 0x12, // Redeem vault shares for assets
  ERC4626_VAULT_WITHDRAW: 0x13, // Withdraw assets from the vault

  // ERC4626 Conversion Operations
  ERC4626_VAULT_CONVERT_TO_SHARES: 0x14, // Calculate shares for a given amount of assets
  ERC4626_VAULT_CONVERT_TO_ASSETS: 0x15, // Calculate assets for a given amount of shares
} as const;

export const VaultRouterABI = [
  'function pullToken(address, uint256)',
  'function pullTokenFrom(address, address, uint256)',
  'function pushToken(address, address, uint256)',
  'function pushTokenFrom(address, address, address, uint256)',
  'function sweepTokens(address, address)',
  'function sweepNative(address)',
  'function wrapETH(uint256)',
  'function unwrapETH(uint256)',
  'function swap((address,address,uint8,uint256,uint256,bytes))',
  'function depositVault(address, uint256, address, uint256)',
  'function mintVault(address, uint256, address, uint256)',
  'function redeemVault(address, uint256, address, uint256)',
  'function withdrawVault(address, uint256, address, uint256)',
  'function convertToVaultShares(address, uint256)',
  'function convertToVaultAssets(address, uint256)',
  'function sendNative(address, uint256)',
];
