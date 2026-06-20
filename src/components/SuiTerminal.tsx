/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Play, Clipboard, Code, Search, CheckCircle, RefreshCw, AlertTriangle, Shield, Check } from "lucide-react";

interface SuiTerminalProps {
  onExecuteQuery: (queryText: string) => void;
  queryResultLog: string | null;
  queryError: string | null;
  onDeployMoveContract: () => void;
}

export default function SuiTerminal({
  onExecuteQuery,
  queryResultLog,
  queryError,
  onDeployMoveContract
}: SuiTerminalProps) {
  const [activeTab, setActiveTab] = useState<"query" | "move">("query");
  const [queryString, setQueryString] = useState('FIND * WHERE tag = "sui"');
  
  // Move Contract sub-tabs
  const [moveFile, setMoveFile] = useState<"knowledge" | "incentives">("knowledge");
  const [compiling, setCompiling] = useState(false);
  const [compileOutput, setCompileOutput] = useState<string[]>([]);

  // Move contract text examples
  const knowledgeMoveCode = `/// Module defining on-chain collaborative knowledge nodes and relationship structures
module sui_nexus::knowledge_object {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use std::string::String;
    use std::vector;

    /// Struct representing a knowledge node on Sui
    public struct KnowledgeObject has key, store {
        id: UID,
        name: String,
        description: String,
        tags: vector<String>,
        owner: address,
        created_at: u64,
        updatedAt: u64,
        version: u64,
        trust_score: u64,
        references: vector<String>
    }

    /// Establish a new dynamic dynamic_field to support expandable structures
    public entry fun create_knowledge_object(
        name: String,
        description: String,
        tags: vector<String>,
        references: vector<String>,
        ctx: &mut TxContext
    ) {
        let knowledge_object = KnowledgeObject {
            id: object::new(ctx),
            name,
            description,
            tags,
            owner: tx_context::sender(ctx),
            created_at: tx_context::epoch(ctx),
            updatedAt: tx_context::epoch(ctx),
            version: 1,
            trust_score: 50,
            references
        };
        transfer::share_object(knowledge_object);
    }
}`;

  const incentivesMoveCode = `/// Module governing the token curation rewards and DAO voting procedures
module sui_nexus::incentives {
    use sui::coin::{Self, TreasuryCap};
    use sui::tx_context::TxContext;
    use sui_nexus::knowledge_object::KnowledgeObject;

    /// System currency token
    public struct NEXUS has drop {}

    /// DAO Voter ballot
    public struct Ballot has key, store {
        id: UID,
        voter: address,
        vote: bool,
        proposal_id: String
    }

    /// Distribute NEXUS rewards to verified curators
    public entry fun reward_contributor(
        contributor: address,
        amount: u64,
        treasury_cap: &mut TreasuryCap<NEXUS>,
        ctx: &mut TxContext
    ) {
        let reward_coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(reward_coin, contributor);
    }
}`;

  const executeCompilingSim = () => {
    setCompiling(true);
    setCompileOutput([]);
    
    const logs = [
      "▶ Initializing compiler for workspace: sui_nexus_v1 ...",
      "➜ Resolving manifest dependencies: packages/sui ...",
      "Parsing move file: " + (moveFile === "knowledge" ? "knowledge_object.move" : "incentives.move") + " ...",
      "✔ Performing borrowing logic & capability safety analysis ...",
      "⚙ Translating AST nodes into modular Sui bytecode ...",
      "ℹ Checking register resources ... 0 safety faults found.",
      "⌛ Generating cryptographic zero-knowledge deploy parameters ...",
      "▲ Broadcasting payload to Sui local validator ...",
      "✔ Sui transaction accepted! Success.",
      "⚡ core_contracts package committed successfully at address: 0x98fbdcd1122a6ee5fcfdfef0cbcfce10ae"
    ];

    logs.forEach((line, index) => {
      setTimeout(() => {
        setCompileOutput(prev => [...prev, line]);
        if (index === logs.length - 1) {
          setCompiling(false);
          onDeployMoveContract();
        }
      }, (index + 1) * 350);
    });
  };

  const handleQueryRun = (q: string) => {
    setQueryString(q);
    onExecuteQuery(q);
  };

  return (
    <div id="compiler-terminal" className="glass-card rounded-3xl p-6 shadow-2xl flex flex-col h-[460px] relative overflow-hidden">
      
      {/* Background Accent Deco */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">L1 Developer Console</h3>
            <p className="text-[10px] text-zinc-400">Query semantic indexes or compile Move contract models</p>
          </div>
        </div>

        <div className="flex bg-neutral-900/40 p-1.5 rounded-2xl border border-white/5 self-start sm:self-auto shadow-inner">
          <button
            id="tab-query-btn"
            onClick={() => setActiveTab("query")}
            className={`px-4 py-2 font-sans text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "query"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            }`}
          >
            Sui Index Query Pipeline
          </button>
          <button
            id="tab-move-btn"
            onClick={() => setActiveTab("move")}
            className={`px-4 py-2 font-sans text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "move"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            }`}
          >
            Move Compiler IDE
          </button>
        </div>
      </div>

      {/* Terminal Work Body */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        
        {/* TAB 1: NODE QUERY WRITER */}
        {activeTab === "query" && (
          <div className="flex flex-col h-full justify-between" id="query-interface-panel">
            <div className="flex flex-col gap-3">
              <label className="text-[10.5px] text-zinc-400 font-mono flex items-center gap-2">
                <span>Dynamic Select Filter:</span>
                <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-900/30">
                  SCHEMA FACT INDEX
                </span>
              </label>

              <div className="relative">
                <input
                  id="query-input-field"
                  type="text"
                  value={queryString}
                  onChange={(e) => setQueryString(e.target.value)}
                  placeholder='FIND * WHERE tag = "sui"'
                  className="w-full text-xs font-mono bg-neutral-950 border border-white/5 focus:border-cyan-500 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none transition-all shadow-inner"
                />
                <button
                  id="query-execute-btn"
                  onClick={() => onExecuteQuery(queryString)}
                  className="absolute right-2 top-2 p-2 px-4 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/30"
                >
                  <Play className="w-3 h-3 text-neutral-950 fill-neutral-950" />
                  <span>Execute Query</span>
                </button>
              </div>
                   {/* Sample Queries */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[10px] text-zinc-400 font-mono font-semibold uppercase tracking-wider">Fast-Queries:</span>
                <button
                  id="query-sample-sui-btn"
                  onClick={() => handleQueryRun('FIND * WHERE tag = "sui"')}
                  className="text-[10.5px] bg-neutral-900 border border-white/5 hover:border-cyan-500/20 text-cyan-400 hover:text-white px-3 py-1 rounded-xl font-mono transition-all cursor-pointer"
                >
                  tag = "sui"
                </button>
                <button
                  id="query-sample-trust-btn"
                  onClick={() => handleQueryRun('FIND * WHERE trust_score > 90')}
                  className="text-[10.5px] bg-neutral-900 border border-white/5 hover:border-emerald-500/20 text-emerald-400 hover:text-white px-3 py-1 rounded-xl font-mono transition-all cursor-pointer"
                >
                  trust_score &gt; 90
                </button>
                <button
                  id="query-sample-rel-btn"
                  onClick={() => handleQueryRun('FIND * WHERE relationship = "extends"')}
                  className="text-[10.5px] bg-neutral-900 border border-white/5 hover:border-fuchsia-500/20 text-fuchsia-400 hover:text-white px-3 py-1 rounded-xl font-mono transition-all cursor-pointer"
                >
                  relation = "extends"
                </button>
              </div>
            </div>

            {/* Logger Window */}
            <div className="flex-1 min-h-[140px] bg-neutral-950/70 border border-white/5 rounded-2xl p-4 mt-5 flex flex-col font-mono text-[11px] overflow-auto select-text shadow-inner">
              <div className="text-zinc-400 mb-2.5 border-b border-white/5 pb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">REACTIVE PIPELINE OUTPUT</span>
                <Shield className="w-3.5 h-3.5 text-zinc-600" />
              </div>
              
              {queryError ? (
                <div className="text-rose-400 flex items-start gap-2.5 bg-rose-950/20 p-3 rounded-xl border border-rose-900/30 animate-fade-in text-xs">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                  <span>{queryError}</span>
                </div>
              ) : queryResultLog ? (
                <div className="text-emerald-400 flex items-start gap-2.5 bg-emerald-950/10 p-3 rounded-xl border border-emerald-900/30 animate-fade-in text-xs leading-relaxed font-mono">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-550" />
                  <span>{queryResultLog}</span>
                </div>
              ) : (
                <div className="text-zinc-400 leading-relaxed font-sans text-xs">
                  Sui Graph query logs are displayed here. Enter an indexed search statement above and execute to filter the target nodes, highlight critical path networks, or perform graph validations.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MOVE COMPILER */}
        {activeTab === "move" && (
          <div className="flex flex-col h-full min-h-0" id="move-ide-panel">
            <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2.5 mb-3.5">
              <button
                id="move-file-knowledge"
                onClick={() => setMoveFile("knowledge")}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-mono transition-all cursor-pointer ${
                  moveFile === "knowledge"
                    ? "bg-neutral-900 text-cyan-400 border border-white/10 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                knowledge_object.move
              </button>
              <button
                id="move-file-incentives"
                onClick={() => setMoveFile("incentives")}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-mono transition-all cursor-pointer ${
                  moveFile === "incentives"
                    ? "bg-neutral-900 text-cyan-400 border border-white/10 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                incentives.move
              </button>

              <button
                id="move-compile-btn"
                onClick={executeCompilingSim}
                disabled={compiling}
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:brightness-110 active:scale-95 disabled:from-zinc-850 disabled:to-zinc-900 disabled:text-zinc-500 text-neutral-950 font-bold text-xs rounded-xl transition-all cursor-pointer font-sans"
              >
                {compiling ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-950" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-neutral-950" />
                )}
                <span>Compile & Publish</span>
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 min-h-0">
              {/* Code window */}
              <div className="md:col-span-3 bg-neutral-950/85 font-mono text-[10.5px] text-zinc-300 p-4 rounded-2xl border border-white/5 overflow-auto whitespace-pre select-text h-full shadow-inner leading-relaxed">
                {moveFile === "knowledge" ? knowledgeMoveCode : incentivesMoveCode}
              </div>

              {/* Build output logs */}
              <div className="md:col-span-2 bg-neutral-950/40 p-4 rounded-2xl border border-white/5 h-full flex flex-col font-mono text-[10.5px] min-h-0 shadow-inner">
                <span className="text-zinc-400 font-sans font-bold text-[11px] mb-2 px-1 border-b border-white/5 pb-2 flex items-center tracking-widest uppercase">
                  Validator Sync Terminal
                </span>
                <div className="flex-1 overflow-auto space-y-2 select-text px-1">
                  {compileOutput.length === 0 ? (
                    <span className="text-zinc-600 italic">No activity logs recorded. Launch the compilation to update bytecode state.</span>
                  ) : (
                    compileOutput.map((out, i) => (
                      <div
                        key={i}
                        className={`${
                          out.startsWith("✔") || out.startsWith("Succeeded!") || out.includes("successfully")
                            ? "text-emerald-400 font-medium"
                            : out.startsWith("▶") || out.startsWith("➜")
                            ? "text-cyan-400 font-semibold"
                            : "text-zinc-400"
                        }`}
                      >
                        {out}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
