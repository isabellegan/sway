'use client';

import '@xyflow/react/dist/style.css';

import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  type Edge,
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentNode, type AgentNodeType } from './nodes/AgentNode';
import type { FactoryNode, Phase } from '@/lib/types';

// ─── Node positions — vertical pipeline layout for w-96/h-80 nodes ───────────
// api → redis → queue reads top-to-bottom as an execution pipeline
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  'api-agent':   { x: 60, y: 20  },
  'redis-agent': { x: 60, y: 400 },
  'queue-agent': { x: 60, y: 780 },
};

// ─── Register custom node type OUTSIDE the component to prevent re-creation ───
const nodeTypes = { agentNode: AgentNode };

// ─── Phases where edges should animate ───────────────────────────────────────
const ACTIVE_PHASES: Phase[] = [
  'phase3_running',
  'waiting_resolution',
  'phase4_running',
  'complete',
];

// ─── Auto-fit when nodes first appear ────────────────────────────────────────
function AutoFitView({ nodeCount }: { nodeCount: number }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodeCount > 0) {
      const t = setTimeout(() => fitView({ padding: 0.12, duration: 500 }), 80);
      return () => clearTimeout(t);
    }
  }, [nodeCount, fitView]);

  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface FactoryFloorProps {
  nodes: FactoryNode[];
  phase: Phase;
}

export function FactoryFloor({ nodes, phase }: FactoryFloorProps) {
  const isActive = ACTIVE_PHASES.includes(phase);

  // Convert our FactoryNode[] to React Flow nodes
  const rfNodes: AgentNodeType[] = useMemo(
    () =>
      nodes.map(n => ({
        id: n.id,
        type: 'agentNode' as const,
        position: NODE_POSITIONS[n.id] ?? { x: 0, y: 0 },
        data: { label: n.label, status: n.status, detail: n.detail },
      })),
    [nodes]
  );

  // Create edges only when nodes are present
  const rfEdges: Edge[] = useMemo(() => {
    if (nodes.length === 0) return [];

    const edgeStyle = {
      stroke: isActive ? 'rgba(99, 102, 241, 0.5)' : 'rgba(63, 63, 70, 0.4)',
      strokeWidth: isActive ? 2 : 1,
    };
    const marker = isActive
      ? { type: MarkerType.ArrowClosed, color: 'rgba(99, 102, 241, 0.5)', width: 14, height: 14 }
      : undefined;

    // Pipeline topology: Gateway → Lock Engine → DLQ
    return [
      {
        id: 'e-api-redis',
        source: 'api-agent',
        target: 'redis-agent',
        animated: isActive,
        style: edgeStyle,
        markerEnd: marker,
      },
      {
        id: 'e-redis-queue',
        source: 'redis-agent',
        target: 'queue-agent',
        animated: isActive,
        style: edgeStyle,
        markerEnd: marker,
      },
    ];
  }, [nodes.length, isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="relative flex flex-col h-full overflow-hidden">
      {/* ── Panel label ──────────────────────────────────────────────────────── */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
          Factory Floor
        </span>
        {phase === 'api_loading' && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-mono text-indigo-500 animate-pulse"
          >
            · Synthesizing...
          </motion.span>
        )}
        {phase === 'complete' && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-mono text-emerald-500"
          >
            · All systems nominal
          </motion.span>
        )}
      </div>

      {/* ── React Flow canvas ─────────────────────────────────────────────────── */}
      <div className="flex-1 w-full">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
          className="bg-transparent"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color="rgba(255,255,255,0.05)"
          />
          <AutoFitView nodeCount={nodes.length} />
        </ReactFlow>
      </div>

      {/* ── Empty / loading overlay ──────────────────────────────────────────── */}
      <AnimatePresence>
        {nodes.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none z-10"
          >
            {/* Concentric rings */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-white/5 animate-ping absolute" style={{ animationDuration: '3s' }} />
              <div className="w-16 h-16 rounded-full border border-white/8 animate-ping absolute" style={{ animationDuration: '2.2s', animationDelay: '0.4s' }} />
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <p className="text-zinc-600 text-xs font-mono tracking-widest uppercase">
                {phase === 'api_loading' ? 'Synthesizing Directive' : 'Awaiting Directive'}
              </p>
              {phase === 'api_loading' && (
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <motion.span
                      key={i}
                      className="w-1 h-1 rounded-full bg-indigo-500/60 block"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, delay: d, repeat: Infinity }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
