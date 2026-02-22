'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// ─── Stagger config ───────────────────────────────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

// ─── Logo — same two-diamond motif as Header + icon.tsx ──────────────────────
function HeroIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 20 20"
      fill="none"
      style={{
        filter:
          'drop-shadow(0 0 6px rgba(16,185,129,0.9)) drop-shadow(0 0 18px rgba(16,185,129,0.45)) drop-shadow(0 0 40px rgba(16,185,129,0.2))',
      }}
    >
      <rect x="6" y="1" width="8" height="8" rx="1"
        transform="rotate(45 10 5)"
        fill="#10b981" opacity="0.18"
      />
      <rect x="7.5" y="2.5" width="5" height="5" rx="0.5"
        transform="rotate(45 10 5)"
        fill="#10b981"
      />
      <rect x="9.5" y="10.5" width="5" height="5" rx="0.5"
        transform="rotate(45 12 13)"
        fill="#34d399" opacity="0.75"
      />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="h-full bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden select-none">

      {/* ── Ambient radial glow ───────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(16,185,129,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ── Dot grid ─────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Hero content ─────────────────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-7"
      >
        {/* Icon */}
        <motion.div variants={item}>
          <HeroIcon />
        </motion.div>

        {/* Wordmark + subtitle */}
        <motion.div variants={item} className="flex flex-col items-center gap-2.5">
          <h1 className="text-[2.75rem] font-semibold tracking-[0.3em] text-white uppercase leading-none">
            Sway
          </h1>
          <p className="text-[11px] font-mono tracking-[0.22em] text-zinc-500 uppercase">
            Human × Agent Collaboration
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={item}
          className="text-sm text-zinc-500 text-center max-w-[340px] leading-relaxed"
        >
          Your agents execute. Your team decides. The command surface where human judgment and AI work together on the decisions that matter most.
        </motion.p>

        {/* CTA */}
        <motion.div variants={item}>
          <Link
            href="/demo"
            onClick={() => sessionStorage.setItem('sway_authorized', '1')}
            className="group flex items-center gap-3 px-7 py-3 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800/80 hover:border-emerald-500/25 text-sm font-mono text-zinc-300 hover:text-white transition-all duration-200 shadow-lg hover:shadow-emerald-500/8 backdrop-blur-sm"
          >
            Launch Session
            <span className="text-zinc-600 group-hover:text-emerald-400 transition-all duration-200 group-hover:translate-x-0.5 inline-block">
              →
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Bottom meta strip ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-5 text-[11px] font-mono text-zinc-700"
      >
        <span>Scenario: High-Concurrency Race Condition</span>
        <span className="text-zinc-800">·</span>
        <span>Agents: 3</span>
        <span className="text-zinc-800">·</span>
        <span>ENV: SIMULATION</span>
      </motion.div>

      {/* ── Corner version tag ────────────────────────────────────────────── */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute top-5 right-6 text-[11px] font-mono text-zinc-700"
      >
        v0.1.0
      </motion.span>
    </div>
  );
}
