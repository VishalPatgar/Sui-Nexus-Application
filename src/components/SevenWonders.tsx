/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Cpu, 
  Fingerprint, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Layers, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Key, 
  CheckCircle, 
  RotateCcw, 
  Search, 
  DollarSign, 
  Lock, 
  Flame, 
  ArrowRight,
  Database,
  ChevronRight
} from "lucide-react";

interface SevenWondersProps {
  wallet: {
    address: string;
    balanceSui: number;
    balanceNexus: number;
  };
  onUpdateWallet: (updated: any) => void;
  onPostTransaction: (kind: string, details: string, gasUsed: number) => void;
}

export default function SevenWonders({
  wallet,
  onUpdateWallet,
  onPostTransaction
}: SevenWondersProps) {
  const [activeWonder, setActiveWonder] = useState<number>(0);
  const [customLogs, setCustomLogs] = useState<string[]>([]);

  // Wonder 1 State: PTB Composer
  const [ptbActions, setPtbActions] = useState<Array<{ id: string; type: string; details: string; value: string }>>([
    { id: "1", type: "split_gas", details: "Splitting Gas Coin for Sub-gas target", value: "0.2 SUI" },
    { id: "2", type: "mint_kiosk", details: "Instantiating Sui Kiosk Safe Storage", value: "Kiosk ID" },
    { id: "3", type: "swap_token", details: "Exchanging SUI for NEXUS on DeepBook", value: "2.5 SUI" }
  ]);
  const [isExecutingPtb, setIsExecutingPtb] = useState(false);

  // Wonder 2 State: zkLogin
  const [zkStep, setZkStep] = useState<"not_started" | "jwt_auth" | "proof_gen" | "authorized">("not_started");
  const [sessionKey, setSessionKey] = useState("");
  const [sessionVotes, setSessionVotes] = useState(0);

  // Wonder 3 State: SuiNS Domain
  const [domainName, setDomainName] = useState("hackathon-winner");
  const [domainTarget, setDomainTarget] = useState("0xd909...c5f");
  const [registeredDomains, setRegisteredDomains] = useState<Array<{ name: string; target: string; owner: string }>>([
    { name: "curator.nexus.sui", target: "0xd90999557458ef8a57e937d5ff4fbb1c7128cb5fceae0d6cfcf858d20ae4bc54", owner: "0xd909...c5f" },
    { name: "genesis.sui", target: "0x0000000000000000000000000000000000000000000000000000000000000003", owner: "Sui Core" }
  ]);

  // Wonder 4 State: DeepBook Order Book
  const [orderBookType, setOrderBookType] = useState<"buy" | "sell">("buy");
  const [orderPrice, setOrderPrice] = useState("1.85");
  const [orderQty, setOrderQty] = useState("10");
  const [bidWall, setBidWall] = useState<Array<{ price: number; amount: number }>>([
    { price: 1.84, amount: 2450 },
    { price: 1.82, amount: 4890 },
    { price: 1.80, amount: 15300 }
  ]);
  const [askWall, setAskWall] = useState<Array<{ price: number; amount: number }>>([
    { price: 1.86, amount: 3100 },
    { price: 1.88, amount: 6420 },
    { price: 1.90, amount: 11000 }
  ]);

  // Wonder 5 State: Sui Kiosk Lockers
  const [kioskStatus, setKioskStatus] = useState<"unlocked" | "locked" | "leased">("locked");
  const [leaseDuration, setLeaseDuration] = useState("3");
  const [leaseRate, setLeaseRate] = useState("0.1");

  // Wonder 6 State: Gas sponsorship
  const [gasSponsorPoolSui, setGasSponsorPoolSui] = useState(25.0);
  const [isSponsorEnabled, setIsSponsorEnabled] = useState(true);

  // Wonder 7 State: Dynamic Field Breeder
  const [mutatingNode, setMutatingNode] = useState({
    id: "0x7a83c79c9",
    name: "Aptos-Sui Bridges",
    parentColor: "#a855f7",
    dynamicAttributes: [
      { key: "latency_ms", value: "110" },
      { key: "curator_rating", value: "Verified 98%" }
    ]
  });
  const [newKey, setNewKey] = useState("auditor_sig");
  const [newVal, setNewVal] = useState("0x3facc002e11d");

  // Push logger action log
  const pushLog = (log: string) => {
    setCustomLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${log}`,
      ...prev.slice(0, 18)
    ]);
  };

  const executePTB = () => {
    if (isExecutingPtb) return;
    setIsExecutingPtb(true);
    pushLog("Initiating Single atomic transaction sequence on Sui execution engine...");
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < ptbActions.length) {
        const action = ptbActions[index];
        pushLog(`Executing atomic Command [${index + 1}/${ptbActions.length}]: Resolving "${action.type}" argument map...`);
        index++;
      } else {
        clearInterval(interval);
        setIsExecutingPtb(false);
        const fee = 0.0035;
        onUpdateWallet({
          ...wallet,
          balanceSui: Math.max(0.1, wallet.balanceSui - fee),
          balanceNexus: wallet.balanceNexus + 15
        });
        onPostTransaction(
          "update_knowledge_object",
          `PTB Atomic Cluster finished with 5 receipt signatures. SplitCoin gas resolved.`,
          fee
        );
        pushLog(`Success! All commands merged atomically. SUI Gas deduction: ${fee} SUI. Issued +15 NEXUS token rewards!`);
      }
    }, 900);
  };

  const handlezkGenerateSession = () => {
    setZkStep("jwt_auth");
    pushLog("zkLogin handshake initiated. Connecting OpenID identity payload...");
    
    setTimeout(() => {
      setZkStep("proof_gen");
      pushLog("JWT credentials approved. Triggering zero-knowledge circuit validation (ZK-Proof calculation)...");
      
      setTimeout(() => {
        setZkStep("authorized");
        const ephemeralKey = "0x" + Math.random().toString(16).substr(2, 40);
        setSessionKey(ephemeralKey);
        pushLog(`Session key registered! Ephemeral Signature Delegate: ${ephemeralKey}`);
        pushLog("zkLogin authenticated without exposing wallet seeds or triggering wallet popups for user actions.");
      }, 1000);
    }, 1000);
  };

  const handleRegisterDomain = () => {
    if (!domainName) return;
    const nameWithSui = domainName.endsWith(".sui") ? domainName : `${domainName}.sui`;
    
    // Cost 1 SUI
    if (wallet.balanceSui < 1) {
      pushLog("Inadequate SUI balance to cover domain registration fee.");
      return;
    }

    onUpdateWallet({
      ...wallet,
      balanceSui: wallet.balanceSui - 1
    });

    const newDomain = {
      name: nameWithSui,
      target: domainTarget,
      owner: wallet.address
    };

    setRegisteredDomains([newDomain, ...registeredDomains]);
    onPostTransaction(
      "create_knowledge_object",
      `SuiNS Domain registered: "${nameWithSui}" owned by ${wallet.address}`,
      1.0
    );
    pushLog(`Domain "${nameWithSui}" registered on-chain for 1.0 SUI fee! Resolves directly to target address.`);
    setDomainName("");
  };

  const executeDeepMarketOrder = () => {
    const priceNum = parseFloat(orderPrice);
    const qtyNum = parseFloat(orderQty);
    if (!priceNum || !qtyNum) return;

    if (orderBookType === "buy") {
      const totalCost = priceNum * qtyNum;
      if (wallet.balanceNexus < totalCost) {
        pushLog(`Inadequate NEXUS liquidity. Requires ${totalCost} NEXUS.`);
        return;
      }

      onUpdateWallet({
        ...wallet,
        balanceSui: wallet.balanceSui + qtyNum,
        balanceNexus: wallet.balanceNexus - totalCost
      });
      // modify bids simulation
      setBidWall([{ price: priceNum, amount: qtyNum * 2.5 }, ...bidWall.slice(0, 2)]);
      pushLog(`DeepBook Aggregator filled order! Exchanged ${totalCost.toFixed(2)} NEXUS for ${qtyNum} SUI at matching index.`);
    } else {
      if (wallet.balanceSui < qtyNum) {
        pushLog(`Inadequate SUI asset balance to execute market sell order.`);
        return;
      }

      const proceeds = priceNum * qtyNum;
      onUpdateWallet({
        ...wallet,
        balanceSui: wallet.balanceSui - qtyNum,
        balanceNexus: wallet.balanceNexus + proceeds
      });
      setAskWall([{ price: priceNum, amount: qtyNum * 3.1 }, ...askWall.slice(0, 2)]);
      pushLog(`DeepBook Aggregator matched sell! Traded ${qtyNum} SUI for ${proceeds.toFixed(2)} NEXUS on active order logs.`);
    }
  };

  const toggleKioskLock = () => {
    if (kioskStatus === "locked") {
      setKioskStatus("unlocked");
      pushLog("Kiosk capsule limits unlocked. Owner can extract or transfer dynamic asset.");
    } else {
      setKioskStatus("locked");
      pushLog("Kiosk capsule limits locked. SUI Move royalty rules and locks enforced.");
    }
  };

  const leaseKioskCapsule = () => {
    const fee = parseFloat(leaseRate);
    if (!fee) return;
    setKioskStatus("leased");
    onUpdateWallet({
      ...wallet,
      balanceSui: wallet.balanceSui + fee
    });
    pushLog(`Capsule leased to validator peer. Earned rent fee: +${fee} SUI. Royalties secured via Kiosk contracts.`);
  };

  const handleDepositSponsorship = () => {
    if (wallet.balanceSui < 5) {
      pushLog("Inadequate personal SUI balance to lock for sponsorship pool.");
      return;
    }
    onUpdateWallet({
      ...wallet,
      balanceSui: wallet.balanceSui - 5
    });
    setGasSponsorPoolSui((prev) => prev + 5);
    pushLog("Added 5 SUI to the gas sponsor pool. Developer gas sponge now refueled!");
  };

  const handleAddDynamicField = () => {
    if (!newKey || !newVal) return;
    const updatedAttrs = [...mutatingNode.dynamicAttributes, { key: newKey, value: newVal }];
    setMutatingNode({
      ...mutatingNode,
      dynamicAttributes: updatedAttrs
    });
    setNewKey("");
    setNewVal("");
    pushLog(`Sui Move Mutator grafted field: [key: "${newKey}"] -> [val: "${newVal}"] directly onto the on-chain Object.`);
  };

  const handleInteractiveCuration = () => {
    if (zkStep !== "authorized") {
      pushLog("Error: Setup zkLogin Session key before voting with zero-latency.");
      return;
    }
    setSessionVotes((v) => v + 1);
    onUpdateWallet({
      ...wallet,
      balanceNexus: wallet.balanceNexus + 2
    });
    pushLog(`Zero-Gas Signer: Cast verification vote under session key ${sessionKey.slice(0,8)}... Success (+2 Nexus)`);
  };

  const wondersList = [
    {
      id: 1,
      title: "PTB Composer & Flash-Lender",
      description: "Sui's unique Programmable Transaction Blocks let you pack up to 1024 unique entry calls atomically, swapping tokens, minting NFTs, and redeeming domain names inside a single gas fee pipeline.",
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      tagline: "Atomic multi-task execution"
    },
    {
      id: 2,
      title: "zkLogin Ephemeral Sessions",
      description: "Sign on-chain actions instantly. Combines OpenID Connect with Ephemeral Keys, letting and validating sub-keys. Execute votes and sign inputs in the background without nagging wallet authorization overlays.",
      icon: <Fingerprint className="w-5 h-5 text-indigo-400" />,
      tagline: "Ultra-fast gas-sponsored sign-in"
    },
    {
      id: 3,
      title: "SuiNS Domain Oracle Registry",
      description: "Mint custom .sui identities and bundle them directly as structured smart objects. Dynamically attach routing links, IPFS content CID identifiers, and verify tags natively at the consensus layer.",
      icon: <Globe className="w-5 h-5 text-pink-400" />,
      tagline: "Sui native naming framework"
    },
    {
      id: 4,
      title: "DeepBook Order-Book Router",
      description: "Execute trades directly against Sui's native central limit order book (CLOB). Bypasses high-slippage AMMs with sub-cent gas fees and instant latency matching algorithms directly inside Sui's framework.",
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      tagline: "Institutional level on-chain liquidity"
    },
    {
      id: 5,
      title: "Sui Kiosk Royalty Lockers",
      description: "Enforce creator royalties and ownership parameters with absolute cryptographic guarantees. Put your scientific facts on sale or lease them to validators with locked custom trade rules.",
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      tagline: "Smart leasing capsule container"
    },
    {
      id: 6,
      title: "Gas Station Sponsorship",
      description: "Build user-friendly onboarding. Toggle developer gas sponsorship to cover execution fees using the on-chain sponsor vault. Allow zero-balance users to submit and curate fact-objects seamlessly.",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      tagline: "Zero-gas onboarding pipeline"
    },
    {
      id: 7,
      title: "Dynamic Field Breed Chamber",
      description: "In Sui, smart objects are dynamic. Unlike the static structures of Solidity, Sui objects contain flexible fields. Mutate, grow, or stack nested child objects on the fly without upgrading code arrays.",
      icon: <Layers className="w-5 h-5 text-sky-400" />,
      tagline: "Living smart object parameters"
    }
  ];

  return (
    <div id="seven-wonders-wrapper" className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-950/30 via-slate-950 to-purple-950/30 border border-white/5 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-widest font-sans flex items-center gap-2 uppercase">
              Seven Wonders of Nexus
            </h2>
            <p className="text-xs text-zinc-400">
              State-of-the-Art Interactive Sandbox Harnessing the Absolute Pinnacle of Sui's 3rd-Gen Architecture Layer
            </p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] px-3 py-1 bg-gradient-to-r from-amber-500/10 to-amber-600/15 border border-amber-500/20 text-amber-400 font-mono font-bold rounded-full uppercase tracking-wider">
              Sui Move Architecture Suite
            </span>
          </div>
        </div>
      </div>

      {/* Grid Dashboard - Left column selectors, Center play panel, Right active ledger log console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: SELECTORS */}
        <div className="lg:col-span-4 space-y-3 flex flex-col lg:max-h-[780px] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 px-1 font-mono block">
            Select Move Stack Engine
          </span>
          {wondersList.map((w, idx) => (
            <button
              key={w.id}
              onClick={() => setActiveWonder(idx)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-4 group/btn ${
                activeWonder === idx
                  ? "bg-amber-950/20 border-amber-500/30 shadow-[0_4px_25px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20"
                  : "bg-neutral-950/60 border-white/5 hover:border-white/10 hover:bg-neutral-900/40"
              }`}
            >
              <div className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                activeWonder === idx
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  : "bg-neutral-900 border-white/5"
              }`}>
                {w.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${activeWonder === idx ? "text-amber-400" : "text-zinc-200"}`}>
                    {w.title}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 transition-opacity ${
                    activeWonder === idx ? "text-amber-400" : "text-zinc-500"
                  }`} />
                </div>
                <span className="text-[10px] text-zinc-500 block leading-relaxed">
                  {w.tagline}
                </span>
                <span className="text-[9px] text-zinc-400 line-clamp-1 block">
                  {w.description.slice(0, 52)}...
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* CENTER COLUMN: LIVE DEMO SCREEN */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 self-start bg-neutral-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[500px]">
          
          <div className="space-y-5">
            {/* Header description of selected wonder */}
            <div className="space-y-2 border-b border-white/5 pb-4">
              <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400 block uppercase">
                Wonder {wondersList[activeWonder].id} • Sandbox Controller
              </span>
              <h3 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                {wondersList[activeWonder].icon}
                {wondersList[activeWonder].title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {wondersList[activeWonder].description}
              </p>
            </div>

            {/* INTERACTIVE PLAYGROUND BOXES */}
            <div className="min-h-[240px]">
              
              {/* WONDER 1: Programmable Transaction Block Composer */}
              {activeWonder === 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block">PTB Action Pipeline Checklist:</span>
                  <div className="space-y-2">
                    {ptbActions.map((a, i) => (
                      <div key={a.id} className="flex items-center justify-between bg-neutral-900 border border-white/5 p-3 rounded-xl text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center font-bold font-mono">
                            {i+1}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-white text-[11px] font-mono">{a.type.toUpperCase()}</span>
                            <span className="text-[10px] text-zinc-400">{a.details}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 px-2.5 py-0.5 bg-cyan-950/20 border border-cyan-500/10 rounded-md">
                          {a.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      disabled={isExecutingPtb}
                      onClick={executePTB}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:brightness-110 disabled:opacity-50 text-neutral-950 text-xs font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isExecutingPtb ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                          <span>Atomic Execution Running...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-neutral-950" />
                          <span>Melt and Execute PTB Atomically</span>
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => {
                        setPtbActions([
                          ...ptbActions,
                          { id: Date.now().toString(), type: "lock_asset", details: "Securing dynamic field lock", value: "Sui Guardian" }
                        ]);
                        pushLog("Added custom asset locking block instruction into composition schema.");
                      }}
                      className="px-3 bg-neutral-905 border border-white/10 text-white rounded-xl hover:bg-neutral-850 cursor-pointer text-xs font-bold"
                      title="Add action details to PTB block sequence"
                    >
                      + Action
                    </button>
                  </div>
                </div>
              )}

              {/* WONDER 2: zkLogin Stealth Ephemeral Session Keys */}
              {activeWonder === 1 && (
                <div className="space-y-4">
                  {zkStep === "not_started" && (
                    <div className="space-y-4 bg-neutral-900 border border-white/5 p-4 rounded-xl text-center">
                      <Fingerprint className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">Offline zkLogin Client</span>
                        <p className="text-[10px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                          Secure zero-knowledge generation allows authorizing temporary delegated execution keys. Verify credentials without ever opening wallet signatures.
                        </p>
                      </div>
                      <button
                        onClick={handlezkGenerateSession}
                        className="py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Generate zkLogin Session Key
                      </button>
                    </div>
                  )}

                  {zkStep === "jwt_auth" && (
                    <div className="py-8 text-center space-y-3 bg-neutral-900 border border-white/5 rounded-xl">
                      <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <span className="text-xs text-indigo-400 font-mono block">Authenticating with Google OAuth...</span>
                    </div>
                  )}

                  {zkStep === "proof_gen" && (
                    <div className="py-8 text-center space-y-3 bg-neutral-900 border border-white/5 rounded-xl">
                      <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <span className="text-xs text-pink-400 font-mono block">Computing ZK-Proof client-side circuit...</span>
                    </div>
                  )}

                  {zkStep === "authorized" && (
                    <div className="space-y-4">
                      <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl space-y-1">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>zkLogin Session Authorization Engaged</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono line-clamp-1">KEY: {sessionKey}</span>
                      </div>

                      <div className="bg-neutral-900 border border-white/5 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400 font-bold">Zero-Latency Curation Action:</span>
                          <span className="text-cyan-400 font-mono">{sessionVotes} Signed Transactions</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          Clicking below signs immediately with the delegated ephemeral key. No wallet password requested.
                        </p>
                        <button
                          onClick={handleInteractiveCuration}
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold rounded-xl active:scale-98 transition-transform cursor-pointer shadow-md"
                        >
                          Cast Fast Curation Vote (+2 NEXUS)
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setZkStep("not_started");
                          setSessionVotes(0);
                        }}
                        className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 mx-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset auth keys</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* WONDER 3: SuiNS Subdomain Registry */}
              {activeWonder === 2 && (
                <div className="space-y-4">
                  <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 space-y-3 text-xs">
                    <span className="text-[10px] text-[#a855f7] font-mono tracking-widest block uppercase font-bold">MINT SUBDOMAIN FIELD</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">SUBDOMAIN NAME</span>
                        <div className="relative">
                          <input
                            type="text"
                            value={domainName}
                            onChange={(e) => setDomainName(e.target.value)}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-1.5 px-3 text-white text-xs focus:border-cyan-500 outline-none"
                            placeholder="myname"
                          />
                          <span className="absolute right-2.5 top-1.5 text-zinc-500 text-xs font-mono">.sui</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">DYNAMICAL TARGET</span>
                        <input
                          type="text"
                          value={domainTarget}
                          onChange={(e) => setDomainTarget(e.target.value)}
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl py-1.5 px-3 text-white text-xs focus:border-cyan-500 outline-none font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleRegisterDomain}
                      className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                    >
                      Mint SuiNS Smart Name Index (-1.0 SUI)
                    </button>
                  </div>

                  {/* Registered Records */}
                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase font-bold tracking-widest">Active Name Registrees:</span>
                    {registeredDomains.map((r) => (
                      <div key={r.name} className="flex justify-between items-center bg-neutral-900 border border-white/5 p-2 rounded-xl text-[11px] font-mono">
                        <span className="text-pink-400 font-bold">{r.name}</span>
                        <span className="text-zinc-400 text-[10px] truncate max-w-[140px]">Target: {r.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WONDER 4: DeepBook Order Book Router */}
              {activeWonder === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Visual CLOB Walls */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-3 space-y-1 text-[10px] font-mono">
                      <span className="text-[9px] text-zinc-500 block">NATIVE CLOB WALL (SUI/NEXUS)</span>
                      
                      {/* Ask list */}
                      <div className="space-y-0.5">
                        {askWall.map((a) => (
                          <div key={a.price} className="flex justify-between text-rose-450">
                            <span>{a.price.toFixed(3)}</span>
                            <span>{a.amount}</span>
                          </div>
                        ))}
                      </div>

                      {/* Spread */}
                      <div className="border-y border-white/10 py-1 text-center text-zinc-400 font-bold my-1 text-[11px]">
                        Spread: 0.02 SUI
                      </div>

                      {/* Bid list */}
                      <div className="space-y-0.5">
                        {bidWall.map((b) => (
                          <div key={b.price} className="flex justify-between text-emerald-450">
                            <span>{b.price.toFixed(3)}</span>
                            <span>{b.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Placement form */}
                    <div className="bg-neutral-900 border border-white/5 rounded-2xl p-3 space-y-2.5">
                      <div className="flex gap-1.5 p-0.5 bg-neutral-950 rounded-lg">
                        <button
                          onClick={() => setOrderBookType("buy")}
                          className={`flex-1 py-1.5 rounded text-[10px] font-black cursor-pointer uppercase ${
                            orderBookType === "buy" ? "bg-emerald-500/15 text-emerald-400" : "text-zinc-400"
                          }`}
                        >
                          Buy SUI
                        </button>
                        <button
                          onClick={() => setOrderBookType("sell")}
                          className={`flex-1 py-1.5 rounded text-[10px] font-black cursor-pointer uppercase ${
                            orderBookType === "sell" ? "bg-rose-500/15 text-rose-400" : "text-zinc-400"
                          }`}
                        >
                          Sell SUI
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-[10px] text-zinc-405 font-mono">
                          <span>PRICE (SUI)</span>
                          <span>{orderPrice}</span>
                        </div>
                        <input
                          type="range"
                          min="1.70"
                          max="2.00"
                          step="0.01"
                          value={orderPrice}
                          onChange={(e) => setOrderPrice(e.target.value)}
                          className="w-full accent-emerald-500"
                        />

                        <div className="flex justify-between text-[10px] text-zinc-405 font-mono">
                          <span>AMOUNT</span>
                          <span>{orderQty} SEC</span>
                        </div>
                        <input
                          type="number"
                          value={orderQty}
                          onChange={(e) => setOrderQty(e.target.value)}
                          className="w-full bg-neutral-950 border border-white/10 rounded-lg p-1 px-2 text-white font-mono text-center"
                        />
                      </div>

                      <button
                        onClick={executeDeepMarketOrder}
                        className={`w-full py-2 rounded-xl text-xs font-black cursor-pointer uppercase shadow-md ${
                          orderBookType === "buy" 
                            ? "bg-emerald-500 hover:bg-emerald-600 text-neutral-950" 
                            : "bg-rose-500 hover:bg-rose-600 text-white"
                        }`}
                      >
                        Match CLOB Liquidity
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* WONDER 5: Sui Kiosk Royalty Lockers */}
              {activeWonder === 4 && (
                <div className="space-y-4">
                  <div className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl border ${
                        kioskStatus === "locked" ? "bg-purple-500/15 border-purple-500/35 text-purple-400" : "bg-emerald-500/15 border-emerald-500/35 text-emerald-400"
                      }`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-mono font-bold leading-none">KIOSK CAPSULE PROTECTION</span>
                        <h4 className="text-xs font-black text-white py-1">Nexus Knowledge Object Locker</h4>
                        <span className="text-[10px] px-2 py-0.5 bg-neutral-950 border border-white/5 rounded-md text-zinc-400 font-mono">
                          Status: {kioskStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={toggleKioskLock}
                      className="px-3.5 py-2 bg-neutral-950 border border-white/15 text-white text-[11px] font-bold rounded-xl cursor-pointer hover:bg-neutral-850"
                    >
                      {kioskStatus === "locked" ? "Unlock Locker" : "Engage Move Lock"}
                    </button>
                  </div>

                  <div className="bg-neutral-900 border border-white/5 p-4 rounded-2xl space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-bold">Lease asset out to external validators:</span>
                      <span className="text-[#a855f7] font-mono">Gain {leaseRate} SUI/epoch</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-mono">EPOCHS LENGTH</span>
                        <select
                          value={leaseDuration}
                          onChange={(e) => setLeaseDuration(e.target.value)}
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl p-1.5 focus:border-[#a855f7] text-white"
                        >
                          <option value="3">3 Epochs (~3 days)</option>
                          <option value="7">7 Epochs (~7 days)</option>
                          <option value="15">15 Epochs (~15 days)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-mono">LEASE RATE (SUI)</span>
                        <input
                          type="number"
                          step="0.05"
                          value={leaseRate}
                          onChange={(e) => setLeaseRate(e.target.value)}
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl p-1 px-3 text-white font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={leaseKioskCapsule}
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-black rounded-xl cursor-pointer hover:brightness-115 active:scale-98 transition-transform"
                    >
                      Issue Rent Term Caps Agreement
                    </button>
                  </div>
                </div>
              )}

              {/* WONDER 6: Gas Station Sponsorship */}
              {activeWonder === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    
                    <div className="bg-neutral-900 border border-white/5 p-4 rounded-2xl space-y-3">
                      <span className="text-[10.5px] text-amber-400 font-mono font-bold block uppercase">SPONSOR ENVELOPE</span>
                      <div className="text-center space-y-0.5">
                        <span className="text-[9px] text-zinc-500 uppercase block font-mono">Active Gas Pool</span>
                        <span className="text-lg font-black text-white font-mono">{gasSponsorPoolSui.toFixed(2)} SUI</span>
                      </div>

                      <button
                        onClick={handleDepositSponsorship}
                        className="w-full py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/15 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 text-xs font-semibold rounded-xl cursor-pointer transition-all"
                      >
                        Refuel Pool (+5 SUI)
                      </button>
                    </div>

                    <div className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-1 text-xs">
                        <span className="text-zinc-500 font-mono font-bold uppercase text-[9px] block">SPONSORSHIP STATUS</span>
                        <h4 className="text-white font-black">Zero-Gas End-User Mode</h4>
                        <p className="text-[10px] text-zinc-400 leading-relaxed py-1">
                          When sponsor mode is ENABLED, gas fees are charged directly to the dApp pool instead of your wallet balance.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setIsSponsorEnabled(!isSponsorEnabled);
                          pushLog(`Gas sponsorship state updated: [${!isSponsorEnabled ? "ENABLED" : "DISABLED"}]`);
                        }}
                        className={`w-full py-2 text-xs font-bold rounded-xl cursor-pointer ${
                          isSponsorEnabled 
                            ? "bg-amber-400 text-neutral-950 font-black" 
                            : "bg-white/5 text-zinc-400"
                        }`}
                      >
                        {isSponsorEnabled ? "Sponsorship ACTIVE" : "Sponsorship CLOSED"}
                      </button>
                    </div>

                  </div>

                  <div className="bg-neutral-900 border border-white/5 p-3 px-4 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-zinc-300">Run sponsored dry audit transaction:</span>
                    <button
                      onClick={() => {
                        const fee = 0.0018;
                        if (isSponsorEnabled) {
                          if (gasSponsorPoolSui < fee) {
                            pushLog("Sponsor account drained. Switch off sponsorship or deposit gas!");
                            return;
                          }
                          setGasSponsorPoolSui((p) => Math.max(0, p - fee));
                          pushLog(`Sponsored dry transaction passed! Client gas paid by developer envelope : -${fee} SUI.`);
                        } else {
                          if (wallet.balanceSui < fee) {
                            pushLog("Inadequate balance to settle this operation on-chain.");
                            return;
                          }
                          onUpdateWallet({
                            ...wallet,
                            balanceSui: wallet.balanceSui - fee
                          });
                          pushLog(`Dry transacted! Deducted -${fee} SUI directly from client wallet address.`);
                        }
                      }}
                      className="py-1.5 px-3 bg-neutral-950 border border-white/10 hover:border-cyan-400 rounded-xl font-mono text-[11px] text-zinc-200 cursor-pointer"
                    >
                      Trigger Gas Sponge Run
                    </button>
                  </div>
                </div>
              )}

              {/* WONDER 7: Dynamic Field Breed Chamber */}
              {activeWonder === 6 && (
                <div className="space-y-4">
                  <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 text-xs">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] text-[#06b6d4] font-mono tracking-widest font-extrabold uppercase">Sui Living Object Attributes:</span>
                      <span className="text-[9.5px] px-2 py-0.5 bg-neutral-950 rounded-md font-mono text-zinc-400 uppercase font-black">
                        OBJ: {mutatingNode.id}
                      </span>
                    </div>

                    {/* Attribute tags representing Move dynamic fields */}
                    <div className="flex flex-wrap gap-2 mb-3.5">
                      {mutatingNode.dynamicAttributes.map((attr, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-1.5 bg-neutral-950 border border-white/5 px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-sm"
                        >
                          <span className="text-zinc-400 font-extrabold">{attr.key}:</span>
                          <span className="text-cyan-400 font-bold">{attr.value}</span>
                          <button
                            onClick={() => {
                              const remaining = mutatingNode.dynamicAttributes.filter((_, i) => i !== index);
                              setMutatingNode({ ...mutatingNode, dynamicAttributes: remaining });
                              pushLog(`Pruned dynamic field attribute [${attr.key}] from object.`);
                            }}
                            className="hover:text-rose-450 pl-1 text-[8px]"
                            title="Prune Dynamic Attribute Field"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Breed controller fields */}
                    <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-mono">FIELD KEY IDENTIFIER</span>
                        <input
                          type="text"
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          className="w-full bg-neutral-950 border border-white/10 rounded-lg p-1 px-2.5 text-white text-xs outline-none focus:border-cyan-500"
                          placeholder="auditor_or_cite"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-mono">ASSOCIATED CONTENT</span>
                        <input
                          type="text"
                          value={newVal}
                          onChange={(e) => setNewVal(e.target.value)}
                          className="w-full bg-neutral-950 border border-white/10 rounded-lg p-1 px-2.5 text-white text-xs outline-none focus:border-cyan-500"
                          placeholder="CID_or_signature"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddDynamicField}
                      className="w-full mt-3 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 text-neutral-950 text-xs font-black rounded-xl cursor-pointer hover:scale-[1.01] transition-transform"
                    >
                      Bake and Inject Dynamic Field
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Quick status message */}
          <div className="flex items-center gap-2 text-[10.5px] text-zinc-400 bg-neutral-900/40 p-2.5 px-3 border border-white/5 rounded-2xl">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Interactive simulator. Cast state adjustments to change your wallet indexes instantly.</span>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTIVE LOGS & CONSOLE TERMINAL */}
        <div className="lg:col-span-3 lg:sticky lg:top-4 self-start bg-neutral-950 border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-[#38bdf8] block">
                NEXUS TELEMETRY LOGS
              </span>
              <button
                onClick={() => setCustomLogs([])}
                className="text-[9px] hover:text-white text-zinc-400 flex items-center gap-1 cursor-pointer font-bold uppercase"
              >
                Clear logs
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Consensus layer execution outcomes output live. Watch virtual state transitions updating below:
            </p>

            <div className="bg-[#030305] border border-white/5 p-3 rounded-2xl h-[330px] overflow-y-auto font-mono text-[9.5px] leading-relaxed text-zinc-400 space-y-2 select-all scrollbar-thin">
              {customLogs.length === 0 ? (
                <div className="text-zinc-500 text-center py-20 italic">
                  [Offline Simulator Sandbox Idle] <br/>
                  Awaiting instruction...
                </div>
              ) : (
                customLogs.map((l, i) => (
                  <div key={i} className="border-l border-cyan-500/30 pl-2 text-zinc-300">
                    {l}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-500/5 to-cyan-500/5 p-3 border border-pink-500/10 rounded-2xl text-[10px] space-y-1">
            <span className="font-extrabold text-pink-400 block tracking-wider text-[9px] uppercase">MOVE DEPLOYMENT PARADIGM:</span>
            <p className="text-zinc-400 leading-relaxed">
              These seven stack paradigms showcase comprehensive mastery of the SUI Move virtual machine.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
