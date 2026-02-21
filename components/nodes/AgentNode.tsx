'use client';

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NodeStatus } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type AgentNodeData = { label: string; status: NodeStatus; detail?: string };
export type AgentNodeType = Node<AgentNodeData, 'agentNode'>;

// ─── Per-node static terminal log lines ──────────────────────────────────────
const STATIC_LOGS: Record<string, string[]> = {
  'api-agent': [
    '$ init --mode=gateway --replicas=6',
    '$ probe --targets=checkout-svc:8080',
    '───────────────────────────',
    '[12:04:01] pod/web-6d4f → 200 OK  14ms',
    '[12:04:01] pod/web-7c2a → 200 OK  11ms',
    '[12:04:02] pod/web-9f1b → 200 OK  16ms',
    '[12:04:02] pod/web-3e8c → 200 OK  12ms',
    '[12:04:03] pod/web-1a8d → 200 OK  13ms',
    '[12:04:03] pod/web-5f2e → 200 OK  10ms',
    '───────────────────────────',
    '[12:04:04] routing table: 6 pods healthy',
    '[12:04:04] p50: 12ms  p99: 48ms',
    '$ watch --event=checkout --stream',
  ],
  'redis-agent': [
    '$ init --mode=setnx --cluster=redis-ha',
    '$ connect --nodes=3 --quorum=2',
    '───────────────────────────',
    '[12:04:01] node/redis-0: LEADER   ok',
    '[12:04:01] node/redis-1: FOLLOWER ok',
    '[12:04:01] node/redis-2: FOLLOWER ok',
    '[12:04:02] lock:sku-4821 → acquired',
    '[12:04:02]   owner=pod/web-7c2a ttl=500ms',
    '[12:04:03] lock:sku-4821 → released',
    '───────────────────────────',
    '[12:04:03] throughput: 843 locks/s',
    '[12:04:04] p99 write latency: 41ms',
    '$ monitor --locks --ttl-drift',
  ],
  'queue-agent': [
    '$ init --mode=dlq --broker=sqs-prod',
    '$ configure --timeout=30s --retention=72h',
    '───────────────────────────',
    '[12:04:01] queue/checkout-dlq: READY',
    '[12:04:01]   visibility-timeout: 30s',
    '[12:04:01]   max-retries: 3',
    '[12:04:02] consumer/dlq-1: IDLE',
    '[12:04:02] consumer/dlq-2: IDLE',
    '[12:04:03] backoff: exponential 2x',
    '───────────────────────────',
    '[12:04:03] messages in flight: 0',
    '[12:04:04] dlq depth: 0 msgs',
    '$ subscribe --topic=checkout-failures',
  ],
};

// ─── Status → visual mappings ─────────────────────────────────────────────────
const STATUS_DOT: Record<NodeStatus, string> = {
  idle:    'bg-zinc-600',
  working: 'bg-blue-400',
  error:   'bg-red-400',
  success: 'bg-emerald-400',
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
  working: 'border-blue-500/20',
  error:   'border-red-500/50 glow-red',
  success: 'border-emerald-500/50 glow-emerald',
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AgentNode({ id, data }: NodeProps<AgentNodeType>) {
  const { label, status, detail } = data;
  const staticLogs = STATIC_LOGS[id] ?? [];

  return (
    <div
      className={cn(
        'w-96 rounded-xl overflow-hidden border bg-zinc-950/98 backdrop-blur-md',
        BORDER[status]
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!border-zinc-700 !bg-zinc-800 !w-2 !h-2"
      />

      {/* ── Terminal header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-zinc-900/90 border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />

        <div className="ml-2 flex items-center gap-1.5 flex-1 min-w-0">
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[status])} />
          <span className="text-zinc-300 text-[11px] font-mono font-medium truncate">{label}</span>
        </div>
      </div>

      {/* ── Terminal body ───────────────────────────────────────────────────── */}
      <div className="p-3 h-80 overflow-hidden font-mono text-[11px] leading-relaxed flex flex-col">
        {/* Static log lines */}
        <div className="flex-1 overflow-hidden space-y-0">
          {staticLogs.map((line, i) => (
            <div
              key={i}
              className={cn(
                line.startsWith('$') ? 'text-zinc-400' :
                line.startsWith('─') ? 'text-zinc-800 tracking-widest' :
                'text-zinc-600'
              )}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Dynamic current-status line — animates when detail changes */}
        <div className="pt-1 border-t border-white/5 mt-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={detail ?? 'standby'}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.18 }}
              className={cn('flex items-center gap-0.5 min-w-0', TEXT_COLOR[status])}
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
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-zinc-700 !bg-zinc-800 !w-2 !h-2"
      />
    </div>
  );
}
