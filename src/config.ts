/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sui Nexus - Network Configuration
 * Centralized configuration for all Sui network endpoints and settings
 */

export const NETWORK_CONFIG = {
  devnet: {
    name: 'Devnet',
    url: 'https://fullnode.devnet.sui.io:443',
    faucetUrl: 'https://faucet.devnet.sui.io/gas',
  },
  testnet: {
    name: 'Testnet',
    url: 'https://fullnode.testnet.sui.io:443',
    faucetUrl: 'https://faucet.testnet.sui.io/gas',
  },
  mainnet: {
    name: 'Mainnet',
    url: 'https://fullnode.mainnet.sui.io:443',
    faucetUrl: null,
  },
} as const;

export const DEFAULT_NETWORK = 'testnet' as const;

export const WALRUS_CONFIG = {
  testnet: {
    name: 'Walrus Testnet',
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space/v1/store',
    aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
    defaultEpochs: 5,
  },
} as const;

export const API_CONFIG = {
  backend: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 30000,
  },
  indexer: {
    pollIntervalMs: 5000,
    maxRetries: 3,
  },
} as const;

export type NetworkType = keyof typeof NETWORK_CONFIG;
export type WalrusNetworkType = keyof typeof WALRUS_CONFIG;
