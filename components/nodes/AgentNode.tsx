'use client';

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NodeStatus } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type AgentNodeData = { label: string; status: NodeStatus; detail?: string };
export type AgentNodeType = Node<AgentNodeData, 'agentNode'>;

// ─── Status → visual mappings ─────────────────────────────────────────────────
const STATUS_DOT: Record<NodeStatus, string> = {
  idle:    'bg-zinc-600',
  working: 'bg-blue-400 animate-pulse',
  error:   'bg-red-400 animate-pulse',
  success: 'bg-emerald-400 animate-pulse',
};

const CURSOR_COLOR: Record<NodeStatus, string> = {
  idle:    'bg-zinc-700',
  working: 'bg-blue-400',
  error:   'bg-red-400',
  success: 'bg-emerald-400',
};

const TEXT_COLOR: Record<NodeStatus, string> = {
  idle:    'text-zinc-600',
  working: 'text-blue-300',
  error:   'text-red-300',
  success: 'text-emerald-300',
};

const BORDER: Record<NodeStatus, string> = {
  idle:    'border-white/10',
  working: 'border-blue-500/25',
  error:   'border-red-500/55 animate-red-pulse',
  success: 'border-emerald-500/55 animate-emerald-pulse',
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AgentNode({ data }: NodeProps<AgentNodeType>) {
  const { label, status, detail } = data;

  return (
    <div
      className={cn(
        'w-60 rounded-xl overflow-hidden border bg-zinc-950/95 backdrop-blur-md',
        BORDER[status]
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!border-zinc-700 !bg-zinc-800 !w-2 !h-2"
      />

      {/* ── Terminal header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/80 border-b border-white/10">
        {/* macOS traffic lights */}
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />

        {/* Status dot + label */}
        <div className="ml-2 flex items-center gap-1.5 flex-1 min-w-0">
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[status])} />
          <span className="text-zinc-400 text-xs font-mono truncate">{label}</span>
        </div>
      </div>

      {/* ── Terminal body ───────────────────────────────────────────────────── */}
      <div className="p-3 h-24 overflow-hidden font-mono text-[11px] leading-relaxed">
        <div className="text-zinc-700">$ init --agent-mode</div>
        <div className="text-zinc-700">$ connect --cluster redis-prod</div>

        {/* Dynamic status line — animates when detail changes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={detail ?? 'standby'}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            className={cn('mt-1 flex items-center gap-0.5 min-w-0', TEXT_COLOR[status])}
          >
            <span className="text-zinc-600 mr-0.5 flex-shrink-0">{'>'}</span>
            <span className="truncate">{detail ?? 'Standby...'}</span>
            <span
              className={cn(
                'inline-block w-1.5 h-[13px] ml-0.5 flex-shrink-0 animate-cursor',
                CURSOR_COLOR[status]
              )}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-zinc-700 !bg-zinc-800 !w-2 !h-2"
      />
    </div>
  );
}
