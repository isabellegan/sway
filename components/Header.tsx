'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Phase, SystemStatus } from '@/lib/types';

interface HeaderProps {
  systemStatus: SystemStatus;
  deployHash: string | null;
  phase: Phase;
}

// ─── Inline icon — same two-diamond motif as app/icon.tsx ─────────────────────
function SwayIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      style={{
        filter:
          'drop-shadow(0 0 3px rgba(16,185,129,0.80)) drop-shadow(0 0 8px rgba(16,185,129,0.35))',
        flexShrink: 0,
      }}
    >
      {/* Soft bloom behind top diamond */}
      <rect x="6" y="1" width="8" height="8" rx="1"
        transform="rotate(45 10 5)"
        fill="#10b981" opacity="0.18"
      />
      {/* Top diamond — bright emerald */}
      <rect x="7.5" y="2.5" width="5" height="5" rx="0.5"
        transform="rotate(45 10 5)"
        fill="#10b981"
      />
      {/* Bottom diamond — offset right, slightly muted */}
      <rect x="9.5" y="10.5" width="5" height="5" rx="0.5"
        transform="rotate(45 12 13)"
        fill="#34d399" opacity="0.75"
      />
    </svg>
  );
}

export function Header({ systemStatus, deployHash, phase }: HeaderProps) {
  const isOperational = systemStatus === 'operational';
  const isProd = phase === 'pr_approved' || phase === 'complete';

  return (
    <header className="flex-shrink-0 h-14 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 z-20">

      {/* ── Left: icon + wordmark ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <SwayIcon />
        <span className="text-lg font-semibold tracking-[0.2em] text-white uppercase">
          Sway
        </span>
        <span className="text-zinc-700 text-xs font-mono tracking-widest hidden sm:block">
          // Orchestration Engine
        </span>
      </div>

      {/* ── Right: env badge + system status ──────────────────────────────── */}
      <div className="flex items-center gap-4">

        {/* Environment badge */}
        <AnimatePresence mode="wait">
          {isProd ? (
            <motion.div
              key="prod"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-1 rounded px-2 py-0.5 bg-emerald-950/50 border border-emerald-500/30"
              style={{ boxShadow: '0 0 10px rgba(16,185,129,0.18)' }}
            >
              <span className="text-[10px] font-mono text-zinc-400">ENV:</span>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-widest">
                PRODUCTION
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="sim"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-1 rounded px-2 py-0.5 bg-zinc-900/80 border border-amber-500/20"
            >
              <span className="text-[10px] font-mono text-zinc-500">ENV:</span>
              <span className="text-[10px] font-mono font-semibold text-blue-400 tracking-widest">
                SIMULATION
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System status */}
        <AnimatePresence mode="wait">
          {isOperational ? (
            <motion.div
              key="operational"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-mono text-emerald-400 tracking-wide">
                System: Operational
              </span>
              {deployHash && (
                <span className="text-xs font-mono text-zinc-600">
                  commit: {deployHash}
                </span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
              <span className="text-xs font-mono text-amber-400 tracking-wide">
                System: Pending
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
