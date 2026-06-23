/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sui Nexus - Server Configuration
 * Centralized backend configuration for Sui network, API, and storage
 */

export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
};

export const SUI_CONFIG = {
  network: (process.env.VITE_NETWORK || 'testnet') as 'testnet' | 'devnet' | 'mainnet',
  // Network endpoints
  endpoints: {
    testnet: 'https://fullnode.testnet.sui.io:443',
    devnet: 'https://fullnode.devnet.sui.io:443',
    mainnet: 'https://fullnode.mainnet.sui.io:443',
  },
  // Faucet endpoints
  faucets: {
    testnet: 'https://faucet.testnet.sui.io/gas',
    devnet: 'https://faucet.devnet.sui.io/gas',
  },
  // Default gas budget for transactions (in MIST)
  defaultGasBudget: 200_000_000, // 0.2 SUI
  defaultGasPrice: 1000, // 1000 MIST per unit
};

export const WALRUS_CONFIG = {
  network: 'testnet' as const,
  publisherUrl: process.env.VITE_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space/v1/store',
  aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
  defaultEpochs: parseInt(process.env.VITE_WALRUS_EPOCHS || '5'),
  // Retry configuration for Walrus operations
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
  },
};

export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL || 'file:./dev.db',
};

export const API_CONFIG = {
  // CORS configuration
  cors: {
    origin: process.env.APP_URL || 'http://localhost:5173',
    credentials: true,
  },
  // Request timeout (ms)
  requestTimeout: 30000,
  // Max request body size
  maxBodySize: '10mb',
};

// Helper function to get current network endpoint
export function getNetworkEndpoint(): string {
  return SUI_CONFIG.endpoints[SUI_CONFIG.network];
}

// Helper function to get current faucet endpoint
export function getFaucetEndpoint(): string | null {
  return SUI_CONFIG.faucets[SUI_CONFIG.network as keyof typeof SUI_CONFIG.faucets] || null;
}

// Logging configuration
export const LOG_CONFIG = {
  // Enable detailed transaction logging
  logTransactions: true,
  // Enable Walrus operation logging
  logWalrus: true,
  // Log database operations
  logDatabase: process.env.NODE_ENV === 'development',
};
