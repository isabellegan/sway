'use client';

import { type NodeProps, type Node, Handle, Position } from '@xyflow/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';

// ─── Type ─────────────────────────────────────────────────────────────────────
type TelemetryNodeData = { isActive: boolean };
export type TelemetryNodeType = Node<TelemetryNodeData, 'telemetryNode'>;

// ─── Chart data ───────────────────────────────────────────────────────────────
// Two series share the transition point at t=9 to create a seamless color swap.
const CHART_DATA = [
  { t:  0, high: 648, low: null },
  { t:  1, high: 655, low: null },
  { t:  2, high: 643, low: null },
  { t:  3, high: 651, low: null },
  { t:  4, high: 659, low: null },
  { t:  5, high: 650, low: null },
  { t:  6, high: 652, low: null },
  { t:  7, high: 645, low: null },
  { t:  8, high: 648, low: null },
  { t:  9, high: 120,  low: 120  }, // ← deploy triggered; both series share this point
  { t: 10, high: null, low:  45  },
  { t: 11, high: null, low:  22  },
  { t: 12, high: null, low:  15  },
  { t: 13, high: null, low:  12  },
  { t: 14, high: null, low:  11  },
  { t: 15, high: null, low:  13  },
  { t: 16, high: null, low:  12  },
  { t: 17, high: null, low:  10  },
  { t: 18, high: null, low:  11  },
  { t: 19, high: null, low:  12  },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? payload[1]?.value;
  if (val == null) return null;
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-300 shadow-lg">
      {val} ms
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function TelemetryNode({ data }: NodeProps<TelemetryNodeType>) {
  const { isActive } = data;

  return (
    <div
      className={cn(
        'w-[420px] rounded-xl overflow-hidden border bg-zinc-950/98 backdrop-blur-md',
        'transition-all duration-700',
        isActive
          ? 'border-emerald-500/30 opacity-100 glow-emerald'
          : 'border-white/8 opacity-20 pointer-events-none'
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
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-500',
              isActive ? 'bg-emerald-400' : 'bg-zinc-600'
            )}
          />
          <span className="text-zinc-300 text-[11px] font-mono font-medium">
            Live Telemetry
          </span>
          {isActive && (
            <span className="ml-auto text-[10px] font-mono text-emerald-400">
              p99: 12ms ↓
            </span>
          )}
        </div>
      </div>

      {/* ── Chart body ──────────────────────────────────────────────────────── */}
      <div className="px-2 pt-2 pb-3 h-[192px]">
        {isActive ? (
          <>
            {/* Legend */}
            <div className="flex items-center gap-4 px-2 pb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-500 inline-block rounded" />
                <span className="text-[10px] font-mono text-zinc-500">crisis (650ms)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />
                <span className="text-[10px] font-mono text-zinc-500">post-deploy (12ms)</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={148}>
              <LineChart data={CHART_DATA} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <XAxis dataKey="t" hide />
                <YAxis
                  domain={[0, 700]}
                  tickCount={4}
                  width={34}
                  tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }}
                  tickFormatter={v => `${v}`}
                />
                {/* Danger threshold line */}
                <ReferenceLine
                  y={500}
                  stroke="rgba(239,68,68,0.25)"
                  strokeDasharray="4 4"
                />
                <Tooltip content={<ChartTooltip />} />

                {/* Crisis line — red, t:0–9 */}
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive
                  animationDuration={1400}
                  animationEasing="ease-out"
                />

                {/* Post-deploy line — emerald, t:9–19 */}
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive
                  animationDuration={1800}
                  animationBegin={900}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          /* Inactive placeholder */
          <div className="h-full flex items-center justify-center">
            <span className="text-[11px] font-mono text-zinc-700 tracking-widest uppercase">
              Awaiting Deploy Signal...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
