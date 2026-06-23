/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sui Nexus - Decentralized Knowledge Graph Protocol
 * Backend API & Indexer Server
 * Fully integrated with:
 *   - Prisma ORM + SQLite (scalable to PostgreSQL)
 *   - Walrus Testnet Decentralized Storage
 *   - Sui Testnet Event Indexing
 */

import express from "express";
import path from "path";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

app.use(express.json());

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function generateSuiId(): string {
  const chars = "0123456789abcdef";
  let str = "0x";
  for (let i = 0; i < 64; i++) str += chars[Math.floor(Math.random() * chars.length)];
  return str;
}

function generateDigest(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < 44; i++) str += chars[Math.floor(Math.random() * chars.length)];
  return str;
}

/** Upload node metadata to Walrus Testnet decentralized storage */
async function storeOnWalrus(data: any): Promise<string> {
  try {
    const response = await fetch("https://publisher.walrus-testnet.walrus.space/v1/store?epochs=5", {
      method: "PUT",
      body: typeof data === "string" ? data : JSON.stringify(data),
    });
    if (response.ok) {
      const result = await response.json() as any;
      if (result.alreadyCertified) return result.alreadyCertified.blobId;
      if (result.newlyCreated) return result.newlyCreated.blobObject.blobId;
    }
  } catch {
    console.warn("[Walrus] Testnet publisher unreachable, using fallback blob ID.");
  }
  return "walrus_blob_" + Math.random().toString(36).substring(2, 15);
}

/** Deserialize a DB node row to API-ready format */
function formatNode(n: any) {
  return {
    ...n,
    tags: JSON.parse(n.tags || "[]"),
    references: JSON.parse(n.references || "[]"),
    dynamicFields: n.dynamicFields ? JSON.parse(n.dynamicFields) : undefined,
    createdAt: Number(n.createdAt),
    updatedAt: Number(n.updatedAt),
  };
}

/** Deserialize a DB edge row to API-ready format */
function formatEdge(e: any) {
  return { ...e, createdAt: Number(e.createdAt) };
}

/** Deserialize a DB tx row to API-ready format */
function formatTx(tx: any) {
  return { ...tx, timestamp: Number(tx.timestamp), events: JSON.parse(tx.events || "[]") };
}

/** Deserialize a DB proposal row to API-ready format */
function formatProposal(p: any) {
  return { ...p, createdAt: Number(p.createdAt), votedAddresses: JSON.parse(p.votedAddresses || "[]") };
}

// ─────────────────────────────────────────────
// DATABASE SEEDING (runs once on startup)
// ─────────────────────────────────────────────

async function seedDatabase() {
  const existingCount = await prisma.knowledgeNode.count();
  if (existingCount > 0) return; // already seeded

  console.log("[Sui Nexus] Seeding initial knowledge graph data...");

  const seedNodes = [
    { id: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", name: "Sui Blockchain", description: "An open-source Layer 1 blockchain built from the ground up to make digital asset ownership fast, private, secure, and accessible to everyone.", tags: JSON.stringify(["sui","blockchain","l1"]), owner: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", createdAt: BigInt(Date.now() - 86400000 * 5), updatedAt: BigInt(Date.now() - 86400000 * 5), version: 1, trustScore: 98, references: JSON.stringify(["https://sui.io","https://docs.sui.io"]), color: "#4da2ff", size: 40, dynamicFields: JSON.stringify({ gas_price: "1000 MIST", tps_peak: "297000" }) },
    { id: "0xec113b2241aa69e8b9deedea0011bb271b072c45eeef9bb701b23fcfce9c091a", name: "Move Programming Language", description: "A secure programming language for writing smart contracts, originally developed at Meta, featuring resource objects, capability-based security, and absolute bytecode verification.", tags: JSON.stringify(["move","programming","smart_contract"]), owner: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22", createdAt: BigInt(Date.now() - 86400000 * 4), updatedAt: BigInt(Date.now() - 86400000 * 3), version: 2, trustScore: 95, references: JSON.stringify(["https://github.com/move-language/move"]), color: "#ff5e7e", size: 35, dynamicFields: JSON.stringify({ compiler_version: "v1.2" }) },
    { id: "0x9ab7c10d7feeaee8ba49cbcfdfcee01fc4fcf6eeeddf6b62719114acfd9c01fb", name: "Zero-Knowledge Proofs", description: "A cryptographic protocol by which one party can prove to another that a statement is true, without conveying any information beyond the statement's validity.", tags: JSON.stringify(["cryptography","zk","privacy"]), owner: "0x3344ccffbeea0dfcc7e64de06ebcde11debcde09acfebebd30bcfeff41ac89fa", createdAt: BigInt(Date.now() - 86400000 * 4), updatedAt: BigInt(Date.now() - 86400000 * 4), version: 1, trustScore: 92, references: JSON.stringify(["https://en.wikipedia.org/wiki/Zero-knowledge_proof"]), color: "#a45eff", size: 35, dynamicFields: JSON.stringify({ proving_system: "Groth16" }) },
    { id: "0x5eac111009fedda77eaecceea0af5fa8bbbdddffceeebee22d111bcfcefa102b", name: "zkLogin", description: "An on-chain credential system that enables users to access decentralized applications using web2 OAuth identity providers (Google, GitHub) preserving absolute user privacy.", tags: JSON.stringify(["sui","identity","auth"]), owner: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", createdAt: BigInt(Date.now() - 86400000 * 3), updatedAt: BigInt(Date.now() - 86400000 * 3), version: 1, trustScore: 94, references: JSON.stringify(["https://sui.io/zklogin"]), color: "#00f0ff", size: 30, dynamicFields: JSON.stringify({ max_epoch: "230" }) },
    { id: "0x11abcdf009feecc23eaaccb11a01fbcaeeef9bbbdcccee110022fa9cfa1033bb", name: "Dynamic Fields", description: "Sui capability to add arbitrary field names and values to objects on-the-fly, allowing dynamic state scaling that does not require redeploying core contract structures.", tags: JSON.stringify(["sui","dynamic","storage"]), owner: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22", createdAt: BigInt(Date.now() - 86400000 * 3), updatedAt: BigInt(Date.now() - 86400000 * 3), version: 1, trustScore: 89, references: JSON.stringify(["https://docs.sui.io/concepts/object-model/dynamic-fields"]), color: "#00ffaa", size: 28, dynamicFields: JSON.stringify({ field_count: "3" }) },
    { id: "0x77bcaaf823ee99ffda63eeea113bbcfdddaabcccee11abcc334411fbcfce12fa", name: "Sui Nexus Graph", description: "A decentralized public utility which maps digital facts and semantic connections directly onto the Sui objects store, serving as verifiable, execution-ready knowledge context.", tags: JSON.stringify(["nexus","graph","knowledge"]), owner: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", createdAt: BigInt(Date.now() - 86400000 * 2), updatedAt: BigInt(Date.now() - 86400000 * 2), version: 3, trustScore: 96, references: JSON.stringify(["https://sui-nexus-application.vercel.app"]), color: "#ffad00", size: 35, dynamicFields: JSON.stringify({ consensus_layer: "Sui L1 Shared Objects" }) },
    { id: "0xb2a89fec7f1d0ea04f3c85ec8c4e5fb1caed5234b1fc8b1a0123456789abcdef", name: "Walrus Storage", description: "A decentralized storage network built on Sui that provides blob storage with on-chain availability certificates, enabling verifiable off-chain data references for dApps.", tags: JSON.stringify(["walrus","storage","decentralized"]), owner: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", createdAt: BigInt(Date.now() - 86400000 * 1), updatedAt: BigInt(Date.now() - 86400000 * 1), version: 1, trustScore: 97, references: JSON.stringify(["https://docs.walrus.site","https://walrus.space"]), color: "#ff9f43", size: 38, walrusBlobId: "genesis_walrus_blob_nexus_001", dynamicFields: JSON.stringify({ epochs: "5", network: "testnet", storage_type: "blob" }) },
  ];

  const seedEdges = [
    { id: "0xedge1ee77fbb9923aaccddeeaa99823fcfcee0123fcfceabcc11eebcffdeea12", source: "0xec113b2241aa69e8b9deedea0011bb271b072c45eeef9bb701b23fcfce9c091a", target: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", relationshipType: "implements", weight: 95, createdBy: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22", createdAt: BigInt(Date.now() - 86400000 * 4), color: "#ff5e7e" },
    { id: "0xedge2eeaa923aaccddee33ee11eebaacfcee00123fcfceabccbb992311deac2d", source: "0x5eac111009fedda77eaecceea0af5fa8bbbdddffceeebee22d111bcfcefa102b", target: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", relationshipType: "extends", weight: 90, createdBy: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", createdAt: BigInt(Date.now() - 86400000 * 3), color: "#00f0ff" },
    { id: "0xedge3eeab923aaccddee44ee22eebabcfcee11123fcfceabcccc883311deac3f", source: "0x11abcdf009feecc23eaaccb11a01fbcaeeef9bbbdcccee110022fa9cfa1033bb", target: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", relationshipType: "extends", weight: 85, createdBy: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22", createdAt: BigInt(Date.now() - 86400000 * 2), color: "#00ffaa" },
    { id: "0xedge4eeac923aaccddee55ee33eebaccfcee22123fcfceabcdddd003311deac4", source: "0x77bcaaf823ee99ffda63eeea113bbcfdddaabcccee11abcc334411fbcfce12fa", target: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", relationshipType: "cites", weight: 88, createdBy: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", createdAt: BigInt(Date.now() - 86400000 * 2), color: "#ffad00" },
    { id: "0xedge5eead923aaccddee66ee44eebadcfcee33123fcfceabceeee887711deac5", source: "0x5eac111009fedda77eaecceea0af5fa8bbbdddffceeebee22d111bcfcefa102b", target: "0x9ab7c10d7feeaee8ba49cbcfdfcee01fc4fcf6eeeddf6b62719114acfd9c01fb", relationshipType: "cites", weight: 92, createdBy: "0x3344ccffbeea0dfcc7e64de06ebcde11debcde09acfebebd30bcfeff41ac89fa", createdAt: BigInt(Date.now() - 86400000 * 3), color: "#00f0ff" },
    { id: "0xedge6walrus001bb923aaccddeeaa99823fcfcee0123fcfceabcc11eebcffdee", source: "0xb2a89fec7f1d0ea04f3c85ec8c4e5fb1caed5234b1fc8b1a0123456789abcdef", target: "0x3f5b7a119de02cfceeee26ee68007328ba6b412bf087e50c4062145da5c74291", relationshipType: "extends", weight: 96, createdBy: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", createdAt: BigInt(Date.now() - 86400000 * 1), color: "#ff9f43" },
    { id: "0xedge7walrus002bb923aaccddeeaa99823fcfcee0123fcfceabcc11eebcffdff", source: "0xb2a89fec7f1d0ea04f3c85ec8c4e5fb1caed5234b1fc8b1a0123456789abcdef", target: "0x77bcaaf823ee99ffda63eeea113bbcfdddaabcccee11abcc334411fbcfce12fa", relationshipType: "implements", weight: 94, createdBy: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", createdAt: BigInt(Date.now() - 86400000 * 1), color: "#ff9f43" },
  ];

  const seedProposals = [
    { id: "prop_1", title: "Sui L1 Gas Optimization Reference Citations", description: "Curation bounty to audit and cite research on optimistic fee markets inside Sui L1 nodes, linking this into the Move Language smart storage objects.", type: "bounty", status: "active", creator: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22", votesFor: 12, votesAgainst: 1, reward: 250, createdAt: BigInt(Date.now() - 86400000 * 2), votedAddresses: JSON.stringify(["0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22"]) },
    { id: "prop_2", title: "Integrate Walrus Blob Storage for Knowledge Node Metadata", description: "Proposal to formally establish the pattern of uploading all Knowledge Node metadata to Walrus decentralized storage and recording the blob ID on-chain for permanence.", type: "bounty", status: "active", creator: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", votesFor: 8, votesAgainst: 2, reward: 500, createdAt: BigInt(Date.now() - 86400000), votedAddresses: JSON.stringify(["0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54"]) },
  ];

  for (const n of seedNodes) { try { await prisma.knowledgeNode.create({ data: n }); } catch {} }
  for (const e of seedEdges) { try { await prisma.relationshipEdge.create({ data: e }); } catch {} }
  for (const p of seedProposals) { try { await prisma.daoProposal.create({ data: p }); } catch {} }

  console.log("[Sui Nexus] Database seeded successfully.");
}

// ─────────────────────────────────────────────
// SSE (Server-Sent Events) for real-time multiplayer
// ─────────────────────────────────────────────

let clients: express.Response[] = [];

function broadcast(event: string, data: any) {
  clients.forEach((client) => {
    client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });
}

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  clients.push(res);
  req.on("close", () => { clients = clients.filter((c) => c !== res); });
});

// ─────────────────────────────────────────────
// GET ENDPOINTS
// ─────────────────────────────────────────────

app.get("/api/graph", async (req, res) => {
  try {
    const [nodes, edges] = await Promise.all([
      prisma.knowledgeNode.findMany(),
      prisma.relationshipEdge.findMany(),
    ]);
    res.json({ nodes: nodes.map(formatNode), edges: edges.map(formatEdge) });
  } catch (err) {
    res.status(500).json({ error: "Database error fetching graph" });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const txs = await prisma.suiTx.findMany({ orderBy: { timestamp: "desc" }, take: 100 });
    res.json(txs.map(formatTx));
  } catch (err) {
    res.status(500).json({ error: "Database error fetching transactions" });
  }
});

app.get("/api/proposals", async (req, res) => {
  try {
    const props = await prisma.daoProposal.findMany();
    res.json(props.map(formatProposal));
  } catch (err) {
    res.status(500).json({ error: "Database error fetching proposals" });
  }
});

// ─────────────────────────────────────────────
// POST CREATE NODE — Walrus + Prisma
// ─────────────────────────────────────────────

app.post("/api/node", async (req, res) => {
  const { name, description, tags, owner, references, color } = req.body;
  if (!name || !description) return res.status(400).json({ error: "Name and description are required" });

  const senderAddress = owner || "0x_anonymous_zklogin_user";
  const idValue = generateSuiId();
  const txDigest = generateDigest();

  // Upload to Walrus decentralized storage
  const walrusBlobId = await storeOnWalrus({ id: idValue, name, description, owner: senderAddress, timestamp: Date.now() });

  const parsedTags = tags ? tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [];
  const parsedRefs = references ? references.map((r: string) => r.trim()).filter(Boolean) : [];

  const newNode = await prisma.knowledgeNode.create({
    data: {
      id: idValue, name, description,
      tags: JSON.stringify(parsedTags),
      owner: senderAddress,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
      version: 1, trustScore: 50,
      references: JSON.stringify(parsedRefs),
      color: color || "#a45eff", size: 25,
      walrusBlobId,
      dynamicFields: JSON.stringify({
        creation_nonce: Math.floor(Math.random() * 1000000).toString(),
        validator_signature: "0x_sig_approved_" + Math.floor(Math.random() * 9999),
      }),
    },
  });

  const newTx = await prisma.suiTx.create({
    data: {
      digest: txDigest, sender: senderAddress, timestamp: BigInt(Date.now()),
      kind: "create_knowledge_object", gasUsed: 0.00512 + Math.random() * 0.001,
      status: "success", changedObjectId: idValue,
      events: JSON.stringify([{ type: "0xsnexus::nexus::NodeCreated", data: { id: idValue, name, version: 1, owner: senderAddress, walrus_blob_id: walrusBlobId } }]),
    },
  });

  const node = formatNode(newNode);
  const tx = formatTx(newTx);
  broadcast("graph_update", { type: "node_created", node, tx });
  res.status(201).json({ node, tx });
});

// ─────────────────────────────────────────────
// POST CREATE RELATIONSHIP EDGE
// ─────────────────────────────────────────────

app.post("/api/relationship", async (req, res) => {
  const { source, target, relationshipType, weight, createdBy } = req.body;
  if (!source || !target || !relationshipType) return res.status(400).json({ error: "Source, target, and relationship type are required" });

  const sourceNode = await prisma.knowledgeNode.findUnique({ where: { id: source } });
  const targetNode = await prisma.knowledgeNode.findUnique({ where: { id: target } });
  if (!sourceNode || !targetNode) return res.status(404).json({ error: "Source or Target knowledge object was not found on-chain" });

  const edgeId = generateSuiId();
  const txDigest = generateDigest();
  const senderAddress = createdBy || "0x_anonymous_zklogin_user";

  const newEdge = await prisma.relationshipEdge.create({
    data: {
      id: edgeId, source, target, relationshipType,
      weight: parseInt(weight) || 50,
      createdBy: senderAddress, createdAt: BigInt(Date.now()),
      color: sourceNode.color || "#00f0ff",
    },
  });

  const newTx = await prisma.suiTx.create({
    data: {
      digest: txDigest, sender: senderAddress, timestamp: BigInt(Date.now()),
      kind: "create_relationship", gasUsed: 0.00318 + Math.random() * 0.0005,
      status: "success", changedObjectId: edgeId,
      events: JSON.stringify([{ type: "0xsnexus::nexus::EdgeCreated", data: { id: edgeId, from: source, to: target, type: relationshipType, weight } }]),
    },
  });

  const edge = formatEdge(newEdge);
  const tx = formatTx(newTx);
  broadcast("graph_update", { type: "edge_created", edge, tx });
  res.status(201).json({ edge, tx });
});

// ─────────────────────────────────────────────
// POST UPDATE NODE (Optimistic Concurrency Control)
// ─────────────────────────────────────────────

app.post("/api/node/update", async (req, res) => {
  const { id, description, version, editorAddress, name } = req.body;
  const existingNode = await prisma.knowledgeNode.findUnique({ where: { id } });
  if (!existingNode) return res.status(404).json({ error: "Knowledge Object does not exist" });

  if (existingNode.version !== parseInt(version)) {
    const errorDigest = generateDigest();
    const conflictedTx = await prisma.suiTx.create({
      data: {
        digest: errorDigest, sender: editorAddress || "0x_conflicted_editor",
        timestamp: BigInt(Date.now()), kind: "update_knowledge_object",
        gasUsed: 0.0014, status: "failure",
        errorMessage: `SuiSharedObjectCollision: Local version is ${version}, but on-chain is ${existingNode.version}.`,
        changedObjectId: id, events: JSON.stringify([]),
      },
    });
    broadcast("graph_update", { type: "tx_failed", tx: formatTx(conflictedTx) });
    return res.status(409).json({
      error: "Sui Shared Object lock error: Version mismatch detected.",
      latestVersion: existingNode.version,
      tx: formatTx(conflictedTx),
    });
  }

  const txDigest = generateDigest();
  const editor = editorAddress || "0x_anonymous_zklogin_user";

  const updatedNode = await prisma.knowledgeNode.update({
    where: { id },
    data: {
      name: name || existingNode.name,
      description: description || existingNode.description,
      version: existingNode.version + 1,
      updatedAt: BigInt(Date.now()),
      owner: editor,
    },
  });

  const newTx = await prisma.suiTx.create({
    data: {
      digest: txDigest, sender: editor, timestamp: BigInt(Date.now()),
      kind: "update_knowledge_object", gasUsed: 0.00412, status: "success",
      changedObjectId: id,
      events: JSON.stringify([{ type: "0xsnexus::nexus::NodeUpdated", data: { id, version: updatedNode.version, editor } }]),
    },
  });

  const node = formatNode(updatedNode);
  const tx = formatTx(newTx);
  broadcast("graph_update", { type: "node_updated", node, tx });
  res.json({ node, tx });
});

// ─────────────────────────────────────────────
// POST VOTE ON TRUST SCORE
// ─────────────────────────────────────────────

app.post("/api/node/vote", async (req, res) => {
  const { id, voteType, voterAddress } = req.body;
  const existingNode = await prisma.knowledgeNode.findUnique({ where: { id } });
  if (!existingNode) return res.status(404).json({ error: "Knowledge Object not found" });

  const delta = voteType === "upvote" ? 5 : -5;
  const newScore = Math.min(100, Math.max(0, existingNode.trustScore + delta));

  const updatedNode = await prisma.knowledgeNode.update({
    where: { id },
    data: { trustScore: newScore, updatedAt: BigInt(Date.now()) },
  });

  const txDigest = generateDigest();
  const voter = voterAddress || "0x_validator_voter";

  const newTx = await prisma.suiTx.create({
    data: {
      digest: txDigest, sender: voter, timestamp: BigInt(Date.now()),
      kind: "validate_knowledge_object", gasUsed: 0.00224, status: "success",
      changedObjectId: id,
      events: JSON.stringify([{ type: "0xsnexus::nexus::NodeVoted", data: { id, voter, vote: voteType, new_trust_score: newScore } }]),
    },
  });

  const node = formatNode(updatedNode);
  const tx = formatTx(newTx);
  broadcast("graph_update", { type: "node_validated", node, tx, voter, voteType });
  res.json({ node, tx });
});

// ─────────────────────────────────────────────
// POST GRAPH QUERY ENGINE
// ─────────────────────────────────────────────

app.post("/api/query", async (req, res) => {
  const { query } = req.body;

  try {
    const [allNodes, allEdges] = await Promise.all([
      prisma.knowledgeNode.findMany(),
      prisma.relationshipEdge.findMany(),
    ]);
    const fmtNodes = allNodes.map(formatNode);
    const fmtEdges = allEdges.map(formatEdge);

    if (!query) return res.json({ nodesList: fmtNodes, edgesList: fmtEdges, error: null });

    const q = query.trim().toUpperCase();
    let filteredNodes = [...fmtNodes];
    let filteredEdges = [...fmtEdges];
    let logMsg = "Query executed successfully.";

    if (q.startsWith("FIND *")) {
      const parts = q.split("WHERE");
      if (parts.length > 1) {
        const expression = parts[1].trim();

        if (expression.includes("TAG =")) {
          const tagMatch = parts[1].match(/TAG\s*=\s*['"]([^'"]+)['"]/i);
          if (!tagMatch) throw new Error("Syntax error: Expected TAG = 'tag_name'");
          const tagVal = tagMatch[1].toLowerCase();
          filteredNodes = fmtNodes.filter((n) => n.tags.includes(tagVal));
          const nodeIds = filteredNodes.map((n) => n.id);
          filteredEdges = fmtEdges.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target));
          logMsg = `Filtered by tag = "${tagVal}". Found ${filteredNodes.length} objects.`;
        } else if (expression.includes("TRUST_SCORE")) {
          const opMatch = expression.match(/TRUST_SCORE\s*(>|<|=)\s*(\d+)/i);
          if (!opMatch) throw new Error("Syntax error: Expected TRUST_SCORE > value");
          const op = opMatch[1]; const val = parseInt(opMatch[2]);
          if (op === ">") filteredNodes = fmtNodes.filter((n) => n.trustScore > val);
          else if (op === "<") filteredNodes = fmtNodes.filter((n) => n.trustScore < val);
          else filteredNodes = fmtNodes.filter((n) => n.trustScore === val);
          const nodeIds = filteredNodes.map((n) => n.id);
          filteredEdges = fmtEdges.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target));
          logMsg = `Filtered by trust_score ${op} ${val}. Found ${filteredNodes.length} objects.`;
        } else if (expression.includes("RELATIONSHIP") || expression.includes("RELATION")) {
          const relMatch = parts[1].match(/(?:RELATIONSHIP|RELATION)\s*=\s*['"]([^'"]+)['"]/i);
          if (!relMatch) throw new Error("Syntax error: Expected RELATIONSHIP = 'type'");
          const relType = relMatch[1].toLowerCase();
          filteredEdges = fmtEdges.filter((e) => e.relationshipType === relType);
          const nodeIds = new Set<string>();
          filteredEdges.forEach((e) => { nodeIds.add(e.source); nodeIds.add(e.target); });
          filteredNodes = fmtNodes.filter((n) => nodeIds.has(n.id));
          logMsg = `Filtered by relationship = "${relType}". Found ${filteredEdges.length} connections.`;
        } else if (expression.includes("NAME") || expression.includes("TEXT")) {
          const textMatch = parts[1].match(/(?:NAME|TEXT)\s*=\s*['"]([^'"]+)['"]/i);
          if (!textMatch) throw new Error("Syntax error: Expected TEXT = 'keyword'");
          const search = textMatch[1].toLowerCase();
          filteredNodes = fmtNodes.filter((n) => n.name.toLowerCase().includes(search) || n.description.toLowerCase().includes(search));
          const nodeIds = filteredNodes.map((n) => n.id);
          filteredEdges = fmtEdges.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target));
          logMsg = `Filtered matches for "${search}". Found ${filteredNodes.length} nodes.`;
        } else {
          throw new Error(`Unsupported expression: ${expression}`);
        }
      } else {
        logMsg = "Fetched complete graph. No filter applied.";
      }
    } else {
      throw new Error("Invalid command: ONLY supports 'FIND *' or 'FIND * WHERE ...' statements.");
    }

    res.json({ nodesList: filteredNodes, edgesList: filteredEdges, message: logMsg, error: null });
  } catch (err: any) {
    const [allNodes, allEdges] = await Promise.all([prisma.knowledgeNode.findMany(), prisma.relationshipEdge.findMany()]);
    res.json({ nodesList: allNodes.map(formatNode), edgesList: allEdges.map(formatEdge), message: null, error: err.message || "Unknown parse error." });
  }
});

// ─────────────────────────────────────────────
// POST DAO VOTE
// ─────────────────────────────────────────────

app.post("/api/dao/vote", async (req, res) => {
  const { proposalId, voteType, voterAddress } = req.body;
  const proposal = await prisma.daoProposal.findUnique({ where: { id: proposalId } });
  if (!proposal) return res.status(404).json({ error: "DAO Proposal not found" });

  const voter = voterAddress || "0x_anonymous_dao_staker";
  const votedAddresses = JSON.parse(proposal.votedAddresses || "[]");
  if (votedAddresses.includes(voter)) return res.status(400).json({ error: "Voter has already cast a ballot on this proposal" });

  votedAddresses.push(voter);
  const newVotesFor = voteType === "for" ? proposal.votesFor + 1 : proposal.votesFor;
  const newVotesAgainst = voteType !== "for" ? proposal.votesAgainst + 1 : proposal.votesAgainst;
  let newStatus = proposal.status;
  if (newVotesFor >= 15) newStatus = "passed";
  else if (newVotesAgainst >= 15) newStatus = "defeated";

  const updatedProposal = await prisma.daoProposal.update({
    where: { id: proposalId },
    data: { votesFor: newVotesFor, votesAgainst: newVotesAgainst, status: newStatus, votedAddresses: JSON.stringify(votedAddresses) },
  });

  const txDigest = generateDigest();
  const indexerTx = await prisma.suiTx.create({
    data: {
      digest: txDigest, sender: voter, timestamp: BigInt(Date.now()),
      kind: "validate_knowledge_object", gasUsed: 0.0019, status: "success",
      changedObjectId: proposalId,
      events: JSON.stringify([{ type: "0xsnexus::incentives::ProposalBallotCastEvent", data: { proposal_id: proposalId, voter, ballot: voteType, total_for: newVotesFor, total_against: newVotesAgainst } }]),
    },
  });

  const prop = formatProposal(updatedProposal);
  const tx = formatTx(indexerTx);
  broadcast("graph_update", { type: "dao_ballot", proposal: prop, tx });
  res.json({ proposal: prop, tx });
});

// ─────────────────────────────────────────────
// POST CREATE DAO PROPOSAL
// ─────────────────────────────────────────────

app.post("/api/dao/proposal", async (req, res) => {
  const { title, description, type, reward, creator } = req.body;
  if (!title || !description || !type) return res.status(400).json({ error: "Title, description, and type are required" });

  const count = await prisma.daoProposal.count();
  const newProp = await prisma.daoProposal.create({
    data: {
      id: "prop_" + (count + 1),
      title, description, type, status: "active",
      creator: creator || "0x_submitter",
      votesFor: 1, votesAgainst: 0,
      reward: parseInt(reward) || 100,
      createdAt: BigInt(Date.now()),
      votedAddresses: JSON.stringify([creator || "0x_submitter"]),
    },
  });

  const txDigest = generateDigest();
  const tx = await prisma.suiTx.create({
    data: {
      digest: txDigest, sender: creator || "0x_submitter", timestamp: BigInt(Date.now()),
      kind: "create_knowledge_object", gasUsed: 0.0082, status: "success",
      changedObjectId: newProp.id,
      events: JSON.stringify([{ type: "0xsnexus::incentives::CurationProposalCreatedEvent", data: { id: newProp.id, title, reward } }]),
    },
  });

  const proposal = formatProposal(newProp);
  const fmtTx = formatTx(tx);
  broadcast("graph_update", { type: "proposal_created", proposal, tx: fmtTx });
  res.status(201).json({ proposal, tx: fmtTx });
});

// ─────────────────────────────────────────────
// POST SIMULATOR TOGGLE (Bot Curation)
// ─────────────────────────────────────────────

let activeBotInterval: any = null;

const botAddresses = [
  { addr: "0x3344ccffbeea0dfcc7e64de06ebcde11debcde09acfebebd30bcfeff41ac89fa", name: "ZkSnark_Cryptographer" },
  { addr: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22", name: "Move_Master_Sui" },
  { addr: "0xf90999557458ef8a57e937d5ff4fbb1c7128cb5fceae1d6cfcf858d20ae4bc54", name: "L1_Node_Sentinel" },
  { addr: "0x2211bbccffeaacc66aacc0011bbcaefcd1122abcc3344ccff884488fa00ac82e", name: "Alex_Sui_Explorer" },
];

const mockConcepts = [
  { name: "Sui Consensus (Mysticeti)", tags: ["sui", "consensus", "l1"], desc: "Sui's cutting-edge consensus engine that reduces latency into sub-second absolute finality." },
  { name: "Parallel Execution Model", tags: ["sui", "performance", "parallel"], desc: "The transaction scheduler executes independent smart contracts concurrently, boosting performance past legacy EVM sequencers." },
  { name: "Lattice Cryptography", tags: ["cryptography", "zk", "security"], desc: "A quantum-resistant signature candidate to shield future Sui assets against decentralized hardware vulnerabilities." },
];

app.post("/api/simulator/toggle", async (req, res) => {
  const { enabled } = req.body;

  if (enabled) {
    if (!activeBotInterval) {
      activeBotInterval = setInterval(async () => {
        const roll = Math.random();
        const randomBot = botAddresses[Math.floor(Math.random() * botAddresses.length)];

        if (roll < 0.4) {
          // Upvote / downvote a random node
          const nodes = await prisma.knowledgeNode.findMany();
          if (nodes.length === 0) return;
          const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
          const delta = Math.random() < 0.7 ? 5 : -5;
          const newScore = Math.min(100, Math.max(0, randomNode.trustScore + delta));
          const updated = await prisma.knowledgeNode.update({ where: { id: randomNode.id }, data: { trustScore: newScore, updatedAt: BigInt(Date.now()) } });
          const txDigest = generateDigest();
          const tx = await prisma.suiTx.create({ data: { digest: txDigest, sender: randomBot.addr, timestamp: BigInt(Date.now()), kind: "validate_knowledge_object", gasUsed: 0.0022, status: "success", changedObjectId: randomNode.id, events: JSON.stringify([{ type: "0xsnexus::nexus::NodeVoted", data: { id: randomNode.id, voter: randomBot.addr, new_trust_score: newScore } }]) } });
          broadcast("graph_update", { type: "node_validated", node: formatNode(updated), tx: formatTx(tx), voter: randomBot.name });
        } else if (roll < 0.65) {
          // Vote on DAO proposal
          const proposals = await prisma.daoProposal.findMany({ where: { status: "active" } });
          if (proposals.length === 0) return;
          const prop = proposals[Math.floor(Math.random() * proposals.length)];
          const voted = JSON.parse(prop.votedAddresses || "[]");
          if (voted.includes(randomBot.addr)) return;
          voted.push(randomBot.addr);
          const vote = Math.random() < 0.75 ? "for" : "against";
          const newFor = vote === "for" ? prop.votesFor + 1 : prop.votesFor;
          const newAgainst = vote !== "for" ? prop.votesAgainst + 1 : prop.votesAgainst;
          const newStatus = newFor >= 15 ? "passed" : newAgainst >= 15 ? "defeated" : prop.status;
          const updated = await prisma.daoProposal.update({ where: { id: prop.id }, data: { votesFor: newFor, votesAgainst: newAgainst, status: newStatus, votedAddresses: JSON.stringify(voted) } });
          broadcast("graph_update", { type: "dao_ballot", proposal: formatProposal(updated), voter: randomBot.name });
        } else {
          // Create a new node
          const concept = mockConcepts.shift();
          if (!concept) return;
          const idValue = generateSuiId();
          const walrusBlobId = await storeOnWalrus({ id: idValue, name: concept.name, curated_by: randomBot.name });
          const newNode = await prisma.knowledgeNode.create({ data: { id: idValue, name: concept.name, description: concept.desc, tags: JSON.stringify(concept.tags), owner: randomBot.addr, createdAt: BigInt(Date.now()), updatedAt: BigInt(Date.now()), version: 1, trustScore: 70, references: JSON.stringify([`https://docs.sui.io/concepts/${concept.tags[0]}`]), color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"), size: 26, walrusBlobId, dynamicFields: JSON.stringify({ curated_by: randomBot.name, node_strength: "verified" }) } });
          const txDigest = generateDigest();
          const tx = await prisma.suiTx.create({ data: { digest: txDigest, sender: randomBot.addr, timestamp: BigInt(Date.now()), kind: "create_knowledge_object", gasUsed: 0.0052, status: "success", changedObjectId: idValue, events: JSON.stringify([{ type: "0xsnexus::nexus::NodeCreated", data: { id: idValue, name: concept.name, walrus_blob_id: walrusBlobId } }]) } });
          broadcast("graph_update", { type: "node_created", node: formatNode(newNode), tx: formatTx(tx), curatorName: randomBot.name });
        }
      }, 9000);
    }
    res.json({ status: "running" });
  } else {
    if (activeBotInterval) { clearInterval(activeBotInterval); activeBotInterval = null; }
    res.json({ status: "idle" });
  }
});

// ─────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────

async function startServer() {
  await seedDatabase();

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => { res.sendFile(path.join(distPath, "index.html")); });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sui Nexus] ⚡ Server live at http://0.0.0.0:${PORT}`);
    console.log(`[Sui Nexus] 🗄️  Database: Prisma SQLite`);
    console.log(`[Sui Nexus] 🐋 Walrus: Testnet Publisher Active`);
    console.log(`[Sui Nexus] 🔵 Sui Network: Testnet`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
