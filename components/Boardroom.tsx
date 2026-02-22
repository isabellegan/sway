'use client';

/**
 * SOUND SETUP (optional):
 * Place /public/sounds/pop.mp3 and /public/sounds/error.mp3 for UI audio.
 * The demo degrades gracefully if the files are absent.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { MessageBubble } from './MessageBubble';
import { cn } from '@/lib/utils';
import type { ChatMessage, Phase, Sender } from '@/lib/types';

const SENDER_LABEL: Record<Sender, string> = {
  alice:       'Alice',
  bob:         'Bob',
  charlie:     'Charlie',
  system:      'System',
  redis_agent: 'Distributed Lock Agent',
};

const PLACEHOLDER: Partial<Record<Phase, string>> = {
  waiting_input1:     'Ask the team a question...',
  waiting_approval:   'Issue your directive...',
  waiting_resolution: 'Choose your resolution...',
};

// ─── Avatar data ──────────────────────────────────────────────────────────────
const AVATARS = [
  { id: 'alice',   initial: 'A', ring: 'ring-violet-500/40' },
  { id: 'bob',     initial: 'B', ring: 'ring-blue-500/40'   },
  { id: 'charlie', initial: 'C', ring: 'ring-indigo-500/40' },
];

interface BoardroomProps {
  messages: ChatMessage[];
  isTyping: boolean;
  typingAs: Sender | null;
  inputLocked: boolean;
  handleUserMessage: (text: string) => Promise<void>;
  phase: Phase;
}

function TypingIndicator({ sender }: { sender: Sender }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <span className="text-[11px] font-mono text-zinc-500">
        {SENDER_LABEL[sender]} is typing
      </span>
      <div className="flex items-center gap-1">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full bg-zinc-600 block"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.55, delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}

export function Boardroom({
  messages,
  isTyping,
  typingAs,
  inputLocked,
  handleUserMessage,
  phase,
}: BoardroomProps) {
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const [playPop]   = useSound('/sounds/pop.mp3',   { volume: 0.25 });
  const [playError] = useSound('/sounds/error.mp3', { volume: 0.45 });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const latest = messages[messages.length - 1];
      try {
        if (latest?.type === 'agent_alert') playError();
        else playPop();
      } catch { /* audio files absent */ }
      prevCountRef.current = messages.length;
    }
  }, [messages, playPop, playError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    // Hook's handleUserMessage internally ignores messages when gate is closed
    setInputValue('');
    await handleUserMessage(text);
  };

  const placeholder = PLACEHOLDER[phase] ?? 'Type a message...';

  return (
    <section className="flex flex-col h-full border-r border-white/10 overflow-hidden">

      {/* ── Panel label + avatars ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/10">
        <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
          Boardroom
        </span>

        {/* Premium avatar row */}
        <div className="flex items-center gap-2">
          {AVATARS.map(({ id, initial, ring }) => (
            <div
              key={id}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center',
                'bg-gradient-to-br from-zinc-700 to-zinc-900',
                'ring-1 shadow-lg',
                ring,
                'text-[10px] font-semibold text-zinc-300 uppercase select-none'
              )}
            >
              {initial}
            </div>
          ))}
        </div>
      </div>

      {/* ── Message feed ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <MessageBubble message={msg} />
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && typingAs && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
            >
              <TypingIndicator sender={typingAs} />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ───────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 p-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="relative">
          {/* Input is ALWAYS enabled — the hook gates processing internally */}
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-3 pr-12',
              'text-sm text-zinc-100 placeholder:text-zinc-600',
              'focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30',
              'transition-all duration-200 hover:border-white/20'
            )}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg',
              'flex items-center justify-center transition-all duration-150',
              !inputValue.trim()
                ? 'text-zinc-700 cursor-not-allowed'
                : 'text-indigo-400 hover:bg-indigo-500/15 hover:text-indigo-300'
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

        {/* Persistent role hint — matches message label font size exactly */}
        <p className="mt-2 text-xs font-mono text-zinc-500 px-1">
          {'>'} You are Charlie · CTO
        </p>
      </div>
    </section>
  );
}
