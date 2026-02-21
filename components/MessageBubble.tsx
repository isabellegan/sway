'use client';

import type { ChatMessage, Sender } from '@/lib/types';
import { cn } from '@/lib/utils';

const SENDER_META: Record<Sender, { label: string; role: string; labelColor: string }> = {
  alice:       { label: 'Alice',       role: 'PM',         labelColor: 'text-violet-400' },
  bob:         { label: 'Bob',         role: 'Staff Eng',  labelColor: 'text-blue-400'   },
  charlie:     { label: 'Charlie',     role: 'CTO',        labelColor: 'text-indigo-300' },
  system:      { label: 'System',      role: '',           labelColor: 'text-amber-400'  },
  redis_agent: { label: 'Redis Agent', role: 'AI',         labelColor: 'text-red-400'    },
};

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { sender, text, type } = message;
  const meta = SENDER_META[sender];

  // ─── System alert (centered, amber-tinted) ─────────────────────────────────
  if (type === 'system_alert') {
    return (
      <div className="flex justify-center px-4 my-2">
        <div className="max-w-sm text-center bg-zinc-900/70 border border-amber-500/20 rounded-lg px-4 py-2.5">
          <p className="text-amber-300 text-xs font-mono leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  // ─── Agent alert (Redis escalation, left-aligned, red border) ─────────────
  if (type === 'agent_alert') {
    return (
      <div className="flex flex-col gap-1 px-4 my-3 mr-8">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className={cn('text-xs font-mono font-semibold', meta.labelColor)}>
            ⚠ {meta.label}
          </span>
        </div>
        <div className="bg-red-950/40 border border-red-500/40 rounded-xl rounded-tl-sm px-4 py-3 animate-red-pulse">
          <p className="text-red-200 text-xs font-mono leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  // ─── Charlie / CTO (right-aligned) ────────────────────────────────────────
  if (sender === 'charlie') {
    return (
      <div className="flex flex-col items-end gap-1 px-4 my-2 ml-12">
        <span className={cn('text-[10px] font-mono', meta.labelColor)}>
          {meta.label} · {meta.role}
        </span>
        <div className="bg-indigo-950/70 border border-indigo-500/25 rounded-xl rounded-tr-sm px-4 py-3 max-w-xs">
          <p className="text-indigo-100 text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  // ─── Alice / Bob (left-aligned, slightly different shades) ─────────────────
  const bubbleBg =
    sender === 'alice'
      ? 'bg-zinc-800/60 border-white/10'
      : 'bg-zinc-900/70 border-white/8';

  return (
    <div className="flex flex-col gap-1 px-4 my-2 mr-12">
      <span className={cn('text-[10px] font-mono', meta.labelColor)}>
        {meta.label}
        {meta.role && (
          <span className="text-zinc-600"> · {meta.role}</span>
        )}
      </span>
      <div
        className={cn(
          'border rounded-xl rounded-tl-sm px-4 py-3 max-w-xs',
          bubbleBg
        )}
      >
        <p className="text-zinc-200 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
