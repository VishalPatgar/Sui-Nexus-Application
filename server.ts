/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { KnowledgeNode, RelationshipEdge, SuiTx, DaoProposal } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory state that mimics the Sui Blockchain Ledger State
let nodes: KnowledgeNode[] = [
  {
    id: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291",
    name: "Sui Blockchain",
    description: "An open-source Layer 1 blockchain built from the ground up to make digital asset ownership fast, private, secure, and accessible to everyone.",
    tags: ["sui", "blockchain", "l1"],
    owner: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54",
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    version: 1,
    trustScore: 98,
    references: ["https://sui.io", "https://docs.sui.io"],
    color: "#4da2ff",
    size: 40,
    dynamicFields: {
      "gas_price": "1000 MIST",
      "tps_peak": "297000",
      "storage_fund": "145000000 SUI"
    }
  },
  {
    id: "0xec113b2241aa69e8b9deedea0011bb271b072c45eeef9bb701b23fcfce9c091a",
    name: "Move Programming Language",
    description: "A secure programming language for writing smart contracts, originally developed at Meta, featuring resource objects, capability-based security, and absolute bytecode verification.",
    tags: ["move", "programming", "smart_contract"],
    owner: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22",
    createdAt: Date.now() - 86400000 * 4.5,
    updatedAt: Date.now() - 86400000 * 3,
    version: 2,
    trustScore: 95,
    references: ["https://github.com/move-language/move"],
    color: "#ff5e7e",
    size: 35,
    dynamicFields: {
      "compiler_version": "v1.2",
      "verify_bytecode": "true"
    }
  },
  {
    id: "0x9ab7c10d7feeaee8ba49cbcfdfcee01fc4fcf6eeeddf6b62719114acfd9c01fb",
    name: "Zero-Knowledge Proofs",
    description: "A cryptographic protocol by which one party (proving statements) can prove to a verifying party that a statement is true, without conveying any information beyond the statement's validity.",
    tags: ["cryptography", "zk", "privacy"],
    owner: "0x3344ccffbeea0dfcc7e64de06ebcde11debcde09acfebebd30bcfeff41ac89fa",
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    version: 1,
    trustScore: 92,
    references: ["https://en.wikipedia.org/wiki/Zero-knowledge_proof"],
    color: "#a45eff",
    size: 35,
    dynamicFields: {
      "proving_system": "Groth16",
      "curve_type": "BN254"
    }
  },
  {
    id: "0x5eac111009fedda77eaecceea0af5fa8bbbdddffceeebee22d111bcfcefa102b",
    name: "zkLogin",
    description: "An on-chain credential system that enables users to access decentralized applications using web2 OAuth identity providers (Google, GitHub, Twitch) preserving absolute user privacy.",
    tags: ["sui", "identity", "auth"],
    owner: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54",
    createdAt: Date.now() - 86400000 * 3.5,
    updatedAt: Date.now() - 86400000 * 3.5,
    version: 1,
    trustScore: 94,
    references: ["https://sui.io/zklogin"],
    color: "#00f0ff",
    size: 30,
    dynamicFields: {
      "max_epoch": "230",
      "oauth_providers": ["google", "github"]
    }
  },
  {
    id: "0x11abcdf009feecc23eaaccb11a01fbcaeeef9bbbdcccee110022fa9cfa1033bb",
    name: "Dynamic Fields",
    description: "Sui capability to add arbitrary field names and values to objects on-the-fly, allowing dynamic state scaling that does not require redeploying core contract structures.",
    tags: ["sui", "dynamic", "storage"],
    owner: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22",
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    version: 1,
    trustScore: 89,
    references: ["https://docs.sui.io/concepts/object-model/dynamic-fields"],
    color: "#00ffaa",
    size: 28,
    dynamicFields: {
      "field_count": "3",
      "gas_overhead": "low"
    }
  },
  {
    id: "0x77bcaaf823ee99ffda63eeea113bbcfdddaabcccee11abcc334411fbcfce12fa",
    name: "Sui Nexus Graph",
    description: "A decentralized public utility which maps digital facts and semantic connections directly onto the Sui objects store, serving as verifiable, execution-ready knowledge context.",
    tags: ["nexus", "graph", "knowledge"],
    owner: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54",
    createdAt: Date.now() - 86400000 * 2.5,
    updatedAt: Date.now() - 86400000 * 2,
    version: 3,
    trustScore: 96,
    references: ["https://sui-nexus.com"],
    color: "#ffad00",
    size: 35,
    dynamicFields: {
      "shard_id": "0x1",
      "consensus_layer": "Sui L1 Shared Objects"
    }
  }
];

let edges: RelationshipEdge[] = [
  {
    id: "0xedge1ee77fbb9923aaccddeeaa99823fcfcee0123fcfceabcc11eebcffdeea12",
    source: "0xec113b2241aa69e8b9deedea0011bb271b072c45eeef9bb701b23fcfce9c091a", // Move
    target: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", // Sui
    relationshipType: "implements",
    weight: 95,
    createdBy: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22",
    createdAt: Date.now() - 86400000 * 4.4,
    color: "#ff5e7e"
  },
  {
    id: "0xedge2eeaa923aaccddee33ee11eebaacfcee00123fcfceabccbb992311deac2d",
    source: "0x5eac111009fedda77eaecceea0af5fa8bbbdddffceeebee22d111bcfcefa102b", // zkLogin
    target: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", // Sui
    relationshipType: "extends",
    weight: 90,
    createdBy: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54",
    createdAt: Date.now() - 86400000 * 3.4,
    color: "#00f0ff"
  },
  {
    id: "0xedge3eeab923aaccddee44ee22eebabcfcee11123fcfceabcccc883311deac3t",
    source: "0x11abcdf009feecc23eaaccb11a01fbcaeeef9bbbdcccee110022fa9cfa1033bb", // Dynamic Fields
    target: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", // Sui
    relationshipType: "extends",
    weight: 85,
    createdBy: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22",
    createdAt: Date.now() - 86400000 * 2.9,
    color: "#00ffaa"
  },
  {
    id: "0xedge4eeac923aaccddee55ee33eebaccfcee22123fcfceabcdddd003311deac4m",
    source: "0x77bcaaf823ee99ffda63eeea113bbcfdddaabcccee11abcc334411fbcfce12fa", // Sui Nexus
    target: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", // Sui
    relationshipType: "cites",
    weight: 88,
    createdBy: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54",
    createdAt: Date.now() - 86400000 * 2.4,
    color: "#ffad00"
  },
  {
    id: "0xedge5eead923aaccddee66ee44eebadcfcee33123fcfceabceeee887711deac5z",
    source: "0x5eac111009fedda77eaecceea0af5fa8bbbdddffceeebee22d111bcfcefa102b", // zkLogin
    target: "0x9ab7c10d7feeaee8ba49cbcfdfcee01fc4fcf6eeeddf6b62719114acfd9c01fb", // cryptography (zk)
    relationshipType: "cites",
    weight: 92,
    createdBy: "0x3344ccffbeea0dfcc7e64de06ebcde11debcde09acfebebd30bcfeff41ac89fa",
    createdAt: Date.now() - 86400000 * 3.4,
    color: "#00f0ff"
  }
];

let transactions: SuiTx[] = [
  {
    digest: "6f5r8RST8z5F7y8K4U9N3e1Wq8Mca9G7X2Zb4F6Y3cAd",
    sender: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22",
    timestamp: Date.now() - 1000 * 60 * 30,
    kind: "create_relationship",
    gasUsed: 0.00342,
    status: "success",
    changedObjectId: "0xedge3eeab923aaccddee44ee22eebabcfcee11123fcfceabcccc883311deac3t",
    events: [
      {
        type: "0xsnexus::knowledge_object::RelationshipEstablishedEvent",
        data: {
          id: "0xedge3eeab923aaccddee44ee22eebabcfcee11123fcfceabcccc883311deac3t",
          from: "0x11abcdf009feecc23eaaccb11a01fbcaeeef9bbbdcccee110022fa9cfa1033bb",
          to: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291",
          weight: "85",
          type: "extends"
        }
      }
    ]
  }
];

let proposals: DaoProposal[] = [
  {
    id: "prop_1",
    title: "Sui L1 Gas Optimization Reference Citations",
    description: "Curation bounty to audit and cite research on optimistic fee markets inside Sui L1 nodes, linking this into the Move Language smart storage objects.",
    type: "bounty",
    status: "active",
    creator: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22",
    votesFor: 12,
    votesAgainst: 1,
    reward: 250,
    createdAt: Date.now() - 86400000 * 2,
    votedAddresses: ["0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22"]
  },
  {
    id: "prop_2",
    title: "Flag Duplicate: 'Zero-Knowledge Cryptography' is redundant",
    description: "Dispute proposal to merge the 'Zero-Knowledge Cryptography' duplicate object with the primary 'Zero-Knowledge Proofs' object, preserving edges.",
    type: "dispute",
    status: "active",
    creator: "0x3344ccffbeea0dfcc7e64de06ebcde11debcde09acfebebd30bcfeff41ac89fa",
    votesFor: 8,
    votesAgainst: 14,
    reward: 50,
    createdAt: Date.now() - 86400000,
    votedAddresses: ["0x3344ccffbeea0dfcc7e64de06ebcde11debcde09acfebebd30bcfeff41ac89fa"]
  }
];

// Helper to generate a mock hex Sui Address / Object ID
function generateSuiId(): string {
  const chars = "0123456789abcdef";
  let str = "0x";
  for (let i = 0; i < 64; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

// Helper to generate a mock digest
function generateDigest(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < 44; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

// Clients list for Server Sent Events
let clients: express.Response[] = [];

function broadcast(event: string, data: any) {
  clients.forEach((client) => {
    client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });
}

// Event Streams (SSE) endpoint
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
});

// GET complete graph
app.get("/api/graph", (req, res) => {
  res.json({ nodes, edges });
});

// GET transaction logs
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

// GET DAO proposals
app.get("/api/proposals", (req, res) => {
  res.json(proposals);
});

// POST Create Node (Knowledge Object)
app.post("/api/node", (req, res) => {
  const { name, description, tags, owner, references, color } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }

  const senderAddress = owner || "0x_anonymous_zklogin_user";
  const idValue = generateSuiId();
  const txDigest = generateDigest();

  // Create KnowledgeNode
  const newNode: KnowledgeNode = {
    id: idValue,
    name,
    description,
    tags: tags ? tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [],
    owner: senderAddress,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    trustScore: 50, // Default trust score
    references: references ? references.map((r: string) => r.trim()).filter(Boolean) : [],
    color: color || "#a45eff",
    size: 25,
    dynamicFields: {
      "creation_nonce": Math.floor(Math.random() * 1000000).toString(),
      "validator_signature": "0x_sig_approved_" + Math.floor(Math.random() * 9999).toString()
    }
  };

  nodes.push(newNode);

  // Record Transaction
  const newTx: SuiTx = {
    digest: txDigest,
    sender: senderAddress,
    timestamp: Date.now(),
    kind: "create_knowledge_object",
    gasUsed: 0.00512 + Math.random() * 0.001,
    status: "success",
    changedObjectId: idValue,
    events: [
      {
        type: "0xsnexus::knowledge_object::KnowledgeObjectCreatedEvent",
        data: {
          id: idValue,
          name,
          version: 1,
          owner: senderAddress
        }
      }
    ]
  };

  transactions.unshift(newTx);

  // Broadcast to all active sessions (Multiplayer!)
  broadcast("graph_update", { type: "node_created", node: newNode, tx: newTx });

  res.status(201).json({ node: newNode, tx: newTx });
});

// POST Create Relationship (Edge)
app.post("/api/relationship", (req, res) => {
  const { source, target, relationshipType, weight, createdBy } = req.body;

  if (!source || !target || !relationshipType) {
    return res.status(400).json({ error: "Source, target, and relationship type are required" });
  }

  // Verify that both nodes exist
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode) {
    return res.status(404).json({ error: "Source or Target knowledge object was not found on-chain" });
  }

  // Create Edge
  const edgeId = generateSuiId();
  const txDigest = generateDigest();
  const senderAddress = createdBy || "0x_anonymous_zklogin_user";

  const newEdge: RelationshipEdge = {
    id: edgeId,
    source,
    target,
    relationshipType,
    weight: parseInt(weight) || 50,
    createdBy: senderAddress,
    createdAt: Date.now(),
    color: sourceNode.color || "#00f0ff"
  };

  edges.push(newEdge);

  const newTx: SuiTx = {
    digest: txDigest,
    sender: senderAddress,
    timestamp: Date.now(),
    kind: "create_relationship",
    gasUsed: 0.00318 + Math.random() * 0.0005,
    status: "success",
    changedObjectId: edgeId,
    events: [
      {
        type: "0xsnexus::knowledge_object::RelationshipEstablishedEvent",
        data: {
          id: edgeId,
          from: source,
          to: target,
          type: relationshipType,
          weight
        }
      }
    ]
  };

  transactions.unshift(newTx);

  broadcast("graph_update", { type: "edge_created", edge: newEdge, tx: newTx });

  res.status(201).json({ edge: newEdge, tx: newTx });
});

// POST Update Knowledge Object (Demonstrates Optimistic Concurrency Control/Locking)
app.post("/api/node/update", (req, res) => {
  const { id, description, version, editorAddress, name } = req.body;

  const nodeIndex = nodes.findIndex((n) => n.id === id);
  if (nodeIndex === -1) {
    return res.status(404).json({ error: "Knowledge Object does not exist" });
  }

  const existingNode = nodes[nodeIndex];

  // OPTIMISTIC CONFLICT CHECKING
  // If the version supplied by client doesn't match current blockchain state, throw a conflict!
  if (existingNode.version !== parseInt(version)) {
    const errorDigest = generateDigest();
    const conflictedTx: SuiTx = {
      digest: errorDigest,
      sender: editorAddress || "0x_conflicted_editor",
      timestamp: Date.now(),
      kind: "update_knowledge_object",
      gasUsed: 0.0014, // Fails still costs small execution gas
      status: "failure",
      errorMessage: `SuiSharedObjectCollision: Local object version is ${version}, but latest on-chain registration is ${existingNode.version}. Transaction aborted to prevent state corruption.`,
      changedObjectId: id,
      events: []
    };
    transactions.unshift(conflictedTx);
    broadcast("graph_update", { type: "tx_failed", tx: conflictedTx });

    return res.status(409).json({
      error: "Sui Shared Object lock error: Version mismatch detected. Clean merge or fetch latest state first.",
      latestVersion: existingNode.version,
      tx: conflictedTx
    });
  }

  // Update object properties
  const txDigest = generateDigest();
  const editor = editorAddress || "0x_anonymous_zklogin_user";

  const updatedNode: KnowledgeNode = {
    ...existingNode,
    name: name || existingNode.name,
    description: description || existingNode.description,
    version: existingNode.version + 1,
    updatedAt: Date.now(),
    owner: editor // Transfers or sets current editing context
  };

  nodes[nodeIndex] = updatedNode;

  const newTx: SuiTx = {
    digest: txDigest,
    sender: editor,
    timestamp: Date.now(),
    kind: "update_knowledge_object",
    gasUsed: 0.00412,
    status: "success",
    changedObjectId: id,
    events: [
      {
        type: "0xsnexus::knowledge_object::KnowledgeObjectUpdatedEvent",
        data: {
          id,
          version: updatedNode.version,
          editor
        }
      }
    ]
  };

  transactions.unshift(newTx);

  broadcast("graph_update", { type: "node_updated", node: updatedNode, tx: newTx });

  res.json({ node: updatedNode, tx: newTx });
});

// POST Vote on Trust Score (Validation & Tokenomics)
app.post("/api/node/vote", (req, res) => {
  const { id, voteType, voterAddress } = req.body;

  const nodeIndex = nodes.findIndex((n) => n.id === id);
  if (nodeIndex === -1) {
    return res.status(404).json({ error: "Knowledge Object not found" });
  }

  const existingNode = nodes[nodeIndex];
  const delta = voteType === "upvote" ? 5 : -5;
  const newScore = Math.min(100, Math.max(0, existingNode.trustScore + delta));

  existingNode.trustScore = newScore;
  existingNode.updatedAt = Date.now();

  const txDigest = generateDigest();
  const voter = voterAddress || "0x_validator_voter";

  const newTx: SuiTx = {
    digest: txDigest,
    sender: voter,
    timestamp: Date.now(),
    kind: "validate_knowledge_object",
    gasUsed: 0.00224,
    status: "success",
    changedObjectId: id,
    events: [
      {
        type: "0xsnexus::knowledge_object::ValidationVotedEvent",
        data: {
          id,
          voter,
          vote: voteType,
          new_trust_score: newScore
        }
      }
    ]
  };

  transactions.unshift(newTx);

  broadcast("graph_update", { type: "node_validated", node: existingNode, tx: newTx, voter, voteType });

  res.json({ node: existingNode, tx: newTx });
});

// POST Query parser (Custom graph query engine compiler)
app.post("/api/query", (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.json({ nodesList: nodes, edgesList: edges, error: null });
  }

  try {
    const q = query.trim().toUpperCase();
    
    // Simple custom regex compiler for:
    // FIND * WHERE tag = "sui"
    // FIND * WHERE trust_score > 70
    // FIND * WHERE relationship = "extends"
    // FIND * WHERE text = "cryptography"
    
    let filteredNodes = [...nodes];
    let filteredEdges = [...edges];
    let logMsg = "Query executed successfully.";

    if (q.startsWith("FIND *")) {
      const parts = q.split("WHERE");
      if (parts.length > 1) {
        const expression = parts[1].trim();

        // Parse Tag: tag = "sui"
        if (expression.includes("TAG =")) {
          const tagMatch = parts[1].match(/TAG\s*=\s*['"]([^'"]+)['"]/i);
          if (tagMatch) {
            const tagVal = tagMatch[1].toLowerCase();
            filteredNodes = nodes.filter((n) => n.tags.includes(tagVal));
            const nodeIds = filteredNodes.map((n) => n.id);
            filteredEdges = edges.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target));
            logMsg = `Filtered by tag = "${tagVal}". Found ${filteredNodes.length} objects.`;
          } else {
            throw new Error("Syntax error: Expected TAG = 'tag_name'");
          }
        }
        // Parse Trust Score: trust_score > 80
        else if (expression.includes("TRUST_SCORE")) {
          const operatorMatch = expression.match(/TRUST_SCORE\s*(>|<|=)\s*(\d+)/i);
          if (operatorMatch) {
            const op = operatorMatch[1];
            const val = parseInt(operatorMatch[2]);
            if (op === ">") {
              filteredNodes = nodes.filter((n) => n.trustScore > val);
            } else if (op === "<") {
              filteredNodes = nodes.filter((n) => n.trustScore < val);
            } else {
              filteredNodes = nodes.filter((n) => n.trustScore === val);
            }
            const nodeIds = filteredNodes.map((n) => n.id);
            filteredEdges = edges.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target));
            logMsg = `Filtered by trust_score ${op} ${val}. Found ${filteredNodes.length} objects.`;
          } else {
            throw new Error("Syntax error: Expected TRUST_SCORE > value");
          }
        }
        // Parse Relationship type: relationship = "extends"
        else if (expression.includes("RELATIONSHIP") || expression.includes("RELATION")) {
          const relMatch = parts[1].match(/(?:RELATIONSHIP|RELATION)\s*=\s*['"]([^'"]+)['"]/i);
          if (relMatch) {
            const relType = relMatch[1].toLowerCase();
            filteredEdges = edges.filter((e) => e.relationshipType === relType);
            const nodeIds = new Set<string>();
            filteredEdges.forEach((e) => {
              nodeIds.add(e.source);
              nodeIds.add(e.target);
            });
            filteredNodes = nodes.filter((n) => nodeIds.has(n.id));
            logMsg = `Filtered by relationship_type = "${relType}". Found ${filteredEdges.length} connections representing 2-node subgraphs.`;
          } else {
            throw new Error("Syntax error: Expected RELATIONSHIP = 'relation_type'");
          }
        }
        // General text search
        else if (expression.includes("NAME") || expression.includes("TEXT")) {
          const textMatch = parts[1].match(/(?:NAME|TEXT)\s*=\s*['"]([^'"]+)['"]/i);
          if (textMatch) {
            const search = textMatch[1].toLowerCase();
            filteredNodes = nodes.filter((n) => n.name.toLowerCase().includes(search) || n.description.toLowerCase().includes(search));
            const nodeIds = filteredNodes.map((n) => n.id);
            filteredEdges = edges.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target));
            logMsg = `Filtered matches for "${search}". Found ${filteredNodes.length} nodes.`;
          } else if (expression.includes("LIKE")) {
            const likeMatch = parts[1].match(/(?:NAME|TEXT)\s*LIKE\s*['"]%([^'"]+)%['"]/i);
            if (likeMatch) {
              const search = likeMatch[1].toLowerCase();
              filteredNodes = nodes.filter((n) => n.name.toLowerCase().includes(search) || n.description.toLowerCase().includes(search));
              const nodeIds = filteredNodes.map((n) => n.id);
              filteredEdges = edges.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target));
              logMsg = `Filtered with LIKE "%${search}%". Found ${filteredNodes.length} nodes.`;
            }
          } else {
            throw new Error("Syntax error: Expected TEXT = 'keyword'");
          }
        } else {
          throw new Error(`Unsupported expression operator under Sui Indexer: ${expression}`);
        }
      } else {
        logMsg = "Fetched complete graph. No query filter applied.";
      }
    } else {
      throw new Error("Invalid command: Sui Nexus Indexer Query Engine ONLY supports 'FIND *' or 'FIND * WHERE ...' statements.");
    }

    res.json({ nodesList: filteredNodes, edgesList: filteredEdges, message: logMsg, error: null });
  } catch (err: any) {
    res.json({ nodesList: nodes, edgesList: edges, message: null, error: err.message || "Unknown compile-time parse error." });
  }
});

// POST Cast DAO vote
app.post("/api/dao/vote", (req, res) => {
  const { proposalId, voteType, voterAddress } = req.body;

  const proposal = proposals.find((p) => p.id === proposalId);
  if (!proposal) {
    return res.status(404).json({ error: "Dao Proposal not found" });
  }

  const voter = voterAddress || "0x_anonymous_dao_staker";

  if (proposal.votedAddresses.includes(voter)) {
    return res.status(400).json({ error: "Voter has already cast a ballot on this proposal" });
  }

  proposal.votedAddresses.push(voter);

  if (voteType === "for") {
    proposal.votesFor += 1;
  } else {
    proposal.votesAgainst += 1;
  }

  // Trigger passed / defeated logic if threshold met
  if (proposal.votesFor >= 15) {
    proposal.status = "passed";
    
    // If it was a duplicate merging dispute, let's process it!
    if (proposal.id === "prop_2" && voteType === "for") {
      // Merging logic can be triggered, or just display visually
    }
  } else if (proposal.votesAgainst >= 15) {
    proposal.status = "defeated";
  }

  const txDigest = generateDigest();
  const indexerTx: SuiTx = {
    digest: txDigest,
    sender: voter,
    timestamp: Date.now(),
    kind: "validate_knowledge_object", // DAO actions recorded as gas validation
    gasUsed: 0.0019,
    status: "success",
    changedObjectId: proposalId,
    events: [
      {
        type: "0xsnexus::incentives::ProposalBallotCastEvent",
        data: {
          proposal_id: proposalId,
          voter,
          ballot: voteType,
          total_for: proposal.votesFor,
          total_against: proposal.votesAgainst
        }
      }
    ]
  };

  transactions.unshift(indexerTx);

  broadcast("graph_update", { type: "dao_ballot", proposal, tx: indexerTx });

  res.json({ proposal, tx: indexerTx });
});

// POST Create DAO Proposal
app.post("/api/dao/proposal", (req, res) => {
  const { title, description, type, reward, creator } = req.body;

  if (!title || !description || !type) {
    return res.status(400).json({ error: "Title, description, and type are required" });
  }

  const newProp: DaoProposal = {
    id: "prop_" + (proposals.length + 1).toString(),
    title,
    description,
    type,
    status: "active",
    creator: creator || "0x_submitter",
    votesFor: 1,
    votesAgainst: 0,
    reward: parseInt(reward) || 100,
    createdAt: Date.now(),
    votedAddresses: [creator || "0x_submitter"]
  };

  proposals.push(newProp);

  const txDigest = generateDigest();
  const tx: SuiTx = {
    digest: txDigest,
    sender: creator || "0x_submitter",
    timestamp: Date.now(),
    kind: "create_knowledge_object",
    gasUsed: 0.0082,
    status: "success",
    changedObjectId: newProp.id,
    events: [
      {
        type: "0xsnexus::incentives::CurationProposalCreatedEvent",
        data: {
          id: newProp.id,
          title,
          reward
        }
      }
    ]
  };

  transactions.unshift(tx);
  broadcast("graph_update", { type: "proposal_created", proposal: newProp, tx });

  res.status(201).json({ proposal: newProp, tx });
});

// Bot Curation Loop Simulator (Adds context when multiplayer is toggled)
let activeBotInterval: any = null;

// Simulated active profiles
const botAddresses = [
  { addr: "0x3344ccffbeea0dfcc7e64de06ebcde11debcde09acfebebd30bcfeff41ac89fa", name: "ZkSnark_Cryptographer" },
  { addr: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22", name: "Move_Master_Sui" },
  { addr: "0xf90999557458ef8a57e937d5ff4fbb1c7128cb5fceae1d6cfcf858d20ae4bc54", name: "L1_Node_Sentinel" },
  { addr: "0x2211bbccffeaacc66aacc0011bbcaefcd1122abcc3344ccff884488fa00ac82e", name: "Alex_Sui_Explorer" }
];

const mockConcepts = [
  { name: "Sui Consensus (Mysticeti)", tags: ["sui", "consensus", "l1"], desc: "Sui's cutting-edge consensus engine that reduces latency into sub-second absolute finality with high scalability." },
  { name: "Parallel Execution Model", tags: ["sui", "performance", "parallel"], desc: "The transaction scheduler naturally executes independent smart contracts concurrently, boosting performance past legacy EVM sequencers." },
  { name: "Lattice Cryptography", tags: ["cryptography", "zk", "security"], desc: "A key candidate for quantum-resistant signature logic to shield future Sui assets against decentralized hardware vulnerabilities." }
];

app.post("/api/simulator/toggle", (req, res) => {
  const { enabled } = req.body;

  if (enabled) {
    if (!activeBotInterval) {
      activeBotInterval = setInterval(() => {
        // Randomly choose an action: upvote a node, or submit a new node, or vote on a proposal
        const roll = Math.random();

        if (roll < 0.4 && nodes.length > 0) {
          // Upvote action
          const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
          const randomBot = botAddresses[Math.floor(Math.random() * botAddresses.length)];
          const delta = Math.random() < 0.7 ? "upvote" : "downvote";
          const dScore = delta === "upvote" ? 5 : -5;
          randomNode.trustScore = Math.min(100, Math.max(0, randomNode.trustScore + dScore));
          
          const txDigest = generateDigest();
          const tx: SuiTx = {
            digest: txDigest,
            sender: randomBot.addr,
            timestamp: Date.now(),
            kind: "validate_knowledge_object",
            gasUsed: 0.0022,
            status: "success",
            changedObjectId: randomNode.id,
            events: [
              {
                type: "0xsnexus::knowledge_object::ValidationVotedEvent",
                data: {
                  id: randomNode.id,
                  voter: randomBot.addr,
                  vote: delta,
                  new_trust_score: randomNode.trustScore
                }
              }
            ]
          };

          transactions.unshift(tx);
          broadcast("graph_update", { type: "node_validated", node: randomNode, tx, voter: randomBot.name, voteType: delta });
        } 
        else if (roll < 0.65 && proposals.length > 0) {
          // Balloting on active proposal
          const activeProps = proposals.filter((p) => p.status === "active");
          if (activeProps.length > 0) {
            const randomProp = activeProps[Math.floor(Math.random() * activeProps.length)];
            const randomBot = botAddresses[Math.floor(Math.random() * botAddresses.length)];
            
            if (!randomProp.votedAddresses.includes(randomBot.addr)) {
              randomProp.votedAddresses.push(randomBot.addr);
              const vote = Math.random() < 0.75 ? "for" : "against";
              
              if (vote === "for") randomProp.votesFor += 1;
              else randomProp.votesAgainst += 1;

              if (randomProp.votesFor >= 15) randomProp.status = "passed";
              else if (randomProp.votesAgainst >= 15) randomProp.status = "defeated";

              const txDigest = generateDigest();
              const tx: SuiTx = {
                digest: txDigest,
                sender: randomBot.addr,
                timestamp: Date.now(),
                kind: "validate_knowledge_object",
                gasUsed: 0.00185,
                status: "success",
                changedObjectId: randomProp.id,
                events: [
                  {
                    type: "0xsnexus::incentives::ProposalBallotCastEvent",
                    data: {
                      proposal_id: randomProp.id,
                      voter: randomBot.addr,
                      ballot: vote
                    }
                  }
                ]
              };

              transactions.unshift(tx);
              broadcast("graph_update", { type: "dao_ballot", proposal: randomProp, tx, voter: randomBot.name, voteType: vote });
            }
          }
        } 
        else if (nodes.length < 15) {
          // Submit new node from bot
          const concept = mockConcepts.shift();
          if (concept) {
            const randomBot = botAddresses[Math.floor(Math.random() * botAddresses.length)];
            const idValue = generateSuiId();
            const txDigest = generateDigest();

            const newNode: KnowledgeNode = {
              id: idValue,
              name: concept.name,
              description: concept.desc,
              tags: concept.tags,
              owner: randomBot.addr,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              version: 1,
              trustScore: 70,
              references: [`https://docs.sui.io/concepts/${concept.tags[1]}`],
              color: "#" + Math.floor(Math.random()*16777215).toString(16),
              size: 26,
              dynamicFields: {
                "curated_by": randomBot.name,
                "node_strength": "verified"
              }
            };

            nodes.push(newNode);

            const tx: SuiTx = {
              digest: txDigest,
              sender: randomBot.addr,
              timestamp: Date.now(),
              kind: "create_knowledge_object",
              gasUsed: 0.0052,
              status: "success",
              changedObjectId: idValue,
              events: [
                {
                  type: "0xsnexus::knowledge_object::KnowledgeObjectCreatedEvent",
                  data: {
                    id: idValue,
                    name: concept.name,
                    version: 1,
                    owner: randomBot.addr
                  }
                }
              ]
            };

            transactions.unshift(tx);
            broadcast("graph_update", { type: "node_created", node: newNode, tx, curatorName: randomBot.name });
          }
        }
      }, 9000);
    }
    res.json({ status: "running" });
  } else {
    if (activeBotInterval) {
      clearInterval(activeBotInterval);
      activeBotInterval = null;
    }
    res.json({ status: "idle" });
  }
});


// Serve files with Vite middleware / Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sui Nexus Edge Server] Listening successfully on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
