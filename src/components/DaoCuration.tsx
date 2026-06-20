/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { DaoProposal } from "../types";
import { Vote, FileSignature, ThumbsUp, ThumbsDown, Award, Sparkles, Plus, AlertCircle } from "lucide-react";

interface DaoCurationProps {
  proposals: DaoProposal[];
  onCastVote: (proposalId: string, voteType: "for" | "against") => void;
  onSubmitProposal: (title: string, description: string, type: "dispute" | "bounty", reward: number) => void;
  votedProposalIds: string[];
  userAddress: string;
}

export default function DaoCuration({
  proposals,
  onCastVote,
  onSubmitProposal,
  votedProposalIds,
  userAddress
}: DaoCurationProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"dispute" | "bounty">("dispute");
  const [newReward, setNewReward] = useState(100);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    
    onSubmitProposal(newTitle, newDesc, newType, newReward);
    setNewTitle("");
    setNewDesc("");
    setShowCreateModal(false);
  };

  return (
    <div id="dao-curation-panel" className="glass-card rounded-3xl p-6 shadow-2xl flex flex-col h-[460px] relative overflow-hidden">
      
      {/* Glow asset */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">DAO Curation Portal</h3>
            <p className="text-[10px] text-zinc-405">Vote on factual accuracy disputes or claim curating rewards</p>
          </div>
        </div>
        
        <button
          id="open-dispute-modal-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:brightness-110 text-neutral-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-violet-950/20"
        >
          <Plus className="w-3.5 h-3.5 text-neutral-950" />
          <span>New Dispute</span>
        </button>
      </div>

      {/* Main Body List */}
      <div className="flex-1 overflow-auto space-y-4 pr-1 relative z-10 scrollbar-thin">
        {proposals.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
            <span>No proposals lodged on-chain.</span>
          </div>
        ) : (
          proposals.map((prop) => {
            const hasVoted = votedProposalIds.includes(prop.id) || prop.votedAddresses.includes(userAddress);
            return (
              <div
                key={prop.id}
                id={`proposal-card-${prop.id}`}
                className="bg-neutral-900/35 border border-white/5 p-5 rounded-2xl flex flex-col gap-3.5 hover:border-violet-500/20 transition-all shadow-md group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-lg font-sans font-extrabold uppercase tracking-wide border ${
                      prop.type === "dispute" 
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {prop.type === "dispute" ? "Dispute Proposal" : "Curation Bounty"}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">{prop.title}</h4>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl" title="Voter Reward Pool">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>{prop.reward} NEXUS</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{prop.description}</p>

                {/* Score and Voting Toggles */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-1 flex-wrap gap-2">
                  <div className="flex gap-4 font-mono text-xs">
                    <div className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-xl border border-white/5">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-400 font-bold">{prop.votesFor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-xl border border-white/5">
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-rose-400 font-bold">{prop.votesAgainst}</span>
                    </div>
                  </div>

                  {prop.status !== "active" ? (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-xl border ${
                      prop.status === "passed"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}>
                      Proposal {prop.status}
                    </span>
                  ) : hasVoted ? (
                    <span className="text-[10.5px] font-medium text-zinc-400 italic">Vote Registered</span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        id={`vote-for-${prop.id}`}
                        onClick={() => onCastVote(prop.id, "for")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-neutral-950 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Accept Fact</span>
                      </button>
                      <button
                        id={`vote-against-${prop.id}`}
                        onClick={() => onCastVote(prop.id, "against")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-neutral-950 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-white/10 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-violet-600/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Submit DAO Proposal</h3>
              </div>
              <button
                id="close-dispute-modal-btn"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white font-sans text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs relative z-10">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Proposal Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType("dispute")}
                    className={`py-2.5 px-3.5 border rounded-xl text-center font-bold font-sans transition-all cursor-pointer ${
                      newType === "dispute"
                        ? "border-rose-500 bg-rose-500/10 text-rose-300 shadow-md shadow-rose-950/25"
                        : "border-white/5 bg-neutral-900 text-zinc-400 hover:bg-neutral-850"
                    }`}
                  >
                    Flag Dispute
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("bounty")}
                    className={`py-2.5 px-3.5 border rounded-xl text-center font-bold font-sans transition-all cursor-pointer ${
                      newType === "bounty"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-md shadow-emerald-950/25"
                        : "border-white/5 bg-neutral-900 text-zinc-400 hover:bg-neutral-850"
                    }`}
                  >
                    Open Content Bounty
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Title:</label>
                <input
                  id="prop-title-input"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Duplicate Concept: Lattice Cryptography vs Lattice structures"
                  required
                  className="w-full bg-neutral-900 border border-white/5 rounded-xl px-3 py-2 text-white placeholder-zinc-600 font-sans text-xs focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Description:</label>
                <textarea
                  id="prop-desc-input"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide precise details of the semantic error, duplicates, or desired translations for general validator voting."
                  required
                  rows={3}
                  className="w-full bg-neutral-900 border border-white/5 rounded-xl px-3 py-2 text-white placeholder-zinc-600 font-sans text-xs focus:outline-none focus:border-violet-500 resize-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Reward Pool (NEXUS Tokens):</label>
                <input
                  id="prop-reward-input"
                  type="number"
                  value={newReward}
                  onChange={(e) => setNewReward(parseInt(e.target.value) || 0)}
                  min={10}
                  max={1000}
                  className="w-full bg-neutral-900 border border-white/5 rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <button
                id="submit-proposal-btn"
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 hover:brightness-110 text-neutral-950 font-extrabold rounded-xl transition-all shadow-lg shadow-violet-950/20 text-xs font-sans mt-2 cursor-pointer uppercase tracking-widest"
              >
                File Proposal to Sui DAO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
