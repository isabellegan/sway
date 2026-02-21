'use client';

import { useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NodeStatus } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type AgentNodeData = { label: string; status: NodeStatus; detail?: string };
export type AgentNodeType = Node<AgentNodeData, 'agentNode'>;

// ─── Dynamic terminal log generator ──────────────────────────────────────────
// Timestamps are computed once at mount from the real system clock.
function buildLogs(id: string): string[] {
  const now = new Date();
  const ts = (secondsAgo: number) =>
    new Date(now.getTime() - secondsAgo * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

  const map: Record<string, string[]> = {
    // ── Gateway Orchestrator Agent — Next.js HTTP request logs ─────────────
    'api-agent': [
      '$ next start --port=3000 --hostname=0.0.0.0',
      '✓ ready on http://0.0.0.0:3000',
      '─────────────────────────────────────',
      `${ts(14)} POST /api/checkout  200  23ms`,
      `${ts(12)} POST /api/checkout  200  18ms`,
      `${ts(10)} POST /api/checkout  200  31ms`,
      `${ts(8)}  POST /api/checkout  200  22ms`,
      `${ts(6)}  POST /api/checkout  200  19ms`,
      `${ts(4)}  POST /api/checkout  409  12ms  ← race!`,
      `${ts(3)}  POST /api/checkout  200  26ms`,
      `${ts(2)}  POST /api/checkout  200  24ms`,
      `${ts(1)}  POST /api/checkout  200  21ms`,
      '─────────────────────────────────────',
    ],

    // ── Distributed Lock Agent — raw Lua / Redis script ────────────────────
    'redis-agent': [
      '-- KEYS[1]=lock:sku  ARGV[1]=pod  ARGV[2]=ttl',
      'local ex = redis.call("GET", KEYS[1])',
      'if ex == false then',
      '  redis.call("SET", KEYS[1], ARGV[1],',
      '    "PX", ARGV[2])',
      '  return 1',
      'else return 0 end',
      '─────────────────────────────────────',
      `${ts(9)}  > EVAL lock.lua 1 sku:4821 pod-9f2a 500`,
      `${ts(9)}  (integer) 1`,
      `${ts(5)}  > GET sku:4821`,
      `${ts(5)}  "pod-9f2a"`,
      '─────────────────────────────────────',
    ],

    // ── DLQ Agent — AWS CLI JSON output ───────────────────────────────────
    'queue-agent': [
      '$ aws sqs create-queue \\',
      '    --queue-name checkout-dlq.fifo \\',
      '    --region us-east-1',
      '{',
      '  "QueueUrl": "https://sqs.us-east-1...",',
      '  "Arn": "arn:aws:sqs:us-east-1:...",',
      '  "VisibilityTimeout": "30",',
      '  "MessageRetentionPeriod": "259200"',
      '}',
      '─────────────────────────────────────',
      `${ts(6)}  $ aws sqs get-queue-attributes`,
      `${ts(4)}  "ApproximateNumberOfMessages": "0"`,
      '─────────────────────────────────────',
    ],
  };

  return map[id] ?? [];
}

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

  // Compute once at mount — real timestamps, never stale
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const logs = useMemo(() => buildLogs(id), [id]);

  return (
    <div
      className={cn(
        'w-[420px] rounded-xl overflow-hidden border bg-zinc-950/98 backdrop-blur-md',
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
        {/* Static log lines — distinct per agent */}
        <div className="flex-1 overflow-hidden">
          {logs.map((line, i) => (
            <div
              key={i}
              className={cn(
                line.startsWith('$') || line.startsWith('✓')
                  ? 'text-zinc-400'
                  : line.startsWith('─')
                  ? 'text-zinc-800'
                  : line.startsWith('--') || line.startsWith('local') || line.startsWith('if') || line.startsWith('  redis') || line.startsWith('  return') || line.startsWith('else')
                  ? 'text-violet-300/80'
                  : line.startsWith('{') || line.startsWith('}') || line.includes('"')
                  ? 'text-amber-300/70'
                  : 'text-zinc-500'
              )}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Dynamic status line at the bottom */}
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
