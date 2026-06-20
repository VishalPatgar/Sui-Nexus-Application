/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ReactNode } from "react";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import { KnowledgeNode, RelationshipEdge } from "../types";
import { 
  Plus, 
  Info, 
  Network, 
  AlertCircle, 
  X, 
  ThumbsUp, 
  ThumbsDown, 
  Zap,
  Globe,
  Share2,
  Maximize2,
  Minimize2
} from "lucide-react";

interface GraphCanvasProps {
  nodes: KnowledgeNode[];
  edges: RelationshipEdge[];
  selectedNode: KnowledgeNode | null;
  onSelectNode: (node: KnowledgeNode | null) => void;
  onAddNodeClick: () => void;
  filteredNodeIds: Set<string> | null;
  filteredEdgeIds: Set<string> | null;
  onVoteNode?: (voteType: "upvote" | "downvote") => Promise<void> | void;
  sidePanel?: ReactNode;
}

export default function GraphCanvas({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  onAddNodeClick,
  filteredNodeIds,
  filteredEdgeIds,
  onVoteNode,
  sidePanel
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: 600, height: 440 });
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [popupCoords, setPopupCoords] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const isClickFromCanvasRef = useRef(false);
  const isPopupOpenRef = useRef(false);

  // Keep ref in sync to avoid rebuilding the force simulation on popup toggle
  useEffect(() => {
    isPopupOpenRef.current = isPopupOpen;
  }, [isPopupOpen]);

  // Monitor size adjustments
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(400, width),
          height: Math.max(300, height)
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isFullscreen]); // refire observer on fullscreen toggle

  // Update popup coordinates and state if the selected node moves
  useEffect(() => {
    if (!selectedNode) {
      setIsPopupOpen(false);
      setPopupCoords(null);
    } else {
      if (!isClickFromCanvasRef.current) {
        setIsPopupOpen(false);
        setPopupCoords(null);
      } else {
        setIsPopupOpen(true);
      }
    }
    isClickFromCanvasRef.current = false;
  }, [selectedNode]);

  // D3 FORCE SIMULATION GRAPH GENERATOR
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const { width, height } = dimensions;

    const d3Nodes = nodes.map((n) => ({
      ...n,
      x: (n as any).x || width / 2 + (Math.random() - 0.5) * 160,
      y: (n as any).y || height / 2 + (Math.random() - 0.5) * 160,
    }));

    const d3Links = edges.map((e) => ({
      ...e,
      source: d3Nodes.find((n) => n.id === e.source) || e.source,
      target: d3Nodes.find((n) => n.id === e.target) || e.target,
    }));

    const simulation = d3
      .forceSimulation(d3Nodes as any)
      .force("link", d3.forceLink(d3Links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.12)) // gravitational pull to center to prevent flying out
      .force("y", d3.forceY(height / 2).strength(0.12)) // gravitational pull to center to prevent flying out
      .force("collision", d3.forceCollide().radius((d: any) => (d.size || 22) + 20)) // prevent scrambled clusters
      .alphaTarget(0.012); // subtle buoyancy

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    
    // Neon Glow filter
    const glowFilter = defs
      .append("filter")
      .attr("id", "neon-glow")
      .attr("x", "-35%")
      .attr("y", "-35%")
      .attr("width", "170%")
      .attr("height", "170%");

    glowFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "7")
      .attr("result", "blur");

    glowFilter
      .append("feMerge")
      .selectAll("feMergeNode")
      .data(["blur", "SourceGraphic"])
      .enter()
      .append("feMergeNode")
      .attr("in", (d) => d);

    // Glass Background Gradient
    const glassGrad = defs
      .append("linearGradient")
      .attr("id", "glass-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    glassGrad.append("stop").attr("offset", "0%").attr("stop-color", "#18181b").attr("stop-opacity", 0.94);
    glassGrad.append("stop").attr("offset", "100%").attr("stop-color", "#09090b").attr("stop-opacity", 0.98);

    const relationColors = {
      implements: "#f43f5e",
      extends: "#06b6d4",
      cites: "#fbbf24",
      contradicts: "#ef4444",
      proves: "#10b981"
    };

    const relationTypes = ["implements", "extends", "cites", "contradicts", "proves"];
    relationTypes.forEach((type) => {
      defs
        .append("marker")
        .attr("id", `arrow-${type}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 31) 
        .attr("refY", 0)
        .attr("markerWidth", 7)
        .attr("markerHeight", 7)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-4L8,0L0,4")
        .attr("fill", relationColors[type as keyof typeof relationColors] || "#a1a1aa");
    });

    defs
      .append("marker")
      .attr("id", "arrow-default")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", "#71717a");

    const gContainer = svg.append("g");

    // Semantic connections (lines)
    const link = gContainer
      .append("g")
      .selectAll("line")
      .data(d3Links)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => relationColors[d.relationshipType as keyof typeof relationColors] || "#71717a")
      .attr("stroke-width", (d: any) => 1.8 + (d.weight / 60))
      .attr("stroke-opacity", (d: any) => {
        if (filteredEdgeIds) {
          return filteredEdgeIds.has(d.id) ? 0.95 : 0.12;
        }
        return 0.5;
      })
      .attr("marker-end", (d: any) => `url(#arrow-${d.relationshipType || "default"})`)
      .attr("stroke-dasharray", (d: any) => (d.relationshipType === "cites" ? "4, 4" : "none"));

    const linkLabel = gContainer
      .append("g")
      .selectAll("text")
      .data(d3Links)
      .enter()
      .append("text")
      .text((d: any) => `${d.relationshipType} (${d.weight})`)
      .attr("font-size", "8px")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-weight", "600")
      .attr("fill", "#a1a1aa")
      .attr("text-anchor", "middle")
      .attr("opacity", 0)
      .style("pointer-events", "none");

    link
      .on("mouseover", function (event, d: any) {
        d3.select(this).attr("stroke-width", 3.5).attr("stroke-opacity", 1);
        linkLabel.filter((l: any) => l.id === d.id).attr("opacity", 0.95);
      })
      .on("mouseout", function (event, d: any) {
        const op = filteredEdgeIds ? (filteredEdgeIds.has(d.id) ? 0.95 : 0.12) : 0.5;
        d3.select(this).attr("stroke-width", 1.8 + (d.weight / 60)).attr("stroke-opacity", op);
        linkLabel.filter((l: any) => l.id === d.id).attr("opacity", 0);
      });

    // Node Containers
    const node = gContainer
      .append("g")
      .selectAll(".node")
      .data(d3Nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag()
          .on("start", (e: any, d: any) => {
            if (!e.active) simulation.alphaTarget(0.25).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (e: any, d: any) => {
            d.fx = e.x;
            d.fy = e.y;
          })
          .on("end", (e: any, d: any) => {
            if (!e.active) simulation.alphaTarget(0.012);
            d.fx = null;
            d.fy = null;
          }) as any
      );

    // Glowing Neon Outer Aura for Selected Nodes
    node
      .append("circle")
      .attr("r", (d: any) => (d.size || 22) + 6)
      .attr("fill", "transparent")
      .attr("stroke", (d: any) => d.color || "#06b6d4")
      .attr("stroke-width", 2.5)
      .attr("stroke-opacity", (d: any) => (selectedNode && selectedNode.id === d.id ? 0.95 : 0))
      .attr("filter", "url(#neon-glow)");

    // MODERN GLASSMORPHIC COMPONENT CIRCLE
    node
      .append("circle")
      .attr("r", (d: any) => d.size || 22)
      .attr("fill", "url(#glass-gradient)")
      .attr("stroke", (d: any) => d.color || "#06b6d4")
      .attr("stroke-width", (d: any) => (selectedNode && selectedNode.id === d.id ? 2.5 : 1.5))
      .attr("stroke-opacity", (d: any) => {
        if (filteredNodeIds) {
          return filteredNodeIds.has(d.id) ? 1.0 : 0.22;
        }
        return 0.9;
      })
      .attr("cursor", "pointer")
      .style("transition", "stroke-width 0.15s ease");

    // Dynamic Concentric Inner Technical Ring
    node
      .append("circle")
      .attr("r", (d: any) => (d.size || 22) * 0.72)
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.color || "#06b6d4")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3, 2")
      .attr("stroke-opacity", (d: any) => {
        if (filteredNodeIds) {
          return filteredNodeIds.has(d.id) ? 0.35 : 0.08;
        }
        return 0.3;
      })
      .style("pointer-events", "none");

    // Core Solid Core Jewel Indicator
    node
      .append("circle")
      .attr("r", 4.5)
      .attr("fill", (d: any) => d.color || "#06b6d4")
      .attr("opacity", (d: any) => {
        if (filteredNodeIds) {
          return filteredNodeIds.has(d.id) ? 1.0 : 0.25;
        }
        return 0.95;
      });

    // Sleek Labels
    node
      .append("text")
      .text((d: any) => d.name)
      .attr("dy", ".31em")
      .attr("y", (d: any) => -(d.size || 22) - 10)
      .attr("text-anchor", "middle")
      .attr("font-family", "Plus Jakarta Sans, system-ui, sans-serif")
      .attr("font-weight", "800")
      .attr("font-size", "10px")
      .attr("letter-spacing", "0.02em")
      .attr("fill", (d: any) => (selectedNode && selectedNode.id === d.id ? "#ffffff" : "#f4f4f5"))
      .attr("opacity", (d: any) => (filteredNodeIds && !filteredNodeIds.has(d.id) ? 0.35 : 1.0))
      .style("pointer-events", "none");

    // Minimal dynamic trust score tag line below bubble
    node
      .append("text")
      .text((d: any) => `${d.trustScore}% Verified`)
      .attr("y", (d: any) => (d.size || 22) + 12)
      .attr("text-anchor", "middle")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-weight", "600")
      .attr("font-size", "8px")
      .attr("fill", (d: any) => d.color || "#10b981")
      .attr("opacity", (d: any) => (filteredNodeIds && !filteredNodeIds.has(d.id) ? 0.25 : 0.85))
      .style("pointer-events", "none");

    // Click handler to register coords & node select
    node.on("click", (event, d: any) => {
      event.stopPropagation();
      isClickFromCanvasRef.current = true;
      onSelectNode(d);
      setIsPopupOpen(true);
      setPopupCoords({ x: d.x, y: d.y });
    });

    // Simulation Tick Listener
    simulation.on("tick", () => {
      const time = Date.now() / 2400;

      d3Nodes.forEach((n: any, idx: number) => {
        const radius = n.size || 22;
        // Enforce boundary walls matching current container measurements
        n.x = Math.max(radius + 30, Math.min(width - radius - 30, n.x));
        n.y = Math.max(radius + 30, Math.min(height - radius - 30, n.y));

        if (!n.fx) {
          // Subtle drifting float calculation
          n.x += Math.sin(time + idx * 1.5) * 0.15;
          n.y += Math.cos(time * 0.95 + idx * 2.2) * 0.15;
        }
      });

      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2 - 5);

      // Keep coordinates updated in local popup track if bubble is active
      node.attr("transform", (d: any) => {
        if (selectedNode && selectedNode.id === d.id && isPopupOpenRef.current) {
          // Continually update positioning smoothly
          setPopupCoords({ x: d.x, y: d.y });
        }
        return `translate(${d.x},${d.y})`;
      });
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, dimensions, selectedNode, filteredNodeIds, filteredEdgeIds]);

  const handleQuickVoteProxy = async (type: "upvote" | "downvote") => {
    if (!onVoteNode || !selectedNode || votingInProgress) return;
    setVotingInProgress(true);
    try {
      await onVoteNode(type);
    } catch(e) {
      console.error(e);
    } finally {
      setVotingInProgress(false);
    }
  };

  // ⚠️ THE OTHER SIDE MECHANISM: Determine if popup is on left or right half
  // If pop-up is on the left half, we transition absolute UI to the RIGHT.
  // If pop-up is on the right half, we transition absolute UI to the LEFT.
  const isPopupOnLeft = popupCoords && popupCoords.x < dimensions.width / 2;

  // Escape key listener to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Wrap the graph canvas content so fullscreen can include a side panel
  const graphContent = (
    <div
      ref={containerRef}
      id="knowledge-graph-canvas"
      className={
        isFullscreen
          ? "flex-1 min-w-0 bg-[#030306] bg-[radial-gradient(rgba(255,255,255,0.02)_1.5px,transparent_1.5px)] bg-[size:32px_32px] overflow-hidden flex flex-col group justify-between relative"
          : "relative w-full h-[480px] bg-[#050508] bg-[radial-gradient(rgba(255,255,255,0.02)_1.5px,transparent_1.5px)] bg-[size:28px_28px] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col group justify-between"
      }
      onClick={() => onSelectNode(null)}
    >
      {/* 📺 FULLSCREEN TOGGLE BUTTON — single button only */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-none">
        <button
          id="graph-fullscreen-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(!isFullscreen);
          }}
          title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
          className={`flex items-center gap-2 px-3 py-2.5 border text-xs font-bold rounded-xl shadow-lg transition-all duration-300 backdrop-blur-md cursor-pointer pointer-events-auto font-mono uppercase ${
            isFullscreen
              ? "bg-red-500/15 hover:bg-red-500 border-red-500/30 text-red-300 hover:text-neutral-950 hover:shadow-red-950/25"
              : "bg-neutral-900/90 hover:bg-neutral-800 border-white/10 hover:border-white/20 text-zinc-300 hover:text-white"
          }`}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 shrink-0" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 🔮 SLIDING FLOATING OVERLAY: Title Badge */}
      <div 
        className={`absolute top-4 transition-all duration-500 ease-out z-20 pointer-events-none ${
          selectedNode && isPopupOnLeft ? "right-16" : "left-4"
        }`}
      >
        <div className="flex items-center gap-2.5 bg-neutral-900/90 border border-white/10 p-2.5 px-3.5 rounded-2xl backdrop-blur-md pointer-events-auto shadow-md">
          <Network className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase">MUTABLE LEDGER GRAPH</span>
            <span className="text-[10px] font-bold text-white">
              {nodes.length} Fact Nodes • {edges.length} Semantic Links
            </span>
          </div>
        </div>
      </div>

      {/* 🔮 SLIDING FLOATING OVERLAY: Mint/Assert Button */}
      <button
        id="add-node-floating-btn"
        onClick={(e) => {
          e.stopPropagation();
          onAddNodeClick();
        }}
        className={`absolute bottom-16 z-30 p-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:brightness-110 text-neutral-950 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 ease-out text-xs font-bold flex items-center gap-2 cursor-pointer pointer-events-auto ${
          selectedNode && isPopupOnLeft ? "right-4" : "left-4"
        }`}
      >
        <Plus className="w-4 h-4 text-neutral-950" />
        <span>Assert Fact Object</span>
      </button>

      {/* Main SVG Container */}
      <div className="flex-1 min-h-0 relative">
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-10 h-10 text-zinc-600 animate-bounce" />
            <span className="text-xs text-zinc-500 font-mono">Ledger states uninitialized...</span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full block focus:outline-none"
          />
        )}

        {/* 📚 INSTANT IN-PLACE PREVIEW POPUP CARD OVERLAY */}
        <AnimatePresence>
          {selectedNode && isPopupOpen && popupCoords && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute z-40 w-[270px] bg-neutral-950/95 border border-white/10 p-3.5 rounded-2xl flex flex-col gap-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.92)] backdrop-blur-md text-left"
              style={{
                // Calculate position next to the clicked bubble
                left: isPopupOnLeft 
                  ? Math.min(dimensions.width - 290, popupCoords.x + 24) 
                  : Math.max(16, popupCoords.x - 294),
                top: Math.max(16, Math.min(dimensions.height - 230, popupCoords.y - 80))
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-1.5 h-1.5 rounded-full animate-ping" 
                      style={{ backgroundColor: selectedNode.color || "#06b6d4" }} 
                    />
                    <span className="text-[8.5px] font-mono tracking-wider font-extrabold text-cyan-400 uppercase">
                      QUICK BUBBLE PREVIEW
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight font-sans">
                    {selectedNode.name}
                  </h4>
                </div>
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="p-1 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Small Summary Extract */}
              <div className="text-[10px] text-zinc-300 leading-normal font-sans bg-neutral-900/40 p-2.5 border border-white/5 rounded-lg select-all max-h-[85px] overflow-y-auto">
                {selectedNode.description || "No specific on-chain description anchored to this factual object yet."}
              </div>

              {/* Trust gauge */}
              <div className="space-y-1 bg-white/2 p-2 rounded-lg border border-white/5">
                <div className="flex items-center justify-between text-[8px] font-mono font-bold text-zinc-500">
                  <span>CONSENSUS TRUST SCORE</span>
                  <span className="text-emerald-400 font-extrabold">{selectedNode.trustScore}% Verified</span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all" 
                    style={{ width: `${selectedNode.trustScore}%` }} 
                  />
                </div>
              </div>

              {/* Vote Ballot */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={votingInProgress}
                  onClick={() => handleQuickVoteProxy("upvote")}
                  className="py-1.5 flex items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-[10px] font-bold rounded-xl cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  title="Assert fact validity (+1 Curation score)"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Upvote</span>
                </button>

                <button
                  disabled={votingInProgress}
                  onClick={() => handleQuickVoteProxy("downvote")}
                  className="py-1.5 flex items-center justify-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 text-[10px] font-bold rounded-xl cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  title="Flag assertion error"
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>Dispute</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legends info guide panel */}
      <div className="bg-neutral-950/95 border-t border-white/5 p-3 px-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-[10px] text-zinc-400 select-none z-10 backdrop-blur-md">
        <div className="flex items-center gap-1.5 leading-relaxed">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Interactive bubbles. Tap nodes to summon an in-place Quick Preview summary & cast validator ballots instantly.</span>
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9px] shrink-0 font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
            <span>Implements</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
            <span>Extends</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
            <span>Cites</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>Proves</span>
          </div>
        </div>
      </div>
    </div>
  );

  // If fullscreen, wrap in a fixed overlay with the side panel
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#030306] flex flex-row overflow-hidden">
        {graphContent}
        {sidePanel && (
          <div className="w-[340px] shrink-0 bg-neutral-950 border-l border-white/5 overflow-y-auto">
            {sidePanel}
          </div>
        )}
      </div>
    );
  }

  return graphContent;
}
