/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Award, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Cpu,
  Wifi,
  Lock,
  UserCheck
} from "lucide-react";

interface ShowcaseStep {
  title: string;
  badge: string;
  description: string;
  icon: any;
  color: string;
}

const SHOWCASE_STEPS: ShowcaseStep[] = [
  {
    title: "Zero-Knowledge zkLogin Verification",
    badge: "01 / AUTHENTICATION",
    description: "Connect to the decentralized knowledge ledger using Web2 login credentials. Generates stealth ephemerals without exposing your raw Google identity.",
    icon: ShieldCheck,
    color: "from-cyan-500 to-blue-600"
  },
  {
    title: "Sui Move Bytecode Compilation",
    badge: "02 / COMPILER",
    description: "We compile real bytecode to assert fact objects as immutable smart components. Sui Move handles secure ownership and type guarantees natively.",
    icon: Terminal,
    color: "from-sky-400 to-indigo-500"
  },
  {
    title: "Dynamic Visual Fact Ledger",
    badge: "03 / MINT & STAKE",
    description: "Anchor structural records as nodes in our multi-dimensional D3 knowledge graph. Connect parents, children, and citations with real-time semantic consensus.",
    icon: Layers,
    color: "from-indigo-500 to-violet-600"
  },
  {
    title: "Peer-to-Peer Validator Voting",
    badge: "04 / CONSENSUS",
    description: "Resolve disputes and validate evidence through delegated staking pools. Stakers verify citations and are rewarded with transaction-backed NEXUS.",
    icon: Award,
    color: "from-violet-500 to-fuchsia-600"
  }
];

export default function FeatureShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Typewriter lines for step 2 (compiler)
  const [codeLineIdx, setCodeLineIdx] = useState(0);
  const codeLines = [
    "module sui_nexus::knowledge_ledger {",
    "  use sui::object::{Self, UID};",
    "  use sui::tx_context::TxContext;",
    "  ",
    "  struct FactObject has key, store {",
    "    id: UID,",
    "    trust_score: u8,",
    "    version: u64,",
    "  }",
    "}"
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 30; // ms per tick
    const totalDuration = 4500; // 4.5s per slide
    const increment = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % SHOWCASE_STEPS.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, activeStep]);

  // Keep compiler code writing animation in sync
  useEffect(() => {
    if (activeStep !== 1) {
      setCodeLineIdx(0);
      return;
    }
    const codeTimer = setInterval(() => {
      setCodeLineIdx((prev) => (prev < codeLines.length ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(codeTimer);
  }, [activeStep]);

  const handleStepSelect = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  const currentStepData = SHOWCASE_STEPS[activeStep];

  return (
    <div id="feature-showcase-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-neutral-950/45 border border-white/5 rounded-3xl p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden">
      
      {/* Decorative absolute element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* LEFT: STEP DESCRIPTIONS CONTROL */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6 z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 font-mono text-[9.5px] rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Interactive Guide Showcase</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Watch how <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Sui Nexus</span> operates
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Experience the asynchronous consensus loop. Browse our functional live-rendered simulator below or step through how zkLogin authentication feeds the Move compilers.
            </p>
          </div>

          {/* Stepper buttons (Timeline) */}
          <div className="space-y-2 pt-2">
            {SHOWCASE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeStep;
              return (
                <button
                  key={idx}
                  onClick={() => handleStepSelect(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-4 relative overflow-hidden cursor-pointer group ${
                    isActive 
                      ? "bg-white/5 border-white/15 shadow-xl" 
                      : "bg-transparent border-transparent hover:bg-white/3"
                  }`}
                >
                  {/* Linear loading progress bar on active item */}
                  {isActive && isPlaying && (
                    <div 
                      className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-cyan-500 to-sky-500 transition-all ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}

                  <div className={`p-2 rounded-xl border shrink-0 transition-colors ${
                    isActive 
                      ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400" 
                      : "bg-neutral-900 border-white/5 text-zinc-500 group-hover:text-zinc-300"
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-500 font-bold block uppercase">
                      {step.badge}
                    </span>
                    <span className={`text-xs font-bold block transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                      {step.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-neutral-900 hover:bg-neutral-850 text-zinc-300 hover:text-white rounded-lg border border-white/5 cursor-pointer flex items-center justify-center transition-all"
              title={isPlaying ? "Pause guide" : "Resume guide"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              onClick={() => {
                setProgress(0);
                setCodeLineIdx(0);
              }}
              className="p-2 bg-neutral-900 hover:bg-neutral-850 text-zinc-300 hover:text-white rounded-lg border border-white/5 cursor-pointer flex items-center justify-center transition-all"
              title="Re-play step"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest">
            {isPlaying ? "Simulating Guide live..." : "Guide playback paused"}
          </span>
        </div>
      </div>

      {/* RIGHT: INTERACTIVE SIMULATING VIDEO DISPLAY (MOCK PLAYER FRAME) */}
      <div className="lg:col-span-7 flex flex-col z-10">
        <div className="w-full h-full min-h-[340px] bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* Header Bar */}
          <div className="bg-[#121215] border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500/70 rounded-full" />
                <span className="w-2.5 h-2.5 bg-amber-500/70 rounded-full" />
                <span className="w-2.5 h-2.5 bg-emerald-500/70 rounded-full" />
              </div>
              <span className="text-[9.5px] font-mono text-zinc-500 bg-neutral-900 border border-white/5 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 ml-2">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>NEXUS-REPLAY://SIMULATOR.SYS</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                <span>350.4 SUI/SEC</span>
              </span>
            </div>
          </div>

          {/* Interactive Screen Display */}
          <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between relative overflow-hidden bg-radial from-[#131316] to-[#0a0a0c]">
            {/* Visual background element */}
            <div className="absolute inset-0 pointer-events-none opacity-5" style={{
              backgroundImage: "radial-gradient(#06b6d4 1.5px, transparent 1.5px)",
              backgroundSize: "16px 16px"
            }} />

            {/* Dynamic Interactive States inside the "Player Video" */}
            <AnimatePresence mode="wait">
              
              {/* STEP 1: zkLogin Connect */}
              {activeStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex-1 flex flex-col items-center justify-center gap-5 py-4"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-cyan-950/40 relative z-10 border border-white/10">
                      <Lock className="w-9 h-9 text-white animate-pulse" />
                    </div>
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-xl scale-125 animate-ping" />
                  </div>

                  <div className="space-y-4 max-w-sm text-center">
                    <div className="space-y-1">
                      <h4 className="text-zinc-200 text-xs font-bold uppercase tracking-widest font-mono">Simulating Web2 OAuth Handshake</h4>
                      <p className="text-[11px] text-zinc-400">Exchanging public credentials for verifiable ZK Proof tokens...</p>
                    </div>

                    {/* Progress slider bar */}
                    <div className="w-full bg-neutral-900 rounded-full h-1 border border-white/5 overflow-hidden">
                      <motion.div 
                        className="bg-cyan-400 h-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                      />
                    </div>

                    {/* Verifying confirmation card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: [0, 1, 1], y: 0 }}
                      transition={{ delay: 1.5, duration: 2 }}
                      className="bg-neutral-900 border border-emerald-500/25 p-3 rounded-xl inline-flex items-center gap-2.5 mx-auto text-emerald-400"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-mono font-bold tracking-wide">✓ zkLogin generated successfully</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Move bytecode compilation */}
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex-1 flex flex-col gap-4 font-mono text-[10.5px]"
                >
                  <div className="flex-1 bg-[#101013] border border-white/5 rounded-xl p-4 overflow-hidden relative shadow-inner">
                    <span className="absolute top-3 right-4 text-[9px] text-zinc-500">Sui Move Compiler v10.4.9</span>
                    <div className="space-y-1 text-zinc-400">
                      {codeLines.slice(0, codeLineIdx).map((line, lIdx) => (
                        <div key={lIdx} className="flex gap-2.5">
                          <span className="text-zinc-500 text-right w-4 select-none">{lIdx + 1}</span>
                          <span className={line.includes("FactObject") || line.includes("use") ? "text-cyan-400" : "text-zinc-350"}>
                            {line}
                          </span>
                        </div>
                      ))}
                      {codeLineIdx < codeLines.length && (
                        <div className="w-1.5 h-3.5 bg-cyan-400 animate-pulse ml-6 inline-block" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-neutral-900 border border-white/5 p-3 rounded-lg leading-none">
                    <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      COMPILING BYTECODE TARGETS
                    </span>
                    <motion.span 
                      className="text-[10.5px] font-bold text-cyan-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      {codeLineIdx === codeLines.length ? "[100% SUCCESS]" : "[92% Compiling]"}
                    </motion.span>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Graph Assertion & Staking */}
              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex-1 flex flex-col justify-center items-center py-4 relative"
                >
                  {/* Floating sketch mockup bubbles in canvas */}
                  <div className="relative w-full h-44 flex items-center justify-center">
                    
                    {/* Node 1 */}
                    <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-14 h-14 bg-neutral-900 border border-dashed border-cyan-400/40 rounded-full flex flex-col items-center justify-center text-center shadow-lg">
                      <span className="text-[8.5px] font-mono text-cyan-400">Address</span>
                      <span className="text-[7.5px] font-mono text-zinc-500">0x81ee...</span>
                    </div>

                    {/* Vector Arrow Line Connecting them */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <motion.line 
                        x1="30%" y1="50%" 
                        x2="65%" y2="50%" 
                        stroke="#06b6d4" 
                        strokeWidth="1.8" 
                        strokeDasharray="4, 4"
                        initial={{ strokeDashoffset: 20 }}
                        animate={{ strokeDashoffset: -20 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      />
                    </svg>

                    {/* Node 2 with sparkling entry */}
                    <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-18 h-18 bg-neutral-950 border-2 border-cyan-400 rounded-full flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
                      <span className="text-[9px] font-extrabold text-white mt-1">Fact Object</span>
                      <span className="text-[7.5px] font-mono text-emerald-400">Verifying...</span>
                    </div>

                  </div>

                  <div className="bg-neutral-900/60 border border-white/5 p-3 rounded-xl w-full text-center space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">CREATOR DEPOSIT</span>
                    <p className="text-xs font-bold text-white leading-none">Locking 10.0 SUI into decentralized curation validators contract...</p>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Peer-to-Peer Validator Voting */}
              {activeStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-[#111114] border border-white/5 p-3.5 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-[8.5px] font-mono text-cyan-500 uppercase font-black">Active Multi-field index</span>
                        <h5 className="text-xs font-bold text-white">Assert: ZKP proving equations on-chain</h5>
                      </div>
                      <div className="bg-pink-950/40 border border-pink-900/30 text-pink-400 px-2 py-0.5 rounded font-mono text-[9px]">
                        DISPUTE FORUM
                      </div>
                    </div>

                    {/* Interactive Ballots counting up */}
                    <div className="grid grid-cols-2 gap-3 pb-2">
                      <div className="bg-neutral-900 border border-emerald-500/10 p-3 rounded-lg text-center space-y-1">
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">BALLOTS UPVOTES</span>
                        <motion.span 
                          className="text-lg font-black text-emerald-400 font-mono"
                          initial={{ children: 0 }}
                          animate={{ children: 147 }}
                          transition={{ duration: 2.8 }}
                        >
                          147
                        </motion.span>
                      </div>

                      <div className="bg-neutral-900 border border-rose-500/10 p-3 rounded-lg text-center space-y-1">
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">BALLOTS OPPOSITIONS</span>
                        <motion.span 
                          className="text-lg font-black text-rose-400 font-mono"
                          initial={{ children: 0 }}
                          animate={{ children: 8 }}
                          transition={{ duration: 1.5 }}
                        >
                          8
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-emerald-500/25 p-3 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block leading-tight">LEDGER VERIFICATION SCORE</span>
                      <span className="text-xs font-bold text-white">Trust score updated dynamically</span>
                    </div>
                    <div className="text-[13px] font-extrabold text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-900/30 px-3 py-1 rounded-lg">
                      ✦ 98.4% PASSED
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Bottom info link footer */}
            <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1.5 uppercase font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Step: {currentStepData.title}
              </span>
              <span className="font-mono text-zinc-500">
                FRAME 00{activeStep + 1} / 004
              </span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
