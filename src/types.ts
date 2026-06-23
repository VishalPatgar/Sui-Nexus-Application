/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Node structure
export interface KnowledgeNode {
  id: string; // Sui Object ID (0x...)
  name: string;
  description: string;
  tags: string[];
  owner: string; // Address of owner
  createdAt: number;
  updatedAt: number;
  version: number;
  trustScore: number; // 0-100 based on validation
  references: string[];
  color?: string; // Metadata for rendering
  size?: number; // Metadata size
  // Dynamic fields simulator
  dynamicFields?: Record<string, any>;
  // Walrus Integration (Sui Overflow 2026 - Walrus Track)
  walrusBlobId?: string;
}

// Edge structure
export interface RelationshipEdge {
  id: string; // Relationship Object ID (0x...)
  source: string; // from_object ID
  target: string; // to_object ID
  relationshipType: string; // "cites" | "extends" | "contradicts" | "proves" | "implements"
  weight: number; // 0-100 strength
  createdBy: string;
  createdAt: number;
  color?: string;
}

// Dynamic ledger transaction history
export interface SuiTx {
  digest: string;
  sender: string;
  timestamp: number;
  kind: 'create_knowledge_object' | 'create_relationship' | 'update_knowledge_object' | 'validate_knowledge_object' | 'add_reference';
  gasUsed: number; // in SUI
  status: 'success' | 'failure';
  errorMessage?: string;
  changedObjectId: string;
  events: Array<{
    type: string;
    data: any;
  }>;
}

// User credentials & authentication state
export interface UserWallet {
  address: string;
  walletName: string;
  balanceSui: number;
  balanceNexus: number; // Reward tokens
  zkProvider?: 'google' | 'github' | null;
  zkUsername?: string;
  connected: boolean;
}

// DAO proposals structure
export interface DaoProposal {
  id: string;
  title: string;
  description: string;
  type: 'dispute' | 'parameter' | 'bounty';
  status: 'active' | 'passed' | 'defeated';
  creator: string;
  votesFor: number;
  votesAgainst: number;
  reward: number;
  createdAt: number;
  votedAddresses: string[];
}
