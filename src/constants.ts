/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sui Nexus - Frontend Constants
 * Package IDs, addresses, and other deployment-specific constants
 */

/**
 * Sui Nexus Move Package IDs by network
 * 
 * After deploying your Move contracts, update the packageId with your deployment ID:
 * 
 * Example deployment output:
 * ----- Transaction executed successfully. -----
 * Package ID: 0x1234567890abcdef...
 * 
 * Copy the Package ID and update the corresponding network below.
 */
export const PACKAGE_CONFIG = {
  testnet: {
    packageId: '0x0', // Replace with actual deployed package ID
    adminCap: '0x0', // Admin capability (if applicable)
    creatorAddress: '0x0', // Creator/deployer address
  },
  devnet: {
    packageId: '0x0',
    adminCap: '0x0',
    creatorAddress: '0x0',
  },
  mainnet: {
    packageId: '0x0', // For production deployment
    adminCap: '0x0',
    creatorAddress: '0x0',
  },
} as const;

/**
 * Sui Framework and standard addresses
 * These are fixed across all Sui networks
 */
export const SUI_FRAMEWORK_ADDRESSES = {
  // Sui Framework package (same on all networks)
  sui: '0x0000000000000000000000000000000000000000000000000000000000000002',
  // System package
  system: '0x0000000000000000000000000000000000000000000000000000000000000000',
  // Clock shared object (required for timestamps)
  clock: '0x0000000000000000000000000000000000000000000000000000000000000006',
} as const;

/**
 * Knowledge Graph Constants
 */
export const GRAPH_CONFIG = {
  // Maximum description length for a knowledge node
  maxDescriptionLength: 5000,
  // Maximum tags per node
  maxTags: 20,
  // Maximum references per node
  maxReferences: 50,
  // Trust score range
  trustScoreMin: 0,
  trustScoreMax: 100,
  // Initial trust score for new nodes
  initialTrustScore: 50,
  // Relationship weight range
  relationshipWeightMin: 0,
  relationshipWeightMax: 100,
  // Default relationship weight
  defaultRelationshipWeight: 50,
  // Allowed relationship types
  relationshipTypes: ['cites', 'extends', 'contradicts', 'proves', 'implements', 'references'] as const,
  // Graph visualization limits
  maxNodesDisplay: 1000,
  maxEdgesDisplay: 2000,
} as const;

/**
 * Transaction Type Constants
 */
export const TRANSACTION_TYPES = {
  CREATE_KNOWLEDGE_OBJECT: 'create_knowledge_object',
  CREATE_RELATIONSHIP: 'create_relationship',
  UPDATE_KNOWLEDGE_OBJECT: 'update_knowledge_object',
  VALIDATE_KNOWLEDGE_OBJECT: 'validate_knowledge_object',
  ADD_REFERENCE: 'add_reference',
  VOTE_ON_PROPOSAL: 'vote_on_proposal',
} as const;

/**
 * Event Types emitted by Sui Nexus contracts
 */
export const EVENT_TYPES = {
  NODE_CREATED: '0xsnexus::nexus::NodeCreated',
  NODE_UPDATED: '0xsnexus::nexus::NodeUpdated',
  EDGE_CREATED: '0xsnexus::nexus::EdgeCreated',
  VALIDATION_INITIATED: '0xsnexus::nexus::ValidationInitiated',
  VALIDATION_RESOLVED: '0xsnexus::nexus::ValidationResolved',
  WALRUS_STORED: '0xsnexus::nexus::WalrusStored',
} as const;

/**
 * Color palette for graph visualization
 */
export const GRAPH_COLORS = {
  node: {
    default: '#a45eff',
    blockchain: '#4da2ff',
    move: '#ff5e7e',
    cryptography: '#a45eff',
    identity: '#00f0ff',
    storage: '#00ffaa',
    consensus: '#ffad00',
    walrus: '#ff9f43',
  },
  edge: {
    cites: '#00f0ff',
    extends: '#4da2ff',
    contradicts: '#ff5e7e',
    proves: '#00ffaa',
    implements: '#ffad00',
    references: '#a45eff',
  },
} as const;

/**
 * Feature Flags (can be toggled per environment)
 */
export const FEATURE_FLAGS = {
  enableWalrusStorage: true,
  enableGraphViz: true,
  enableTransactionHistory: true,
  enableProposals: true,
  enableZkLogin: false, // Requires zkLogin setup
  enableAdvancedFilters: false,
} as const;

export type NetworkType = keyof typeof PACKAGE_CONFIG;
export type RelationshipType = typeof GRAPH_CONFIG.relationshipTypes[number];
