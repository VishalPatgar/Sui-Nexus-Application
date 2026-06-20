/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { SuiTx } from "../types";
import { List, Calendar, Box, Database, Eye, ShieldAlert, Cpu, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface LedgerExplorerProps {
  transactions: SuiTx[];
  onSelectTxDigest?: (digest: string) => void;
}

export default function LedgerExplorer({ transactions, onSelectTxDigest }: LedgerExplorerProps) {
  const [expandedDigest, setExpandedDigest] = useState<string | null>(null);

  const toggleExpand = (digest: string) => {
    setExpandedDigest(expandedDigest === digest ? null : digest);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "0x";
    if (addr.startsWith("0x_")) return addr; // Keep anonymous simple
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
  };

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case "create_knowledge_object":
        return "Create Node";
      case "create_relationship":
        return "Create relation";
      case "update_knowledge_object":
        return "Update Node";
      case "validate_knowledge_object":
        return "Consensus voting";
      case "add_reference":
        return "Add Reference";
      default:
        return kind;
      }
  };

  const getKindBadgeStyle = (kind: string, status: string) => {
    if (status === "failure") return "bg-rose-500/10 border border-rose-500/20 text-rose-400";
    switch (kind) {
      case "create_knowledge_object":
        return "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300";
      case "create_relationship":
        return "bg-purple-500/10 border border-purple-500/20 text-purple-300";
      case "update_knowledge_object":
        return "bg-amber-500/10 border border-amber-500/20 text-amber-300";
      case "validate_knowledge_object":
        return "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300";
      default:
        return "bg-neutral-900 border border-white/5 text-zinc-400";
    }
  };

  return (
    <div id="ledger-explorer" className="glass-card rounded-3xl p-6 shadow-2xl flex flex-col h-[460px] relative overflow-hidden">
      
      {/* Accent glow background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase font-sans">Sui Transaction Blocks Ledger</h3>
            <p className="text-[10px] text-zinc-400">Chronological list of mutable transaction outcomes and event structures</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/10 border border-emerald-555/20 px-3 py-1 rounded-xl text-emerald-400 font-mono font-bold uppercase tracking-wider">
          ● SANDBOX SYNCED
        </span>
      </div>

      <div className="flex-1 overflow-auto space-y-3 pr-1 relative z-10 scrollbar-thin">
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
            <Cpu className="w-8 h-8 text-zinc-700 mb-2.5 animate-spin" />
            <span>Awaiting on-chain activity blocks...</span>
          </div>
        ) : (
          transactions.map((tx) => {
            const isExpanded = expandedDigest === tx.digest;
            return (
              <div
                key={tx.digest}
                className={`border border-white/5 bg-neutral-900/35 rounded-2xl hover:border-white/10 transition-colors ${
                  tx.status === "failure" ? "border-rose-500/35 bg-rose-950/10" : ""
                }`}
              >
                {/* Collapsed view summary */}
                <div
                  id={`tx-card-${tx.digest}`}
                  onClick={() => toggleExpand(tx.digest)}
                  className="flex items-center justify-between p-4 cursor-pointer text-xs font-mono select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {tx.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    )}

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-200 font-bold tracking-tight truncate">
                          Block: {tx.digest.substring(0, 16)}...
                        </span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-lg font-sans font-bold uppercase shrink-0 tracking-wide ${getKindBadgeStyle(tx.kind, tx.status)}`}>
                          {getKindLabel(tx.kind)}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1">
                        Epoch {new Date(tx.timestamp).toLocaleTimeString()} • Curator: {formatAddress(tx.sender)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 pl-2">
                    <div className="flex flex-col text-right">
                      <span className="text-sky-400 font-black tracking-tight font-sans">{tx.gasUsed.toFixed(5)}</span>
                      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">SUI GAS</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Trace Details */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-5 py-4 bg-neutral-950/40 font-mono text-[10.5px] text-zinc-400 space-y-3 select-text rounded-b-2xl">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-zinc-500 h-px font-semibold uppercase text-[9px] tracking-wider">Full Digest:</div>
                      <div className="col-span-3 text-zinc-300 select-all break-all">{tx.digest}</div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-zinc-500 font-semibold uppercase text-[9px] tracking-wider">Target ID:</div>
                      <div className="col-span-3 text-cyan-400 select-all hover:underline cursor-pointer break-all">{tx.changedObjectId}</div>
                    </div>

                    {tx.status === "failure" && (
                      <div className="bg-rose-950/40 border border-rose-500/20 p-3.5 rounded-xl text-rose-400 space-y-1.5">
                        <div className="font-extrabold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          <span>Transaction Error (Consensus Abort)</span>
                        </div>
                        <p className="leading-relaxed text-[10px] font-sans">
                          {tx.errorMessage}
                        </p>
                      </div>
                    )}

                    {tx.events && tx.events.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block">Emitted Move Event Struct:</span>
                        <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5 space-y-1.5 max-h-[140px] overflow-auto scrollbar-thin">
                          <span className="text-fuchsia-400 font-extrabold text-[10px] block truncate">
                            Type: {tx.events[0].type}
                          </span>
                          <pre className="text-zinc-500 text-[10px] overflow-auto max-w-full leading-normal">
                            {JSON.stringify(tx.events[0].data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
