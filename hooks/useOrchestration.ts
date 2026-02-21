'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  Phase,
  ChatMessage,
  Sender,
  FactoryNode,
  SystemStatus,
  EpicJSON,
  MessageType,
  OrchestrationReturn,
} from '@/lib/types';
import {
  TYPING_MS,
  INTER_MSG_MS,
  DEPLOY_HASH,
  PHASE1_MESSAGES,
  PHASE2_BOB_TTL,
  PHASE3_REDIS_ALERT,
  PHASE3_BOB_RESPONSE,
  PHASE4_SYSTEM_MSG,
  NODE_DETAILS,
} from '@/lib/constants';

// ─── Internal input-gate tracking ────────────────────────────────────────────
type InputGate = 'ttl' | 'approval' | 'resolution' | null;

// ─── Stable ID generator ──────────────────────────────────────────────────────
let _seq = 0;
const uid = () => `msg-${++_seq}-${Date.now()}`;

function buildMsg(sender: Sender, text: string, type: MessageType = 'chat'): ChatMessage {
  return { id: uid(), sender, text, type, timestamp: Date.now() };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOrchestration(): OrchestrationReturn {
  const [phase, setPhase] = useState<Phase>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nodes, setNodes] = useState<FactoryNode[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('pending');
  const [deployHash, setDeployHash] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingAs, setTypingAs] = useState<Sender | null>(null);
  const [inputLocked, setInputLocked] = useState(true);
  const [inputGate, setInputGate] = useState<InputGate>(null);
  const [epic, setEpic] = useState<EpicJSON | null>(null);

  // Stable ref for all scheduled timer IDs (for future cleanup if needed)
  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ─── Scheduler ─────────────────────────────────────────────────────────────
  // Stable: only closes over the ref, not any state
  const sched = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timerIds.current.push(id);
  }, []);

  // ─── Sequential message revealer ───────────────────────────────────────────
  // Cycles through each entry: show typing indicator → show message → repeat
  const revealQueue = useCallback(
    (
      queue: ReadonlyArray<{ sender: Sender; text: string; type?: MessageType }>,
      startAt: number,
      onDone?: () => void
    ) => {
      let t = startAt;

      for (const { sender, text, type = 'chat' } of queue) {
        sched(() => {
          setIsTyping(true);
          setTypingAs(sender);
        }, t);

        t += TYPING_MS;

        sched(() => {
          setIsTyping(false);
          setTypingAs(null);
          setMessages(prev => [...prev, buildMsg(sender, text, type)]);
        }, t);

        t += INTER_MSG_MS;
      }

      if (onDone) sched(onDone, t);
    },
    [sched]
  );

  // ─── Phase 4: Resolution ───────────────────────────────────────────────────
  const runPhase4 = useCallback(() => {
    setPhase('phase4_running');
    setInputLocked(true);

    // T+600ms: Redis node → success (emerald pulse)
    sched(() => {
      setNodes(prev =>
        prev.map(n =>
          n.id === 'redis-agent'
            ? { ...n, status: 'success' as const, detail: NODE_DETAILS.redis_success }
            : n
        )
      );
    }, 600);

    // T+1200ms: System message types in
    sched(() => {
      setIsTyping(true);
      setTypingAs('system');
    }, 1200);

    sched(() => {
      setIsTyping(false);
      setTypingAs(null);
      setMessages(prev => [...prev, buildMsg('system', PHASE4_SYSTEM_MSG, 'system_alert')]);
    }, 1200 + TYPING_MS);

    // T+~3400ms: Header flips to Operational
    sched(() => {
      setSystemStatus('operational');
      setDeployHash(DEPLOY_HASH);
      setPhase('complete');
    }, 1200 + TYPING_MS + 1000);
  }, [sched]);

  // ─── Phase 3: Factory Floor + Escalation ───────────────────────────────────
  const runPhase3 = useCallback(
    (epicData: EpicJSON | null) => {
      setPhase('phase3_running');
      setEpic(epicData);

      // Spin up 3 nodes in working state immediately
      setNodes([
        { id: 'api-agent',   label: 'API Agent',   status: 'working', detail: NODE_DETAILS.api_working },
        { id: 'redis-agent', label: 'Redis Agent', status: 'working', detail: NODE_DETAILS.redis_working },
        { id: 'queue-agent', label: 'Queue Agent', status: 'working', detail: NODE_DETAILS.queue_working },
      ]);

      // T+2000ms: Redis agent detects the lock leak → flip to error (stark red)
      sched(() => {
        setNodes(prev =>
          prev.map(n =>
            n.id === 'redis-agent'
              ? { ...n, status: 'error' as const, detail: NODE_DETAILS.redis_error }
              : n
          )
        );
      }, 2000);

      // T+2500ms: Redis agent pushes CRITICAL alert to Boardroom chat
      sched(() => {
        setIsTyping(true);
        setTypingAs('redis_agent');
      }, 2500);

      sched(() => {
        setIsTyping(false);
        setTypingAs(null);
        setMessages(prev => [
          ...prev,
          buildMsg('redis_agent', PHASE3_REDIS_ALERT, 'agent_alert'),
        ]);
      }, 2500 + TYPING_MS);

      // T+2s after Redis alert: Bob weighs in
      const bobAt = 2500 + TYPING_MS + 2000;

      sched(() => {
        setIsTyping(true);
        setTypingAs('bob');
      }, bobAt);

      sched(() => {
        setIsTyping(false);
        setTypingAs(null);
        setMessages(prev => [...prev, buildMsg('bob', PHASE3_BOB_RESPONSE, 'chat')]);
      }, bobAt + TYPING_MS);

      // Unlock input gate for Charlie's resolution command
      sched(() => {
        setPhase('waiting_resolution');
        setInputGate('resolution');
        setInputLocked(false);
      }, bobAt + TYPING_MS + INTER_MSG_MS);
    },
    [sched]
  );

  // ─── Phase 1: Auto-load boardroom dialogue ─────────────────────────────────
  const startOrchestration = useCallback(() => {
    setPhase('phase1_running');

    revealQueue(PHASE1_MESSAGES, 800, () => {
      // Phase 1 complete — unlock for Charlie's first input
      setPhase('waiting_input1');
      setInputGate('ttl');
      setInputLocked(false);
    });
  }, [revealQueue]);

  // ─── User message handler (Phases 2 & 4 entry points) ─────────────────────
  const handleUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || inputLocked || !inputGate) return;

      // Immediately render Charlie's message and lock input
      setMessages(prev => [...prev, buildMsg('charlie', text, 'chat')]);
      setInputLocked(true);

      // ── Gate 1: TTL question → Bob responds, then await approval ──────────
      if (inputGate === 'ttl') {
        setInputGate(null);
        revealQueue(
          [{ sender: 'bob', text: PHASE2_BOB_TTL }],
          600,
          () => {
            setPhase('waiting_approval');
            setInputGate('approval');
            setInputLocked(false);
          }
        );
        return;
      }

      // ── Gate 2: Approval → fire API, then run Phase 3 ─────────────────────
      if (inputGate === 'approval') {
        setInputGate(null);
        setPhase('api_loading');

        try {
          const res = await fetch('/api/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userCommand: text, history: messages }),
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data = await res.json();
          runPhase3(data.epic ?? null);
        } catch (err) {
          console.error('[useOrchestration] /api/synthesize failed:', err);
          // Gracefully degrade — run Phase 3 without an epic
          runPhase3(null);
        }

        return;
      }

      // ── Gate 3: Resolution → deploy Watchdog (Phase 4) ────────────────────
      if (inputGate === 'resolution') {
        setInputGate(null);
        runPhase4();
        return;
      }
    },
    // messages is in deps so the API call captures the full history
    [inputLocked, inputGate, messages, revealQueue, runPhase3, runPhase4]
  );

  return {
    phase,
    messages,
    nodes,
    systemStatus,
    deployHash,
    isTyping,
    typingAs,
    inputLocked,
    epic,
    startOrchestration,
    handleUserMessage,
  };
}
