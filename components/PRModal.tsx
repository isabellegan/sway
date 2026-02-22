'use client';

import { motion } from 'framer-motion';

interface PRModalProps {
  onApprove: () => void;
}

// ─── Code diff lines ──────────────────────────────────────────────────────────
const DIFF = [
  { type: 'context',  text: '  -- checkout/lock.lua  (rev 2)' },
  { type: 'context',  text: '  local ttl = 500' },
  { type: 'removed',  text: '- SETNX lock_key expires_at' },
  { type: 'added',    text: '+ redlock.lock(\'inventory\', 5000, {' },
  { type: 'added',    text: '+   quorum  = 3,' },
  { type: 'added',    text: '+   fencing = true,' },
  { type: 'added',    text: '+ })' },
  { type: 'context',  text: '  return 1' },
] as const;

const DIFF_STYLE: Record<'context' | 'removed' | 'added', string> = {
  context: 'text-zinc-600 bg-transparent',
  removed: 'text-red-400 bg-red-950/40',
  added:   'text-emerald-400 bg-emerald-950/30',
};

export function PRModal({ onApprove }: PRModalProps) {
  return (
    <motion.div
      key="pr-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-[540px] bg-zinc-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
      >
        {/* ── GitHub-style PR header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-800/70 border-b border-white/10">
          <div className="flex items-center gap-2">
            {/* Merge icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-violet-400 flex-shrink-0">
              <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878zm3.75 7.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm3-8.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" fill="currentColor"/>
            </svg>
            <span className="text-xs font-mono text-zinc-400">Open Pull Request</span>
            <span className="text-xs font-mono text-zinc-600">#47</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-600">14 seconds ago</span>
        </div>

        {/* ── PR body ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-base font-semibold text-zinc-100 leading-snug">
              feat(checkout): implement redlock watchdog &amp; fencing
            </h2>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] font-mono text-zinc-500">
              <span className="text-violet-400">alice</span>
              <span>→</span>
              <span className="text-zinc-400">main</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-500/20">
                +4 −1
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed">
            Replaces single-node SETNX with a 5-node{' '}
            <span className="text-zinc-200 font-mono">Redlock</span> quorum. Adds a
            watchdog heartbeat and{' '}
            <span className="text-zinc-200 font-mono">fencing_token</span> generation
            to prevent stale locks from poisoning inventory state.
          </p>

          {/* Code diff block */}
          <div className="rounded-xl overflow-hidden border border-white/8 bg-zinc-950/80">
            {/* File header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 border-b border-white/8">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="text-[11px] font-mono text-zinc-500">checkout/lock.lua</span>
            </div>
            {/* Diff lines */}
            <div className="font-mono text-[12px] leading-6">
              {DIFF.map((line, i) => (
                <div
                  key={i}
                  className={`px-4 ${DIFF_STYLE[line.type]}`}
                >
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer: reviewers + CTA ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pb-5">
          {/* Reviewer avatars */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-600">Reviewers</span>
            <div className="flex -space-x-1.5">
              {[
                { initial: 'B', ring: 'ring-blue-500/40' },
                { initial: 'A', ring: 'ring-violet-500/40' },
              ].map(({ initial, ring }) => (
                <div
                  key={initial}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ${ring} flex items-center justify-center text-[9px] font-semibold text-zinc-300 uppercase`}
                >
                  {initial}
                </div>
              ))}
            </div>
          </div>

          {/* Approve & Merge */}
          <button
            onClick={onApprove}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Approve &amp; Merge
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
