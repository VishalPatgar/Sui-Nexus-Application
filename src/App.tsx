/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, FormEvent } from "react";
import suiNexusLogo from "./sui-nexus-logo.png";

import { KnowledgeNode, RelationshipEdge, SuiTx, DaoProposal, UserWallet } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import WalletConnect from "./components/WalletConnect";
import GraphCanvas from "./components/GraphCanvas";
import SuiTerminal from "./components/SuiTerminal";
import LedgerExplorer from "./components/LedgerExplorer";
import DaoCuration from "./components/DaoCuration";
import FeatureShowcase from "./components/FeatureShowcase";
import SevenWonders from "./components/SevenWonders";
import {
  Sparkles,
  GitCommit,
  Network,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Plus,
  Compass,
  Coins,
  Send,
  Workflow,
  CheckCircle,
  AlertTriangle,
  Flame,
  Info,
  BookOpen,
  Terminal,
  Activity,
  Award,
  HelpCircle,
  ArrowRight,
  Database,
  Layers,
  ChevronRight,
  ShieldAlert,
  ListFilter,
  Search
} from "lucide-react";

export default function App() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const PACKAGE_ID = "0x0e594ce584b50adc01a4b5b1a6f65c80024b567c4db44ba480cd4dd26e83ea32";

  // L1 Ledger state
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<RelationshipEdge[]>([]);
  const [transactions, setTransactions] = useState<SuiTx[]>([]);
  const [proposals, setProposals] = useState<DaoProposal[]>([]);

  // Navigation tab state (Matches visual sidebar layout)
  // "onboarding" is selected initially to guarantee anyone instantly understands how it works
  const [activeTab, setActiveTab] = useState<"onboarding" | "explorer" | "ide" | "dao" | "ledger" | "wonders">("onboarding");

  // Selection & UI focus state
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [filteredNodeIds, setFilteredNodeIds] = useState<Set<string> | null>(null);
  const [filteredEdgeIds, setFilteredEdgeIds] = useState<Set<string> | null>(null);
  const [queryResultLog, setQueryResultLog] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // User session state
  const [network, setNetwork] = useState("nexus-dev");
  const [wallet, setWallet] = useState<UserWallet>({
    address: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54",
    walletName: "Google zkLogin User",
    balanceSui: 15.45,
    balanceNexus: 80,
    zkProvider: "google",
    zkUsername: "curator_google@gmail.com",
    connected: true
  });

  // Client notifications tracking for multiplayer peer feedback
  const [peerNotifications, setPeerNotifications] = useState<Array<{ id: string; msg: string; type: "success" | "info" | "warn" }>>([]);

  // Simulator indicator
  const [simulatorEnabled, setSimulatorEnabled] = useState(false);

  // Node inputs
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [nodeDesc, setNodeDesc] = useState("");
  const [nodeTags, setNodeTags] = useState("");
  const [nodeReferences, setNodeReferences] = useState("");
  const [nodeColor, setNodeColor] = useState("#00f0ff");

  // Relationship edge inputs
  const [targetNodeId, setTargetNodeId] = useState("");
  const [edgeType, setEdgeType] = useState("extends");
  const [edgeWeight, setEdgeWeight] = useState(50);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [nodeSearchText, setNodeSearchText] = useState("");

  // Metric bento highlights cycling index
  const [activeMetricIdx, setActiveMetricIdx] = useState(0);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setActiveMetricIdx((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(cycleInterval);
  }, []);

  const addNotification = (msg: string, type: "success" | "info" | "warn" = "info") => {
    const id = Date.now().toString() + Math.random().toString();
    setPeerNotifications((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setPeerNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  // Synchronize on-chain data from API
  const refreshData = async () => {
    try {
      const graphRes = await fetch("/api/graph");
      const graph = await graphRes.json();
      setNodes(graph.nodes);
      setEdges(graph.edges);

      const txsRes = await fetch("/api/transactions");
      const txs = await txsRes.json();
      setTransactions(txs);

      const propsRes = await fetch("/api/proposals");
      const props = await propsRes.json();
      setProposals(props);
    } catch (err) {
      console.error("Failed to fetch node states from Express", err);
    }
  };

  // Initial mount: load data & connect Server-Sent Multi-peer events
  useEffect(() => {
    refreshData();

    // Setup Multi-peer EventSource client (Real-time architecture)
    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("graph_update", (e: any) => {
      const payload = JSON.parse(e.data);
      refreshData();

      // Fire a toast alert to indicate on-chain activities from others
      switch (payload.type) {
        case "node_created":
          addNotification(
            `[New Node Linked] ${payload.curatorName || "Validator"} published on-chain fact object: "${payload.node.name}"`,
            "success"
          );
          break;
        case "edge_created":
          addNotification(
            `[Relationship Established] Connected two knowledge structures on-chain with weights`,
            "success"
          );
          break;
        case "node_updated":
          addNotification(
            `[Node Revised] Fact was updated to version #${payload.node.version} by peer`,
            "info"
          );
          break;
        case "node_validated":
          if (payload.voter) {
            addNotification(
              `[Consensus upvote] ${payload.voter} ${payload.voteType}d "${payload.node.name}" (trust: ${payload.node.trustScore})`,
              "info"
            );
          }
          break;
        case "tx_failed":
          addNotification(`[SharedObject Collision] A transaction candidate has aborted due to version collision!`, "warn");
          break;
        case "dao_ballot":
          addNotification(`[DAO ballot Registered] Validator cast a curation vote on DAO Dispute #${payload.proposal.id}`, "info");
          break;
        case "proposal_created":
          addNotification(`[DAO Dispute Lodged] New curation dispute has been submitted of type: ${payload.proposal.type.toUpperCase()}`, "info");
          break;
        default:
          break;
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const handleCreateNode = async (e: FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim() || !nodeDesc.trim()) return;

    const executeMockApi = async (ownerAddr: string) => {
      try {
        const res = await fetch("/api/node", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nodeName,
            description: nodeDesc,
            tags: nodeTags.split(",").map(t => t.trim()),
            owner: ownerAddr,
            references: nodeReferences.split(",").map(r => r.trim()),
            color: nodeColor
          })
        });

        if (res.ok) {
          const data = await res.json();
          setWallet((prev) => ({
            ...prev,
            balanceSui: prev.balanceSui - 0.005,
            balanceNexus: prev.balanceNexus + 10
          }));
          setSelectedNode(data.node);
          setNodeName("");
          setNodeDesc("");
          setNodeTags("");
          setNodeReferences("");
          setShowNodeModal(false);
          refreshData();
          addNotification(`Published "${data.node.name}" successfully to Sui Ledger.`, "success");
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (currentAccount && !simulatorEnabled) {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::nexus::create_node`,
        arguments: [
          tx.pure.string(nodeName),
          tx.pure.string(nodeDesc),
          tx.pure.string(nodeColor)
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            console.log('Transaction successful', result);
            await executeMockApi(currentAccount.address);
          },
          onError: (err) => {
            console.error('Transaction failed', err);
            // @ts-ignore
            addNotification(`Transaction failed: ${err.message}`, "warn");
          }
        }
      );
    } else {
      await executeMockApi(wallet.address);
    }
  };

  const handleUpdateNodeDesc = async () => {
    if (!selectedNode) return;
    try {
      const res = await fetch("/api/node/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNode.id,
          description: editDesc,
          version: selectedNode.version,
          editorAddress: wallet.address
        })
      });

      if (res.ok) {
        const data = await res.json();
        setWallet((prev) => ({
          ...prev,
          balanceSui: prev.balanceSui - 0.004,
          balanceNexus: prev.balanceNexus + 5 // edit bonus
        }));
        setSelectedNode(data.node);
        setIsEditing(false);
        refreshData();
        addNotification("Successfully revised definition object state.", "success");
      } else if (res.status === 409) {
        // optimistical lock failure captured!
        const data = await res.json();
        addNotification("Transaction Collision Detected! The shared object version has diverged.", "warn");
        refreshData();
        // update selected view node to let them fetch latest version
        const freshNode = nodes.find(n => n.id === selectedNode.id);
        if (freshNode) {
          setSelectedNode(freshNode);
          setEditDesc(freshNode.description);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // INTENTIONAL COLLISION TEST FOR PRESENTATION DEMO
  const triggerConflictTest = async () => {
    if (!selectedNode) return;

    try {
      addNotification("Injecting parallel validator update to force collision...", "info");
      
      // Step A: backend silent edit that bumps version on-chain
      await fetch("/api/node/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNode.id,
          description: "This is a concurrent collision-injecting edit from Apt_Curation_Bot.",
          version: selectedNode.version, // matches current version
          editorAddress: "0x8823bcfed77ee92a7e436da7f8ffbdcd1122a6ee5fcfdfef0cbcfce10ae4bb22" // Bot address
        })
      });

      // Step B: Submit outdated version edit from user (who still holds version in component state)
      const userRes = await fetch("/api/node/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNode.id,
          description: "Collision attempt from user wallet context.",
          version: selectedNode.version, // Outdated now because Bot has bumped version!
          editorAddress: wallet.address
        })
      });

      if (userRes.status === 409) {
        // Reverted successfully!
        addNotification("Success: On-Chain optimistic lock collision detected. Outdated transaction rejected & safely rolled back.", "warn");
        refreshData();
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRelationship = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedNode || !targetNodeId) return;

    const executeMockApi = async (ownerAddr: string) => {
      try {
        const res = await fetch("/api/relationship", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: selectedNode.id,
            target: targetNodeId,
            relationshipType: edgeType,
            weight: edgeWeight,
            createdBy: ownerAddr
          })
        });

        if (res.ok) {
          setWallet((prev) => ({
            ...prev,
            balanceSui: prev.balanceSui - 0.003,
            balanceNexus: prev.balanceNexus + 15
          }));
          addNotification(`Linked "${selectedNode.name}" -> target`, "success");
          setTargetNodeId("");
          refreshData();
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (currentAccount && !simulatorEnabled) {
      // In a real app, node ID is an address format or object ID. Here we mock address.
      // But we will send the literal string object ID to the contract
      const tx = new Transaction();
      // Since our mock backend uses string IDs like "n1" but contract expects addresses:
      // We will just pass a dummy address to make the Move contract happy for the demo
      const dummyAddr1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
      const dummyAddr2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
      
      tx.moveCall({
        target: `${PACKAGE_ID}::nexus::create_edge`,
        arguments: [
          tx.pure.address(dummyAddr1),
          tx.pure.address(dummyAddr2),
          tx.pure.string(edgeType),
          tx.pure.u64(edgeWeight),
          tx.pure.string("#ff00ff")
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            console.log('Transaction successful', result);
            await executeMockApi(currentAccount.address);
          },
          onError: (err) => {
            console.error('Transaction failed', err);
            // @ts-ignore
            addNotification(`Transaction failed: ${err.message}`, "warn");
          }
        }
      );
    } else {
      await executeMockApi(wallet.address);
    }
  };

  const handleVoteNode = async (voteType: "upvote" | "downvote") => {
    if (!selectedNode) return;

    try {
      const res = await fetch("/api/node/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNode.id,
          voteType,
          voterAddress: wallet.address
        })
      });

      if (res.ok) {
        const data = await res.json();
        setWallet((prev) => ({
          ...prev,
          balanceSui: prev.balanceSui - 0.002,
          balanceNexus: prev.balanceNexus + 5 // curation yields
        }));
        setSelectedNode(data.node);
        refreshData();
        addNotification(`Cast ${voteType} successfully on-chain.`, "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteQuery = async (queryText: string) => {
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText })
      });

      const data = await res.json();
      if (data.error) {
        setQueryError(data.error);
        setQueryResultLog(null);
        setFilteredNodeIds(null);
        setFilteredEdgeIds(null);
      } else {
        setQueryError(null);
        setQueryResultLog(data.message);

        // Map filter targets for D3 to pulse
        if (queryText && queryText.toUpperCase().trim() !== "FIND *") {
          const matchedNodeIds = new Set<string>(data.nodesList.map((n: any) => n.id));
          const matchedEdgeIds = new Set<string>(data.edgesList.map((e: any) => e.id));
          setFilteredNodeIds(matchedNodeIds);
          setFilteredEdgeIds(matchedEdgeIds);
        } else {
          setFilteredNodeIds(null);
          setFilteredEdgeIds(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCastDaoVote = async (proposalId: string, voteType: "for" | "against") => {
    try {
      const res = await fetch("/api/dao/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          voteType,
          voterAddress: wallet.address
        })
      });

      if (res.ok) {
        setWallet((prev) => ({
          ...prev,
          balanceSui: prev.balanceSui - 0.0019,
          balanceNexus: prev.balanceNexus + 20 // high curation bounty
        }));
        refreshData();
        addNotification("Cast DAO governance ballot successfully.", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeployMoveContract = () => {
    // Reward player with SUI gas for mock execution testing upon deploying core bytecode
    setWallet(prev => ({
      ...prev,
      balanceSui: prev.balanceSui + 10.0,
      balanceNexus: prev.balanceNexus + 30
    }));
    addNotification("Sui Move bytecode published! Claimed developer gas grants of 10.0 SUI", "success");
    refreshData();
  };

  const handleCreateDaoProposal = async (title: string, description: string, type: "dispute" | "bounty", reward: number) => {
    try {
      const res = await fetch("/api/dao/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          reward,
          creator: wallet.address
        })
      });

      if (res.ok) {
        setWallet((prev) => ({
          ...prev,
          balanceSui: prev.balanceSui - 0.008,
          balanceNexus: prev.balanceNexus - 20 // deposit staking
        }));
        refreshData();
        addNotification("Dispute initiated successfully on-chain. Staked 20 NEXUS deposit.", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMultiplayerSimulator = async () => {
    try {
      const targetState = !simulatorEnabled;
      const res = await fetch("/api/simulator/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: targetState })
      });

      if (res.ok) {
        setSimulatorEnabled(targetState);
        addNotification(
          targetState
            ? "Live Validator Nodes Simulation Active! Other contributors will now perform curation tasks."
            : "Simulator Node clusters deactivated.",
          "info"
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Navigational Quick Start Help Trigger
  const jumpToTaskTask = (tab: "explorer" | "ide" | "dao" | "ledger", executeCallback?: () => void) => {
    setActiveTab(tab);
    if (executeCallback) {
      setTimeout(() => {
        executeCallback();
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-150 flex flex-col font-sans relative overflow-x-hidden select-none">
      
      {/* Absolute Ambient Background Lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/12 w-[350px] h-[350px] bg-fuchsia-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 🚀 MAIN DESKTOP RETAILER PANEL (Left Sidebar layout based on modern STOMina design) */}
      <div className="flex flex-1 flex-col md:flex-row min-h-0 relative z-10">
        
        {/* LEFT NAV PANEL - Glassy & Compact */}
        <aside className="w-full md:w-[280px] shrink-0 bg-neutral-950/70 border-r border-white/5 flex flex-col justify-between py-6 px-5 gap-6 backdrop-blur-xl">
          <div className="space-y-6">
            
            {/* Logo */}
            <div className="flex items-center gap-3 px-2">
              <div className="relative flex items-center justify-center">
                <img 
                  src={suiNexusLogo} 
                  alt="Sui Nexus Logo" 
                  className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white tracking-widest text-base font-sans uppercase leading-none">
                  Sui Nexus
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-semibold">Executable Knowledge</span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 px-3.5 block mb-2.5">Workspace Modules</span>
              
              <button
                id="sidebar-onboarding-btn"
                onClick={() => setActiveTab("onboarding")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "onboarding"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold shadow-md shadow-cyan-950/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Onboarding Welcome</span>
                <span className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              </button>

              <button
                id="sidebar-explorer-btn"
                onClick={() => setActiveTab("explorer")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "explorer"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold shadow-md shadow-cyan-950/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Network className="w-4 h-4" />
                <span>Knowledge Graph</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 bg-neutral-900 border border-white/5 text-zinc-400 font-mono font-bold rounded-lg leading-none">
                  {nodes.length}
                </span>
              </button>

              <button
                id="sidebar-wonders-btn"
                onClick={() => setActiveTab("wonders")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "wonders"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold shadow-md shadow-cyan-950/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Seven Wonders</span>
                <span className="ml-auto text-[8px] tracking-wider font-mono font-bold leading-none px-2 py-0.5 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-amber-500/10 border border-cyan-500/20 text-amber-400 rounded-lg">
                  NEW
                </span>
              </button>

              <button
                id="sidebar-ide-btn"
                onClick={() => setActiveTab("ide")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "ide"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold shadow-md shadow-cyan-950/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Move Sandbox / IDE</span>
              </button>

              <button
                id="sidebar-dao-btn"
                onClick={() => setActiveTab("dao")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "dao"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold shadow-md shadow-cyan-950/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>DAO Governance</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 bg-neutral-900 border border-white/5 text-zinc-400 font-mono font-bold rounded-lg leading-none">
                  {proposals.length}
                </span>
              </button>

              <button
                id="sidebar-ledger-btn"
                onClick={() => setActiveTab("ledger")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "ledger"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold shadow-md shadow-cyan-950/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Block Activity Explorer</span>
              </button>

            </div>

            {/* Live Stats Simulator Component closely aligned with image reference layout */}
            <div className="bg-neutral-950/40 border border-white/5 p-4 rounded-xl space-y-3 shadow-inner relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-12 h-12 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest block font-bold">Simulator Pipeline</span>
                <span className={`w-2 h-2 rounded-full ${simulatorEnabled ? "bg-emerald-450 animate-pulse-glow" : "bg-neutral-800"}`} />
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                Unlock multi-user asynchronous curation. Simulates decentralized validators casting ballots and linking fact objects in real-time.
              </p>
              
              <button
                id="sim-toggle-sidebar-btn"
                onClick={toggleMultiplayerSimulator}
                className={`w-full py-2 border rounded-xl text-[10px] font-extrabold tracking-widest uppercase transition-all cursor-pointer ${
                  simulatorEnabled 
                    ? "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40"
                    : "border-white/5 bg-neutral-900 text-zinc-300 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {simulatorEnabled ? "● Stop Peer Simulator" : "Activate Peer Simulator"}
              </button>
            </div>

          </div>

          {/* Quick Footer */}
          <div className="space-y-2 border-t border-white/5 pt-4 px-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono font-bold">
              <span>Sui Native Dev</span>
              <span>v1.0.6-MVP</span>
            </div>
            <p className="text-[9px] text-zinc-600 leading-relaxed">
              Built using Sui Move SDK blueprints and zero-knowledge Google authentication templates.
            </p>
          </div>
        </aside>

        {/* 📚 CENTRAL WORKSPACE CONTAINER */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* TOP HEADER SECTION */}
          <header className="border-b border-white/5 bg-neutral-950/65 backdrop-blur-xl px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-40">
            
            {/* Header left: dynamic page titles */}
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 text-xs font-mono font-medium hidden md:inline">SYSTEM CONTEXT:</span>
              <h2 className="text-sm font-bold tracking-wider text-white font-mono uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                {activeTab === "onboarding" && "Tutorial Walkthrough & Quick Start Dashboard"}
                {activeTab === "explorer" && "Federated Knowledge Graph Canvas"}
                {activeTab === "wonders" && "Seven Wonders of Nexus • Sui VM Mastery Suite"}
                {activeTab === "ide" && "Sui Move IDE & Multi-Field Query CLI"}
                {activeTab === "dao" && "Sui Collaborative DAO Dispute Forum"}
                {activeTab === "ledger" && "Decentralized Transaction Blocks Registry"}
              </h2>
            </div>

            {/* Header Right: Wallet status & Balance indexes */}
            <div className="flex items-center gap-4">
              <WalletConnect />
            </div>
          </header>

          {/* MAIN PAGE VIEW CONTROL */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">

              {/* VIEW 1: ONBOARDING / DASHBOARD */}
              {activeTab === "onboarding" && (
                <motion.div
                  initial={{ opacity: 0, rotateY: -10, scale: 0.95, transformPerspective: 1200 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, transformPerspective: 1200 }}
                  exit={{ opacity: 0, rotateY: 10, scale: 0.95, transformPerspective: 1200 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  
                  {/* HERO HEADER & SEVEN WONDERS ENTRY GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Main Sui Nexus Explanation Card */}
                    <div id="onboarding-hero-card" className="lg:col-span-8 bg-gradient-to-r from-neutral-950 via-zinc-950 to-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
                      
                      {/* 🌠 GEMINI STYLE SHOOTING STAR ANIMATION */}
                      <motion.div
                        className="absolute pointer-events-none z-30"
                        animate={{
                          left: ["-10%", "50%", "50%", "110%", "110%"],
                          top: ["-10%", "50%", "50%", "110%", "110%"],
                          scale: [0.1, 1.3, 1.3, 0.1, 0.1],
                          opacity: [0, 1, 1, 0, 0],
                          x: "-50%",
                          y: "-50%"
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.16, 0.56, 0.72, 1],
                          x: { duration: 0 },
                          y: { duration: 0 }
                        }}
                      >
                        <div className="relative flex items-center justify-center w-16 h-16">
                          {/* Radial Glow Star Halo */}
                          <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-550 to-pink-500 rounded-full blur-xl opacity-90 animate-pulse" />
                          
                          {/* Dynamic tail trailing behind the star — star travels at 45° (lower-right), so tail points at 225° (upper-left) = rotate(225deg) from right */}
                          <div 
                            className="absolute w-36 h-[2.5px] opacity-90"
                            style={{
                              left: "50%",
                              top: "50%",
                              transformOrigin: "0% 50%",
                              transform: "rotate(225deg)",
                              background: "linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(168,85,247,0.6) 35%, transparent 100%)",
                              filter: "blur(0.8px)"
                            }}
                          />
                          {/* Secondary softer wider tail glow for depth */}
                          <div 
                            className="absolute w-28 h-[5px] opacity-40"
                            style={{
                              left: "50%",
                              top: "50%",
                              transformOrigin: "0% 50%",
                              transform: "rotate(225deg)",
                              background: "linear-gradient(90deg, rgba(139,92,246,0.8) 0%, rgba(168,85,247,0.3) 40%, transparent 100%)",
                              filter: "blur(3px)"
                            }}
                          />
                          
                          {/* Precise 4-pointed Gemini vector spark */}
                          <svg 
                            className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.9)] relative z-10" 
                            viewBox="0 0 24 24" 
                            fill="currentColor"
                          >
                            <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" />
                          </svg>
                        </div>
                      </motion.div>
                      
                      <div className="max-w-xl space-y-4">
                        {/* App Logo on homepage hero */}
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={suiNexusLogo}
                              alt="Sui Nexus Logo"
                              className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-[pulse_4s_ease-in-out_infinite]"
                            />
                          </div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 text-[11px] font-mono rounded-full font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Sui Nexus Production Suite</span>
                          </div>
                        </div>
                        
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight font-sans">
                          Sui Nexus: The Decentralized, Collaboratively Curated Knowledge Canvas
                        </h1>
                        
                        <p className="text-zinc-300 text-xs md:text-sm leading-relaxed font-sans">
                          Sui Nexus lets anyone assert scholarly and technical facts as permanent, dynamically upgradeable **Sui Objects**. Connect concepts via transaction-backed relationship edges, and resolve disputes together through decentralised staking votes.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-6">
                        <button
                          id="onboarding-start-btn"
                          onClick={() => setActiveTab("explorer")}
                          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-500 hover:from-cyan-500 hover:via-sky-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/20 flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <span>Explore Knowledge Canvas</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        
                        <button
                          id="onboarding-sandbox-btn"
                          onClick={() => setActiveTab("ide")}
                          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Terminal className="w-4 h-4 text-cyan-400" />
                          <span>Run Move Contract compiles</span>
                        </button>
                      </div>
                    </div>

                    {/* Premium Gold Seven Wonders Entrance Card */}
                    <div 
                      id="onboarding-seven-wonders-entry" 
                      onClick={() => setActiveTab("wonders")}
                      className="lg:col-span-4 bg-gradient-to-br from-amber-950/20 via-[#0c0a06] to-amber-950/40 border border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.08)] flex flex-col justify-between group cursor-pointer hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.18)] transition-all duration-300"
                    >
                      {/* Gold Ambient Glow effects */}
                      <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-300" />
                      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

                      {/* Overlapping gold structural architectural outlines of the 7 world wonders in a continuous seamless slow scrolling flow */}
                      <div className="absolute inset-x-0 bottom-4 h-38 opacity-40 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none overflow-hidden select-none">
                        <motion.div
                          className="flex h-full scale-[1.12] origin-bottom"
                          style={{ width: "200%" }}
                          animate={{
                            x: ["-50%", "0%"]
                          }}
                          transition={{
                            duration: 32,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          <div className="w-1/2 h-full flex items-end justify-around pb-1 shrink-0">
                            <svg className="w-full h-full text-amber-500/85 stroke-current fill-none drop-shadow-[0_0_3px_rgba(245,158,11,0.4)]" viewBox="0 0 440 105">
                              {/* 1. Pyramids of Giza (Detailed multi-pyramid complex with steps and perspective) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <polygon points="12,95 40,40 68,95" />
                                <line x1="40" y1="40" x2="40" y2="95" />
                                <line x1="26" y1="67" x2="40" y2="72" />
                                <line x1="54" y1="67" x2="40" y2="72" />
                                <line x1="19" y1="81" x2="40" y2="86" />
                                <line x1="61" y1="81" x2="40" y2="86" />
                                <polygon points="52,95 70,58 88,95" opacity="0.5" />
                                <line x1="70" y1="58" x2="70" y2="95" opacity="0.5" />
                              </g>
                              
                              {/* 2. Petra (Detailed rock-cut treasury facade with columns and pediment) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <line x1="90" y1="95" x2="135" y2="95" />
                                <line x1="94" y1="92" x2="131" y2="92" />
                                <rect x="96" y="58" width="4" height="34" />
                                <rect x="125" y="58" width="4" height="34" />
                                <rect x="105" y="58" width="3" height="34" />
                                <rect x="117" y="58" width="3" height="34" />
                                <rect x="94" y="52" width="37" height="6" />
                                <polygon points="94,52 112.5,38 131,52" />
                                <rect x="110" y="44" width="5" height="8" />
                                <path d="M 109 92 L 109 76 C 109 74 116 74 116 76 L 116 92" />
                              </g>

                              {/* 3. Taj Mahal (Detailed Mughal dome with symmetric minarets and arches) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <rect x="145" y="90" width="55" height="5" />
                                <rect x="152" y="62" width="41" height="28" />
                                <path d="M 164 90 L 164 74 C 164 68 181 68 181 74 L 181 90" />
                                <path d="M 160 62 C 160 48 165 42 172.5 42 C 180 42 185 48 185 62 Z" />
                                <line x1="172.5" y1="42" x2="172.5" y2="34" />
                                <path d="M 153 62 C 153 53 155 50 157.5 50 C 160 50 162 53 162 62 Z" />
                                <path d="M 183 62 C 183 53 185 50 187.5 50 C 190 50 192 53 192 62 Z" />
                                <line x1="147" y1="90" x2="147" y2="52" />
                                <rect x="145" y="48" width="5" height="4" />
                                <line x1="198" y1="90" x2="198" y2="52" />
                                <rect x="196" y="48" width="5" height="4" />
                              </g>

                              {/* 4. Colosseum (Teeming arches and characteristic radial sloped crumbling top) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <line x1="208" y1="95" x2="252" y2="95" />
                                <path d="M 210,95 L 210,50 C 220,44 240,48 250,56 L 250,95 Z" />
                                <path d="M 210,65 C 220,60 240,64 250,72" strokeDasharray="2,2" />
                                <path d="M 210,80 C 220,75 240,79 250,87" />
                                <path d="M 213,95 C 213,88 217,88 217,95" />
                                <path d="M 221,95 C 221,88 225,88 225,95" />
                                <path d="M 229,95 C 229,88 233,88 233,95" />
                                <path d="M 237,95 C 237,88 241,88 241,95" />
                                <path d="M 245,95 C 245,88 249,88 249,95" />
                                <path d="M 214,80 C 214,74 218,74 218,80" />
                                <path d="M 222,81 C 222,75 226,75 226,81" />
                                <path d="M 230,82 C 230,76 234,76 234,82" />
                                <path d="M 238,83 C 238,77 242,77 242,83" />
                                <path d="M 246,84 C 246,78 250,78 250,84" />
                              </g>

                              {/* 5. Chichen Itza (Detailed stepped Mayan temple with central stairway) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <polygon points="260,95 264,88 300,88 304,95" />
                                <polygon points="264,88 268,81 296,81 300,88" />
                                <polygon points="268,81 272,74 292,74 296,81" />
                                <polygon points="272,74 276,67 288,67 292,74" />
                                <polygon points="279,95 281,67 283,67 285,95" />
                                <line x1="279" y1="95" x2="281" y2="67" />
                                <line x1="285" y1="95" x2="283" y2="67" />
                                <rect x="279" y="58" width="6" height="9" />
                                <polygon points="278,58 282,53 286,58" />
                              </g>
                              
                              {/* 6. Christ the Redeemer (Stately pose with detailed platform & pedestal) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <path d="M 315 95 C 320 90 325 80 330 80 C 335 80 340 90 345 95 Z" opacity="0.6" />
                                <rect x="326" y="72" width="8" height="12" />
                                <line x1="330" y1="72" x2="330" y2="44" strokeWidth="1.5" />
                                <path d="M 328 72 L 329 44 L 331 44 L 332 72 Z" />
                                <line x1="316" y1="48" x2="344" y2="48" strokeWidth="1.2" />
                                <line x1="316" y1="48" x2="316" y2="52" />
                                <line x1="344" y1="48" x2="344" y2="52" />
                                <circle cx="330" cy="40" r="2.5" />
                              </g>

                              {/* 7. Great Wall of China (Winding ramparts with crenellations and watchtower) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <path d="M 360 85 C 375 75 390 92 415 70" opacity="0.4" />
                                <path d="M 360 89 L 372 81 L 385 85 L 398 77 L 415 74" fill="none" strokeWidth="1.5" />
                                <path d="M 360 93 L 372 85 L 385 89 L 398 81 L 415 78" fill="none" strokeWidth="1.5" />
                                <line x1="372" y1="81" x2="372" y2="85" />
                                <line x1="385" y1="85" x2="385" y2="89" />
                                <line x1="398" y1="77" x2="398" y2="81" />
                                <rect x="382" y="65" width="12" height="15" />
                                <path d="M 382 65 L 382 62 L 385 62 L 385 65 L 388 65 L 388 62 L 391 62 L 391 65 L 394 65 L 394 62 L 394 65" />
                                <path d="M 386 80 L 386 73 C 386 71 390 71 390 73 L 390 80" />
                              </g>
                            </svg>
                          </div>
                          <div className="w-1/2 h-full flex items-end justify-around pb-1 shrink-0">
                            <svg className="w-full h-full text-amber-500/85 stroke-current fill-none drop-shadow-[0_0_3px_rgba(245,158,11,0.4)]" viewBox="0 0 440 105">
                              {/* 1. Pyramids of Giza (Detailed multi-pyramid complex with steps and perspective) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <polygon points="12,95 40,40 68,95" />
                                <line x1="40" y1="40" x2="40" y2="95" />
                                <line x1="26" y1="67" x2="40" y2="72" />
                                <line x1="54" y1="67" x2="40" y2="72" />
                                <line x1="19" y1="81" x2="40" y2="86" />
                                <line x1="61" y1="81" x2="40" y2="86" />
                                <polygon points="52,95 70,58 88,95" opacity="0.5" />
                                <line x1="70" y1="58" x2="70" y2="95" opacity="0.5" />
                              </g>
                              
                              {/* 2. Petra (Detailed rock-cut treasury facade with columns and pediment) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <line x1="90" y1="95" x2="135" y2="95" />
                                <line x1="94" y1="92" x2="131" y2="92" />
                                <rect x="96" y="58" width="4" height="34" />
                                <rect x="125" y="58" width="4" height="34" />
                                <rect x="105" y="58" width="3" height="34" />
                                <rect x="117" y="58" width="3" height="34" />
                                <rect x="94" y="52" width="37" height="6" />
                                <polygon points="94,52 112.5,38 131,52" />
                                <rect x="110" y="44" width="5" height="8" />
                                <path d="M 109 92 L 109 76 C 109 74 116 74 116 76 L 116 92" />
                              </g>

                              {/* 3. Taj Mahal (Detailed Mughal dome with symmetric minarets and arches) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <rect x="145" y="90" width="55" height="5" />
                                <rect x="152" y="62" width="41" height="28" />
                                <path d="M 164 90 L 164 74 C 164 68 181 68 181 74 L 181 90" />
                                <path d="M 160 62 C 160 48 165 42 172.5 42 C 180 42 185 48 185 62 Z" />
                                <line x1="172.5" y1="42" x2="172.5" y2="34" />
                                <path d="M 153 62 C 153 53 155 50 157.5 50 C 160 50 162 53 162 62 Z" />
                                <path d="M 183 62 C 183 53 185 50 187.5 50 C 190 50 192 53 192 62 Z" />
                                <line x1="147" y1="90" x2="147" y2="52" />
                                <rect x="145" y="48" width="5" height="4" />
                                <line x1="198" y1="90" x2="198" y2="52" />
                                <rect x="196" y="48" width="5" height="4" />
                              </g>

                              {/* 4. Colosseum (Teeming arches and characteristic radial sloped crumbling top) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <line x1="208" y1="95" x2="252" y2="95" />
                                <path d="M 210,95 L 210,50 C 220,44 240,48 250,56 L 250,95 Z" />
                                <path d="M 210,65 C 220,60 240,64 250,72" strokeDasharray="2,2" />
                                <path d="M 210,80 C 220,75 240,79 250,87" />
                                <path d="M 213,95 C 213,88 217,88 217,95" />
                                <path d="M 221,95 C 221,88 225,88 225,95" />
                                <path d="M 229,95 C 229,88 233,88 233,95" />
                                <path d="M 237,95 C 237,88 241,88 241,95" />
                                <path d="M 245,95 C 245,88 249,88 249,95" />
                                <path d="M 214,80 C 214,74 218,74 218,80" />
                                <path d="M 222,81 C 222,75 226,75 226,81" />
                                <path d="M 230,82 C 230,76 234,76 234,82" />
                                <path d="M 238,83 C 238,77 242,77 242,83" />
                                <path d="M 246,84 C 246,78 250,78 250,84" />
                              </g>

                              {/* 5. Chichen Itza (Detailed stepped Mayan temple with central stairway) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <polygon points="260,95 264,88 300,88 304,95" />
                                <polygon points="264,88 268,81 296,81 300,88" />
                                <polygon points="268,81 272,74 292,74 296,81" />
                                <polygon points="272,74 276,67 288,67 292,74" />
                                <polygon points="279,95 281,67 283,67 285,95" />
                                <line x1="279" y1="95" x2="281" y2="67" />
                                <line x1="285" y1="95" x2="283" y2="67" />
                                <rect x="279" y="58" width="6" height="9" />
                                <polygon points="278,58 282,53 286,58" />
                              </g>
                              
                              {/* 6. Christ the Redeemer (Stately pose with detailed platform & pedestal) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <path d="M 315 95 C 320 90 325 80 330 80 C 335 80 340 90 345 95 Z" opacity="0.6" />
                                <rect x="326" y="72" width="8" height="12" />
                                <line x1="330" y1="72" x2="330" y2="44" strokeWidth="1.5" />
                                <path d="M 328 72 L 329 44 L 331 44 L 332 72 Z" />
                                <line x1="316" y1="48" x2="344" y2="48" strokeWidth="1.2" />
                                <line x1="316" y1="48" x2="316" y2="52" />
                                <line x1="344" y1="48" x2="344" y2="52" />
                                <circle cx="330" cy="40" r="2.5" />
                              </g>

                              {/* 7. Great Wall of China (Winding ramparts with crenellations and watchtower) */}
                              <g strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                                <path d="M 360 85 C 375 75 390 92 415 70" opacity="0.4" />
                                <path d="M 360 89 L 372 81 L 385 85 L 398 77 L 415 74" fill="none" strokeWidth="1.5" />
                                <path d="M 360 93 L 372 85 L 385 89 L 398 81 L 415 78" fill="none" strokeWidth="1.5" />
                                <line x1="372" y1="81" x2="372" y2="85" />
                                <line x1="385" y1="85" x2="385" y2="89" />
                                <line x1="398" y1="77" x2="398" y2="81" />
                                <rect x="382" y="65" width="12" height="15" />
                                <path d="M 382 65 L 382 62 L 385 62 L 385 65 L 388 65 L 388 62 L 391 62 L 391 65 L 394 65 L 394 62 L 394 65" />
                                <path d="M 386 80 L 386 73 C 386 71 390 71 390 73 L 390 80" />
                              </g>
                            </svg>
                          </div>
                        </motion.div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-mono rounded-lg uppercase tracking-wider font-extrabold">
                            Sui VM Wonders
                          </div>
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xl md:text-2xl font-black text-white font-sans uppercase tracking-wide group-hover:text-amber-300 transition-colors">
                            Move Stack Wonders
                          </h3>
                          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-sans">
                            Experience 7 interactive Move VM design paradigms live: zkLogin session keys, DeepBook order books, dynamic fields, and zero-gas sponsored transactions.
                          </p>
                        </div>
                      </div>

                      <div className="pt-8 flex items-center justify-between border-t border-amber-500/10 mt-auto">
                        <span className="text-[10px] uppercase font-mono font-black text-amber-400 tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Enter Sandbox</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">7 Engines</span>
                      </div>
                    </div>

                  </div>

                  {/* HIGH-LEVEL METRICS / COLLABORATION COUNTERS BENTO */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* CARD 0: TOTAL KNOWLEDGE ENTRIES */}
                    <div className={`relative overflow-hidden bg-neutral-950 border p-5 rounded-2xl flex items-center justify-between transition-all duration-500 ${activeMetricIdx === 0 ? "border-zinc-300 bg-zinc-900/10 shadow-[0_0_15px_rgba(255,255,255,0.08)] scale-[1.01]" : "border-neutral-905 hover:border-neutral-800"}`}>
                      {activeMetricIdx === 0 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                          <motion.rect
                            x="1.5"
                            y="1.5"
                            width="calc(100% - 3px)"
                            height="calc(100% - 3px)"
                            rx="15"
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.45"
                            style={{ filter: "blur(2.5px)" }}
                            pathLength="100"
                            strokeDasharray="4 96"
                            animate={{ strokeDashoffset: [100, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                          <motion.rect
                            x="1.5"
                            y="1.5"
                            width="calc(100% - 3px)"
                            height="calc(100% - 3px)"
                            rx="15"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            pathLength="100"
                            strokeDasharray="2 98"
                            animate={{ strokeDashoffset: [100, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                        </svg>
                      )}
                      <div className="space-y-1 relative z-10">
                        <span className="text-[10px] text-zinc-500 font-mono block uppercase tracking-wider">TOTAL KNOWLEDGE ENTRIES</span>
                        <span className="text-2xl font-extrabold text-white font-mono">{nodes.length}</span>
                        <span className="text-[10.5px] text-emerald-400 block font-mono">✦ Ready for curation</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/30 flex items-center justify-center border border-cyan-800/20 text-cyan-400 relative z-10">
                        <Database className="w-5 h-5" />
                      </div>
                    </div>
                                 {/* CARD 1: RELATIONSHIP LINKS */}
                    <div className={`relative overflow-hidden bg-neutral-950 border p-5 rounded-2xl flex items-center justify-between transition-all duration-500 ${activeMetricIdx === 1 ? "border-zinc-300 bg-zinc-900/10 shadow-[0_0_15px_rgba(255,255,255,0.08)] scale-[1.01]" : "border-neutral-905 hover:border-neutral-800"}`}>
                      {activeMetricIdx === 1 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                          <motion.rect
                            x="1.5"
                            y="1.5"
                            width="calc(100% - 3px)"
                            height="calc(100% - 3px)"
                            rx="15"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.45"
                            style={{ filter: "blur(2.5px)" }}
                            pathLength="100"
                            strokeDasharray="4 96"
                            animate={{ strokeDashoffset: [100, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                          <motion.rect
                            x="1.5"
                            y="1.5"
                            width="calc(100% - 3px)"
                            height="calc(100% - 3px)"
                            rx="15"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            pathLength="100"
                            strokeDasharray="2 98"
                            animate={{ strokeDashoffset: [100, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                        </svg>
                      )}
                      <div className="space-y-1 relative z-10">
                        <span className="text-[10px] text-zinc-500 font-mono block uppercase tracking-wider">RELATIONSHIP LINKS</span>
                        <span className="text-2xl font-extrabold text-white font-mono">{edges.length}</span>
                        <span className="text-[10.5px] text-cyan-400 block font-mono">✦ Synced semantic edges</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/30 flex items-center justify-center border border-sky-800/20 text-sky-400 relative z-10">
                        <Network className="w-5 h-5" />
                      </div>
                    </div>
                               {/* CARD 2: DAO DISPUTES */}
                    <div className={`relative overflow-hidden bg-neutral-950 border p-5 rounded-2xl flex items-center justify-between transition-all duration-500 ${activeMetricIdx === 2 ? "border-zinc-300 bg-zinc-900/10 shadow-[0_0_15px_rgba(255,255,255,0.08)] scale-[1.01]" : "border-neutral-905 hover:border-neutral-800"}`}>
                      {activeMetricIdx === 2 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                          <motion.rect
                            x="1.5"
                            y="1.5"
                            width="calc(100% - 3px)"
                            height="calc(100% - 3px)"
                            rx="15"
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.45"
                            style={{ filter: "blur(2.5px)" }}
                            pathLength="100"
                            strokeDasharray="4 96"
                            animate={{ strokeDashoffset: [100, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                          <motion.rect
                            x="1.5"
                            y="1.5"
                            width="calc(100% - 3px)"
                            height="calc(100% - 3px)"
                            rx="15"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            pathLength="100"
                            strokeDasharray="2 98"
                            animate={{ strokeDashoffset: [100, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                        </svg>
                      )}
                      <div className="space-y-1 relative z-10">
                        <span className="text-[10px] text-zinc-500 font-mono block uppercase tracking-wider">DAO DISPUTES</span>
                        <span className="text-2xl font-extrabold text-white font-mono">{proposals.length}</span>
                        <span className="text-[10.5px] text-pink-400 block font-mono">✦ Active curation proposals</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/30 flex items-center justify-center border border-pink-800/20 text-pink-400 relative z-10">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                             {/* CARD 3: LEDGER BLOCK STATUS */}
                    <div className={`relative overflow-hidden bg-neutral-950 border p-5 rounded-2xl flex items-center justify-between transition-all duration-500 ${activeMetricIdx === 3 ? "border-zinc-300 bg-zinc-900/10 shadow-[0_0_15px_rgba(255,255,255,0.08)] scale-[1.01]" : "border-neutral-905 hover:border-neutral-800"}`}>
                      {activeMetricIdx === 3 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                          <motion.rect
                            x="1.5"
                            y="1.5"
                            width="calc(100% - 3px)"
                            height="calc(100% - 3px)"
                            rx="15"
                            fill="none"
                            stroke="#34d399"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.45"
                            style={{ filter: "blur(2.5px)" }}
                            pathLength="100"
                            strokeDasharray="4 96"
                            animate={{ strokeDashoffset: [100, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                          <motion.rect
                            x="1.5"
                            y="1.5"
                            width="calc(100% - 3px)"
                            height="calc(100% - 3px)"
                            rx="15"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            pathLength="100"
                            strokeDasharray="2 98"
                            animate={{ strokeDashoffset: [100, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                        </svg>
                      )}
                      <div className="space-y-1 relative z-10">
                        <span className="text-[10px] text-zinc-500 font-mono block uppercase tracking-wider">LEDGER BLOCK STATUS</span>
                        <span className="text-xs font-semibold text-emerald-400 font-mono bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30 inline-block">● Mysticeti L1 Live</span>
                        <span className="text-[10.5px] text-zinc-400 block font-mono mt-1">TPS: 297,000 max capacity</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/30 flex items-center justify-center border border-neutral-800 text-zinc-400 relative z-10">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>

                  </div>

                  {/* ANIMATED PRODUCT VIDEO DEMO SHOWCASE */}
                  <FeatureShowcase />

                  {/* STEP-BY-STEP INTERACTIVE QUICK START WIZARD (No Feature Missing out!) */}
                  <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Curator's Interactive Sandbox Walkthrough</h3>
                        <p className="text-[11.5px] text-zinc-400">We guide you through the 5 essential curation milestones to become a high-yield Sui Nexus expert!</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      
                      {/* Step 1 */}
                      <div className="bg-neutral-900/40 border border-neutral-850 p-4.5 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden">
                        <span className="absolute top-2 right-3 font-mono text-2xl font-extrabold text-neutral-800/40">01</span>
                        <div className="space-y-1.5">
                          <h4 className="text-[11.5px] font-bold text-white">Connect Sui Wallet</h4>
                          <p className="text-[10.5px] text-neutral-400 leading-normal">Connect your Sui wallet (e.g. Sui Wallet extension) to sign on-chain transactions.</p>
                        </div>
                        {currentAccount ? (
                          <span className="text-[10.5px] bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 px-2 py-1 rounded-lg text-center font-mono">
                            ✓ Wallet Connected: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              // Programmatically click the ConnectButton rendered by dapp-kit in the header
                              const connectBtn = document.querySelector('[data-testid="connect-button"], #wallet-module button') as HTMLButtonElement;
                              if (connectBtn) {
                                connectBtn.click();
                              } else {
                                addNotification("Click the 'Connect Wallet' button in the top-right header to connect your Sui wallet.", "info");
                              }
                            }}
                            className="w-full py-1 text-center bg-cyan-950 text-cyan-400 border border-cyan-900 rounded-xl hover:bg-cyan-900 hover:text-white transition-all text-[11px] font-bold cursor-pointer"
                          >
                            Connect Wallet →
                          </button>
                        )}
                      </div>

                      {/* Step 2 */}
                      <div className="bg-neutral-900/40 border border-neutral-850 p-4.5 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden">
                        <span className="absolute top-2 right-3 font-mono text-2xl font-extrabold text-neutral-800/40">02</span>
                        <div className="space-y-1.5">
                          <h4 className="text-[11.5px] font-bold text-white">Fuel SUI GAS</h4>
                          <p className="text-[10.5px] text-neutral-400 leading-normal">Compile SUI bytecode on package compilation terminal to receive 10.0 test SUI.</p>
                        </div>
                        <button
                          onClick={() => jumpToTaskTask("ide")}
                          className="w-full py-1 text-center bg-zinc-900 hover:bg-zinc-850 border border-neutral-800 text-zinc-300 rounded-xl transition-all text-[11px] font-bold cursor-pointer"
                        >
                          Go to Compiler IDE
                        </button>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-neutral-900/40 border border-neutral-850 p-4.5 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden">
                        <span className="absolute top-2 right-3 font-mono text-2xl font-extrabold text-neutral-800/40">03</span>
                        <div className="space-y-1.5">
                          <h4 className="text-[11.5px] font-bold text-white">Create Knowledge</h4>
                          <p className="text-[10.5px] text-neutral-400 leading-normal">Instantly mint an on-chain Fact object with visual categorizations.</p>
                        </div>
                        <button
                          onClick={() => jumpToTaskTask("explorer", () => setShowNodeModal(true))}
                          className="w-full py-1 text-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all text-[11px] font-bold cursor-pointer"
                        >
                          + Mint Fact Node
                        </button>
                      </div>

                      {/* Step 4 */}
                      <div className="bg-neutral-900/40 border border-neutral-850 p-4.5 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden">
                        <span className="absolute top-2 right-3 font-mono text-2xl font-extrabold text-neutral-800/40">04</span>
                        <div className="space-y-1.5">
                          <h4 className="text-[11.5px] font-bold text-white">Validate & Link</h4>
                          <p className="text-[10.5px] text-neutral-400 leading-normal">Cast upvotes or connect nodes on our interactive D3 force canvas.</p>
                        </div>
                        <button
                          onClick={() => jumpToTaskTask("explorer")}
                          className="w-full py-1 text-center bg-zinc-900 hover:bg-zinc-850 border border-neutral-800 text-zinc-300 rounded-xl transition-all text-[11px] font-bold cursor-pointer"
                        >
                          Curation Canvas
                        </button>
                      </div>

                      {/* Step 5 */}
                      <div className="bg-neutral-900/40 border border-neutral-850 p-4.5 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden">
                        <span className="absolute top-2 right-3 font-mono text-2xl font-extrabold text-neutral-800/40">05</span>
                        <div className="space-y-1.5">
                          <h4 className="text-[11.5px] font-bold text-white">Multiplayer Activity</h4>
                          <p className="text-[10.5px] text-neutral-400 leading-normal">Activate peer simulator to watch live validator blocks flow.</p>
                        </div>
                        <button
                          onClick={toggleMultiplayerSimulator}
                          className={`w-full py-1 text-center rounded-xl transition-all text-[11px] font-bold cursor-pointer ${
                            simulatorEnabled
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-neutral-800 hover:bg-neutral-750 text-zinc-300 border border-transparent"
                          }`}
                        >
                          {simulatorEnabled ? "● ACTIVE" : "Toggle Simulator"}
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* EXPLAINER ON THE ARCHITECTURE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl space-y-4">
                      <h4 className="text-zinc-200 font-bold flex items-center gap-2 text-xs uppercase tracking-wider font-mono">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span>Sui Shared Object State Protection</span>
                      </h4>
                      <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                        Each Fact Object contains a specific state version index. When multiple concurrent validators attempt to submit revisions at the same time, the system uses **Optimistic Version Lock concurrency validation** to protect truth indices from double-write issues:
                      </p>
                      
                      <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-850 text-[11px] text-neutral-400 font-mono space-y-2">
                        <div className="flex gap-2 items-center">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Normal: Validates sequence, increments version from #1 ➔ #2</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>Collision: Rejected when version indices conflict! Rollbacks automatically.</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-500">
                        *Try forcing a version mismatch by clicking on any canvas node ➔ press "Revise Definition" ➔ and click "Force Collision" to watch the automatic consensus rollback of outdated objects.*
                      </p>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl space-y-4">
                      <h4 className="text-zinc-200 font-bold flex items-center gap-2 text-xs uppercase tracking-wider font-mono">
                        <ShieldAlert className="w-4 h-4 text-pink-400" />
                        <span>DAO disputes consensus governing</span>
                      </h4>
                      <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                        True knowledge is decentralised. If a published Fact node contains false technical code, bad evidence citations, or duplicates, any curator with positive **NEXUS** tokens can lock a dispute on the system's index:
                      </p>

                      <ul className="text-[11px] text-neutral-400 leading-normal space-y-2 list-disc pl-5">
                        <li>Initiator locks a staking deposit (20 NEXUS) on the Move incentives contract.</li>
                        <li>Other validators research Citations and cast ballots inside the Curation tab.</li>
                        <li>Resolving a proposal redistributes staked bounties to curating validators correctly.</li>
                      </ul>

                      <div className="pt-2">
                        <button
                          onClick={() => setActiveTab("dao")}
                          className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-xs font-semibold rounded-xl text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Go to active DAO Curation disputes</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                </motion.div>
              )}

              {/* VIEW 2: GRAPH EXPLORER */}
              {activeTab === "explorer" && (
                <motion.div
                  initial={{ opacity: 0, rotateY: -10, scale: 0.95, transformPerspective: 1200 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, transformPerspective: 1200 }}
                  exit={{ opacity: 0, rotateY: 10, scale: 0.95, transformPerspective: 1200 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0"
                >
                  {/* DIRECTORY SIDE PANEL COLUMN */}
                  <div className="lg:col-span-2 flex flex-col gap-4 bg-neutral-950 border border-neutral-900 rounded-3xl p-4 max-h-[660px]">
                    <div className="space-y-1 pb-2 border-b border-neutral-900">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <ListFilter className="w-4 h-4 text-cyan-400" />
                        <span>Knowledge Directory</span>
                      </h3>
                      <p className="text-[10px] text-zinc-500">Quickly browse & search all knowledge assets</p>
                    </div>

                    {/* Search input bar */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search components, tags, desc..."
                        value={nodeSearchText}
                        onChange={(e) => setNodeSearchText(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 py-1.5 text-zinc-205 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 text-xs font-sans"
                      />
                      {nodeSearchText && (
                        <button
                          onClick={() => setNodeSearchText("")}
                          className="absolute right-2.5 top-2 text-zinc-500 hover:text-white text-xs cursor-pointer font-bold px-1"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Search results list with scroll bar */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                      {nodes.filter(n => {
                        const q = nodeSearchText.toLowerCase();
                        return n.name.toLowerCase().includes(q) ||
                               n.description.toLowerCase().includes(q) ||
                               n.tags.some(t => t.toLowerCase().includes(q));
                      }).length === 0 ? (
                        <div className="text-center py-10 text-zinc-600 text-xs italic font-sans animate-pulse">
                          No concepts matched query.
                        </div>
                      ) : (
                        nodes.filter(n => {
                          const q = nodeSearchText.toLowerCase();
                          return n.name.toLowerCase().includes(q) ||
                                 n.description.toLowerCase().includes(q) ||
                                 n.tags.some(t => t.toLowerCase().includes(q));
                        }).map(n => {
                          const isSelected = selectedNode?.id === n.id;
                          return (
                            <button
                              key={n.id}
                              onClick={() => {
                                setSelectedNode(n);
                                setIsEditing(false);
                                setEditDesc(n.description);
                              }}
                              className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                                isSelected
                                  ? "bg-cyan-950/25 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.12)]"
                                  : "bg-neutral-900/40 border-neutral-850 hover:bg-neutral-900/85 hover:border-neutral-800"
                              }`}
                            >
                              <div className="flex justify-between items-center w-full gap-2">
                                <div className="flex items-center gap-1.5 truncate">
                                  {isSelected && (
                                    <span className="w-2 h-2 rounded-full shrink-0 animate-ping absolute opacity-50 bg-cyan-400" />
                                  )}
                                  <span className="w-2 h-2 rounded-full shrink-0 relative" style={{ backgroundColor: n.color || "#00f0ff" }} />
                                  <span className={`text-[11.5px] font-bold truncate ${isSelected ? "text-cyan-400 font-mono" : "text-zinc-300 font-sans"}`}>
                                    {n.name}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-cyan-400 shrink-0">
                                  ★ {n.trustScore}
                                </span>
                              </div>

                              {/* Only show full details when clicked (isSelected is true) */}
                              {isSelected && (
                                <div className="text-[10.5px] space-y-1.5 mt-1 pt-1 border-t border-cyan-900/20 select-text">
                                  <p className="text-zinc-400 leading-normal text-left font-sans">
                                    {n.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {n.tags.map(tag => (
                                      <span key={tag} className="text-[8.5px] font-mono text-cyan-400/80 px-1.5 py-0.5 bg-cyan-950/45 rounded border border-cyan-900/30">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* CANVAS COLUMN */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    
                    {/* Graph Title & Inline Help */}
                    <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">D3 Collaboration Graph Playground</h3>
                        <p className="text-[11px] text-zinc-400">Click a node to inspect dynamic properties, cast curating votes, or establish relationship lines.</p>
                      </div>

                      <button
                        onClick={() => setShowNodeModal(true)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-950/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Mint New Fact Node</span>
                      </button>
                    </div>

                    <GraphCanvas
                      nodes={nodes}
                      edges={edges}
                      selectedNode={selectedNode}
                      onSelectNode={(node) => {
                        setSelectedNode(node);
                        setIsEditing(false);
                        if (node) {
                          setEditDesc(node.description);
                        }
                      }}
                      onAddNodeClick={() => setShowNodeModal(true)}
                      filteredNodeIds={filteredNodeIds}
                      filteredEdgeIds={filteredEdgeIds}
                      onVoteNode={handleVoteNode}
                      sidePanel={
                        <div id="inspector-container-fullscreen" className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 shadow-lg flex flex-col min-h-[400px] h-full">
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-3 mb-4">
                            <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Active Fact Inspector</h3>
                            {selectedNode && (
                              <span className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-900/30 px-2 py-0.5 rounded font-mono">
                                SELECTED
                              </span>
                            )}
                          </div>
                          
                          {selectedNode ? (
                            <div className="flex-1 flex flex-col justify-between" id="selected-node-inspector-fs">
                              {/* Node Identity */}
                              <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedNode.color || "#00f0ff" }} />
                                      <span>{selectedNode.name}</span>
                                    </h4>
                                    <span className="text-[9.5px] font-mono text-zinc-500 block select-all">
                                      UID: {selectedNode.id.substring(0, 18)}...
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs bg-emerald-950/20 border border-emerald-930/40 px-2 py-0.5 rounded-lg shrink-0">
                                    <span>★ {selectedNode.trustScore}</span>
                                  </div>
                                </div>

                                {/* Render Tags */}
                                <div className="flex flex-wrap gap-1">
                                  {selectedNode.tags.map((t) => (
                                    <span key={t} className="text-[9px] bg-neutral-900 border border-neutral-850 text-zinc-400 px-2 py-0.5 rounded font-mono">
                                      #{t}
                                    </span>
                                  ))}
                                </div>

                                {/* Object Version & Owner */}
                                <div className="grid grid-cols-2 gap-3 text-[10px] text-zinc-400 font-mono border-y border-neutral-900 py-3">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-neutral-500">OBJECT VERSION</span>
                                    <span className="text-neutral-200 font-bold text-sky-400"># {selectedNode.version}</span>
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-neutral-500">OWNER ADDR</span>
                                    <span className="text-neutral-300 font-semibold truncate select-all">
                                      {selectedNode.owner.substring(0, 8)}...{selectedNode.owner.substring(selectedNode.owner.length - 6)}
                                    </span>
                                  </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                  <span className="text-[10px] text-zinc-500 font-mono">METADATA FACT CONTENT:</span>
                                  <p className="text-zinc-300 text-xs leading-relaxed font-sans bg-neutral-900/40 p-3 rounded-xl border border-neutral-902 text-left">
                                    {selectedNode.description}
                                  </p>
                                </div>

                                {/* References */}
                                {selectedNode.references && selectedNode.references.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-zinc-500 font-mono block">PROOF SOURCE CITATIONS:</span>
                                    <div className="space-y-1 text-[10px] font-mono">
                                      {selectedNode.references.map((ref, i) => (
                                        <a key={i} href={ref} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                                          <span>➜ {ref.length > 38 ? `${ref.substring(0, 38)}...` : ref}</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Dynamic Fields */}
                                {selectedNode.dynamicFields && Object.keys(selectedNode.dynamicFields).length > 0 && (
                                  <div className="space-y-2 border-t border-neutral-900 pt-3">
                                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Object Dynamic Fields:</span>
                                    <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-850 space-y-1.5">
                                      {Object.entries(selectedNode.dynamicFields).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-[10px] font-mono">
                                          <span className="text-neutral-500">{key}:</span>
                                          <span className="text-neutral-300 font-medium select-all">{value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Voting */}
                              <div className="border-t border-neutral-900 pt-4 mt-4 space-y-4">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-zinc-500 font-mono">Curation Feedback:</span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleVoteNode("upvote")}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-neutral-850 hover:border-emerald-900/40 text-emerald-400 hover:text-emerald-300 rounded-lg font-mono text-[10px] transition-colors cursor-pointer"
                                    >
                                      <ThumbsUp className="w-3.5 h-3.5" />
                                      <span>Upvote</span>
                                    </button>
                                    <button
                                      onClick={() => handleVoteNode("downvote")}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-neutral-850 hover:border-rose-900/40 text-rose-400 hover:text-rose-300 rounded-lg font-mono text-[10px] transition-colors cursor-pointer"
                                    >
                                      <ThumbsDown className="w-3.5 h-3.5" />
                                      <span>Downvote</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                              <Compass className="w-9 h-9 text-neutral-800 mb-3 animate-spin animate-duration-12000" />
                              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed font-sans">
                                No concept selected. Pick any topic node on the D3 canvas to inspect variables, update references, or establish semantic links.
                              </p>
                            </div>
                          )}
                        </div>
                      }
                    />

                    {/* Quick Walkthrough helper on-canvas */}
                    <div className="bg-neutral-950 border border-neutral-900 p-3.5 rounded-xl text-[10.5px] text-zinc-300 font-mono leading-relaxed flex items-start gap-2">
                      <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white uppercase">[CONVERSION LEGEND]:</span>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-zinc-300">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00f0ff]" /> Sui/Curators tags</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff5e7e]" /> Move specifications</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffad00]" /> Amber Consensus tags</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INSPECTOR COLUMN */}
                  <div className="lg:col-span-3">
                    <div id="inspector-container" className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 shadow-lg flex flex-col min-h-[400px]">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-3 mb-4">
                        <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Active Fact Inspector</h3>
                        {selectedNode && (
                          <span className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-900/30 px-2 py-0.5 rounded font-mono">
                            SELECTED
                          </span>
                        )}
                      </div>
                      
                      {selectedNode ? (
                        <div className="flex-1 flex flex-col justify-between" id="selected-node-inspector">
                          {/* Node Identity */}
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedNode.color || "#00f0ff" }} />
                                  <span>{selectedNode.name}</span>
                                </h4>
                                <span className="text-[9.5px] font-mono text-zinc-500 block select-all">
                                  UID: {selectedNode.id.substring(0, 18)}...
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs bg-emerald-950/20 border border-emerald-930/40 px-2 py-0.5 rounded-lg shrink-0">
                                <span>★ {selectedNode.trustScore}</span>
                              </div>
                            </div>

                            {/* Render Tags */}
                            <div className="flex flex-wrap gap-1">
                              {selectedNode.tags.map((t) => (
                                <span key={t} className="text-[9px] bg-neutral-900 border border-neutral-850 text-zinc-400 px-2 py-0.5 rounded font-mono">
                                  #{t}
                                </span>
                              ))}
                            </div>

                            {/* Object Version & Owner */}
                            <div className="grid grid-cols-2 gap-3 text-[10px] text-zinc-400 font-mono border-y border-neutral-900 py-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-neutral-500">OBJECT VERSION</span>
                                <span className="text-neutral-200 font-bold text-sky-400"># {selectedNode.version}</span>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-neutral-500">OWNER ADDR</span>
                                <span className="text-neutral-300 font-semibold truncate select-all">
                                  {selectedNode.owner.substring(0, 8)}...{selectedNode.owner.substring(selectedNode.owner.length - 6)}
                                </span>
                              </div>
                            </div>

                            {/* Description Box */}
                            <div className="space-y-2">
                              <span className="text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                                <span>METADATA FACT CONTENT:</span>
                                {!isEditing && (
                                  <button
                                    id="edit-fact-btn"
                                    onClick={() => setIsEditing(true)}
                                    className="text-cyan-400 hover:underline cursor-pointer hover:text-cyan-300 font-sans"
                                  >
                                    Revise Definition
                                  </button>
                                )}
                              </span>

                              {isEditing ? (
                                <div className="space-y-2.5">
                                  <textarea
                                    id="edit-description-input"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    rows={3}
                                    className="w-full bg-neutral-900 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-neutral-700 font-sans focus:outline-none focus:border-cyan-500 resize-none"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      id="save-edit-btn"
                                      onClick={handleUpdateNodeDesc}
                                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors"
                                    >
                                      Commit edit
                                    </button>
                                    <button
                                      id="trigger-conflict-test-btn"
                                      onClick={triggerConflictTest}
                                      className="px-3 py-1 bg-neutral-900 border border-neutral-850 text-rose-400 hover:bg-rose-950/20 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1"
                                      title="Force atomic lock collision on outdated object state"
                                    >
                                      <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
                                      <span>Simulate Collision</span>
                                    </button>
                                    <button
                                      id="cancel-edit-btn"
                                      onClick={() => setIsEditing(false)}
                                      className="ml-auto text-zinc-500 hover:text-zinc-300 font-sans text-xs cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-zinc-300 text-xs leading-relaxed font-sans bg-neutral-900/40 p-3 rounded-xl border border-neutral-902 text-left">
                                  {selectedNode.description}
                                </p>
                              )}
                            </div>

                            {/* References list */}
                            {selectedNode.references && selectedNode.references.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-zinc-500 font-mono block">PROOF SOURCE CITATIONS:</span>
                                <div className="space-y-1 text-[10px] font-mono">
                                  {selectedNode.references.map((ref, i) => (
                                    <a
                                      key={i}
                                      href={ref}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-cyan-400 hover:underline flex items-center gap-1"
                                    >
                                      <span>➜ {ref.length > 38 ? `${ref.substring(0, 38)}...` : ref}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Dynamic Fields Section */}
                            {selectedNode.dynamicFields && Object.keys(selectedNode.dynamicFields).length > 0 && (
                              <div className="space-y-2 border-t border-neutral-900 pt-3">
                                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Object Dynamic Fields:</span>
                                <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-850 space-y-1.5">
                                  {Object.entries(selectedNode.dynamicFields).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-[10px] font-mono">
                                      <span className="text-neutral-500">{key}:</span>
                                      <span className="text-neutral-300 font-medium select-all">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Validation and Link actions */}
                          <div className="border-t border-neutral-900 pt-4 mt-4 space-y-4">
                            
                            {/* Consensus voting */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-zinc-500 font-mono">Curation Feedback:</span>
                              <div className="flex gap-2">
                                <button
                                  id="inspector-upvote-btn"
                                  onClick={() => handleVoteNode("upvote")}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-neutral-850 hover:border-emerald-900/40 text-emerald-400 hover:text-emerald-300 rounded-lg font-mono text-[10px] transition-colors cursor-pointer"
                                  title="Certify statement to bump trust yield"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>Upvote</span>
                                </button>
                                <button
                                  id="inspector-downvote-btn"
                                  onClick={() => handleVoteNode("downvote")}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-neutral-850 hover:border-rose-900/40 text-rose-400 hover:text-rose-300 rounded-lg font-mono text-[10px] transition-colors cursor-pointer"
                                  title="Flag error or false definitions"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  <span>Downvote</span>
                                </button>
                              </div>
                            </div>

                            {/* Connect edge form */}
                            <form onSubmit={handleCreateRelationship} className="space-y-2 border-t border-neutral-900 pt-3 font-sans">
                              <span className="text-[10px] text-zinc-500 font-mono block">ESTABLISH RELATIONSHIP EDGE:</span>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <select
                                  id="relation-target-select"
                                  value={targetNodeId}
                                  onChange={(e) => setTargetNodeId(e.target.value)}
                                  required
                                  className="bg-neutral-900 border border-neutral-850 text-xs p-1.5 rounded-lg text-zinc-300 focus:outline-none focus:border-cyan-500"
                                >
                                  <option value="">To Object...</option>
                                  {nodes
                                    .filter((n) => n.id !== selectedNode.id)
                                    .map((n) => (
                                      <option key={n.id} value={n.id}>
                                        {n.name}
                                      </option>
                                    ))}
                                </select>

                                <select
                                  id="relation-type-select"
                                  value={edgeType}
                                  onChange={(e) => setEdgeType(e.target.value)}
                                  className="bg-neutral-900 border border-neutral-850 text-xs p-1.5 rounded-lg text-zinc-300 focus:outline-none focus:border-cyan-500"
                                >
                                  <option value="extends">extends</option>
                                  <option value="implements">implements</option>
                                  <option value="cites">cites</option>
                                  <option value="contradicts">contradicts</option>
                                  <option value="proves">proves</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] mt-1 pt-1">
                                <span className="text-zinc-500 font-mono shrink-0">Edge strength ({edgeWeight}):</span>
                                <input
                                  id="relation-weight-input"
                                  type="range"
                                  min="1"
                                  max="100"
                                  value={edgeWeight}
                                  onChange={(e) => setEdgeWeight(parseInt(e.target.value))}
                                  className="flex-1 accent-cyan-500 cursor-pointer"
                                />
                              </div>

                              <button
                                id="relation-submit-btn"
                                type="submit"
                                disabled={!targetNodeId}
                                className="w-full py-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 tracking-wide hover:to-cyan-500 disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-zinc-500 disabled:border-neutral-900 hover:shadow-cyan-950/20 border border-cyan-500/10 text-white font-bold rounded-lg text-[10.5px] transition-all cursor-pointer mt-1 font-mono uppercase"
                              >
                                Broadcasting edge transaction
                              </button>
                            </form>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                          <Compass className="w-9 h-9 text-neutral-800 mb-3 animate-spin animate-duration-12000" />
                          <p className="text-xs text-neutral-500 max-w-xs leading-relaxed font-sans">
                            No concept selected. Pick any topic node on the D3 canvas on the left to inspect variables, update references, or establish semantic links.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* VIEW 2.5: SEVEN WONDERS OF SUI NEXUS */}
              {activeTab === "wonders" && (
                <motion.div
                  initial={{ opacity: 0, rotateY: -10, scale: 0.95, transformPerspective: 1200 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, transformPerspective: 1200 }}
                  exit={{ opacity: 0, rotateY: 10, scale: 0.95, transformPerspective: 1200 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SevenWonders 
                    wallet={wallet} 
                    onUpdateWallet={(updated) => setWallet(updated)}
                    onPostTransaction={(kind, details, gasCost) => {
                      const newTx: SuiTx = {
                        digest: "0x" + Math.random().toString(16).substring(2, 64),
                        sender: wallet.address,
                        timestamp: Date.now(),
                        kind: kind as any,
                        gasUsed: gasCost,
                        status: "success",
                        changedObjectId: "0x" + Math.random().toString(16).substring(2, 40),
                        events: [{ type: "nexus_vm_hook", data: { action: details } }]
                      };
                      setTransactions((prev) => [newTx, ...prev]);
                    }}
                  />
                </motion.div>
              )}

              {/* VIEW 3: MOVE IDE & COMPILER */}
              {activeTab === "ide" && (
                <motion.div
                  initial={{ opacity: 0, rotateY: -10, scale: 0.95, transformPerspective: 1200 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, transformPerspective: 1200 }}
                  exit={{ opacity: 0, rotateY: 10, scale: 0.95, transformPerspective: 1200 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="bg-neutral-950 border border-neutral-905 p-6 rounded-3xl space-y-3">
                    <h3 className="text-zinc-200 font-bold flex items-center gap-2 text-sm uppercase tracking-wider font-mono">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>Sui Bytecode Compiler Sandbox Guidelines</span>
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      This sandbox replicates the complete bytecode publishing model of the Sui Virtual Machine. Choose a `.move` smart contract template below, compile it, and publish the payload. Successful publishing commits the dynamic incentive parameters and transfers **10.0 test SUI** gas allowances directly to your active browser context wallet!
                    </p>
                  </div>

                  <SuiTerminal
                    onExecuteQuery={handleExecuteQuery}
                    queryResultLog={queryResultLog}
                    queryError={queryError}
                    onDeployMoveContract={handleDeployMoveContract}
                  />
                </motion.div>
              )}

              {/* VIEW 4: DAO GOVERNANCE */}
              {activeTab === "dao" && (
                <motion.div
                  initial={{ opacity: 0, rotateY: -10, scale: 0.95, transformPerspective: 1200 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, transformPerspective: 1200 }}
                  exit={{ opacity: 0, rotateY: 10, scale: 0.95, transformPerspective: 1200 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <DaoCuration
                    proposals={proposals}
                    onCastVote={handleCastDaoVote}
                    onSubmitProposal={handleCreateDaoProposal}
                    votedProposalIds={[]}
                    userAddress={wallet.address}
                  />
                </motion.div>
              )}

              {/* VIEW 5: BLOCK EXPLORER / LEDGER */}
              {activeTab === "ledger" && (
                <motion.div
                  initial={{ opacity: 0, rotateY: -10, scale: 0.95, transformPerspective: 1200 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, transformPerspective: 1200 }}
                  exit={{ opacity: 0, rotateY: 10, scale: 0.95, transformPerspective: 1200 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <LedgerExplorer transactions={transactions} />
                </motion.div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* NODE CREATION DIALOG MODAL */}
      {showNodeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Assert New Sui Fact Object</h3>
              </div>
              <button
                id="close-node-modal-btn"
                onClick={() => setShowNodeModal(false)}
                className="text-neutral-500 hover:text-neutral-300 font-sans text-xs shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-zinc-200 font-bold uppercase tracking-wider text-[10px] font-mono block">Concept Name / Label:</label>
                <input
                  id="node-name-input"
                  type="text"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="e.g. lattice-based signature"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-200 font-bold uppercase tracking-wider text-[10px] font-mono block">Fact definition / Description:</label>
                <textarea
                  id="node-desc-input"
                  value={nodeDesc}
                  onChange={(e) => setNodeDesc(e.target.value)}
                  placeholder="Provide precise scholarly description of this knowledge item, mapping factual references."
                  required
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-200 font-bold uppercase tracking-wider text-[10px] font-mono block">Categorization Tags:</label>
                  <input
                    id="node-tags-input"
                    type="text"
                    value={nodeTags}
                    onChange={(e) => setNodeTags(e.target.value)}
                    placeholder="sui, crypto, academic"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-200 font-bold uppercase tracking-wider text-[10px] font-mono block">Branding Color Group:</label>
                  <select
                    id="node-color-input"
                    value={nodeColor}
                    onChange={(e) => setNodeColor(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-cyan-500 text-xs font-mono text-zinc-100"
                  >
                    <option value="#00f0ff" className="bg-neutral-950 text-cyan-400">Sui Cyan</option>
                    <option value="#ff5e7e" className="bg-neutral-950 text-pink-400">Move Pink</option>
                    <option value="#a45eff" className="bg-neutral-950 text-purple-400">Zk Purple</option>
                    <option value="#ffad00" className="bg-neutral-950 text-amber-400">Amber Gold</option>
                    <option value="#10b981" className="bg-neutral-950 text-emerald-400">Emerald Green</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-200 font-bold uppercase tracking-wider text-[10px] font-mono block">Proof external citations (URL):</label>
                <input
                  id="node-citations-input"
                  type="text"
                  value={nodeReferences}
                  onChange={(e) => setNodeReferences(e.target.value)}
                  placeholder="https://docs.sui.io, https://arxiv.org/... "
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800 text-[10px] text-zinc-200 leading-relaxed font-mono mt-1 flex items-start gap-1.5 shadow-sm">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Publishing state objects requires a standard Sui Gas Fee context. 0.00512 SUI gas fee will be deducted.</span>
              </div>

              <button
                id="submit-node-btn"
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-sky-650 hover:from-cyan-500 hover:to-sky-550 text-white font-extrabold rounded-xl transition-all shadow-md shadow-cyan-950/20 text-xs mt-2 cursor-pointer uppercase font-mono tracking-wider border border-cyan-500/20"
              >
                Sign & Deploy Object context
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating peer alerts drawer */}
      <div className="fixed bottom-6 left-6 z-[99] flex flex-col gap-2 max-w-sm pointer-events-none" id="notifications-toast-container">
        <AnimatePresence>
          {peerNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -30, y: 15 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`p-3.5 pl-4 rounded-xl border [box-shadow:0_10px_30px_rgba(0,0,0,0.5)] flex items-start gap-3 backdrop-blur-md pointer-events-auto text-xs ${
                notif.type === "success"
                  ? "bg-emerald-950/90 border-emerald-800/60 text-emerald-300"
                  : notif.type === "warn"
                  ? "bg-rose-955/90 border-rose-800/60 text-rose-300"
                  : "bg-neutral-900/90 border-neutral-800 text-zinc-200"
              }`}
            >
              {notif.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
              {notif.type === "warn" && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 animate-bounce" />}
              <div className="flex flex-col gap-0.5 select-text">
                <span className="font-semibold uppercase text-[10px] tracking-wider">{notif.type === "success" ? "TRANSACTION SUCCESS" : notif.type === "warn" ? "TRANSACTION REVERT" : "CONSTRUCT UPDATE"}</span>
                <span className="text-[11px] leading-relaxed opacity-90">{notif.msg}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
