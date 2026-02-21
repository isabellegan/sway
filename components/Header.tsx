'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { SystemStatus } from '@/lib/types';

interface HeaderProps {
  systemStatus: SystemStatus;
  deployHash: string | null;
}

export function Header({ systemStatus, deployHash }: HeaderProps) {
  const isOperational = systemStatus === 'operational';

  return (
    <header className="flex-shrink-0 h-14 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 z-20">
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tracking-[0.2em] text-white uppercase">
          Sway
        </span>
        <span className="text-zinc-700 text-xs font-mono tracking-widest hidden sm:block">
          // Orchestration Engine
        </span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2.5">
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
