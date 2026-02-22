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
  PHASE4_COMPILE_MSG,
  PHASE4_SYSTEM_MSG,
  NODE_DETAILS,
} from '@/lib/constants';

type InputGate = 'ttl' | 'approval' | 'resolution' | null;

let _seq = 0;
const uid = () => `msg-${++_seq}-${Date.now()}`;

function buildMsg(sender: Sender, text: string, type: MessageType = 'chat'): ChatMessage {
  return { id: uid(), sender, text, type, timestamp: Date.now() };
}

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

  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sched = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timerIds.current.push(id);
  }, []);

  const revealQueue = useCallback(
    (
      queue: ReadonlyArray<{ sender: Sender; text: string; type?: MessageType }>,
      startAt: number,
      onDone?: () => void
    ) => {
      let t = startAt;
      for (const { sender, text, type = 'chat' } of queue) {
        sched(() => { setIsTyping(true); setTypingAs(sender); }, t);
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

  // ─── approvePR: called when user clicks "Approve & Merge" in the PR modal ───
  const approvePR = useCallback(() => {
    setPhase('pr_approved');

    // T+600ms: Distributed Lock Agent → success (emerald glow)
    sched(() => {
      setNodes(prev =>
        prev.map(n =>
          n.id === 'redis-agent'
            ? { ...n, status: 'success' as const, detail: NODE_DETAILS.redis_success }
            : n
        )
      );
    }, 600);

    // T+1000ms: System types the completion message
    sched(() => { setIsTyping(true); setTypingAs('system'); }, 1000);

    sched(() => {
      setIsTyping(false);
      setTypingAs(null);
      setMessages(prev => [...prev, buildMsg('system', PHASE4_SYSTEM_MSG, 'system_alert')]);
    }, 1000 + TYPING_MS);

    // T+~4400ms: Header flips to Operational
    sched(() => {
      setSystemStatus('operational');
      setDeployHash(DEPLOY_HASH);
      setPhase('complete');
    }, 1000 + TYPING_MS + 1200);
  }, [sched]);

  // ─── Phase 4: Agents write code → PR Modal ────────────────────────────────
  const runPhase4 = useCallback(() => {
    setPhase('phase4_running');
    setInputLocked(true);

    // T+300ms: All three agents update to code-writing state
    sched(() => {
      setNodes(prev =>
        prev.map(n => ({
          ...n,
          status: 'working' as const,
          detail:
            n.id === 'api-agent'
              ? 'Patching checkout handler...'
              : n.id === 'redis-agent'
              ? 'Writing lock.lua (Redlock quorum)...'
              : 'Updating retry + backoff policy...',
        }))
      );
    }, 300);

    // T+500ms: System typing indicator visible in boardroom
    sched(() => { setIsTyping(true); setTypingAs('system'); }, 500);

    // T+2700ms: System message — PR is ready
    sched(() => {
      setIsTyping(false);
      setTypingAs(null);
      setMessages(prev => [...prev, buildMsg('system', PHASE4_COMPILE_MSG, 'system_alert')]);
    }, 500 + TYPING_MS);

    // T+3800ms: Phase → awaiting_pr (PR Modal appears)
    sched(() => {
      setPhase('awaiting_pr');
    }, 3800);
  }, [sched]);

  // ─── Phase 3: Factory Floor + Escalation ──────────────────────────────────
  const runPhase3 = useCallback(
    (epicData: EpicJSON | null) => {
      setPhase('phase3_running');
      setEpic(epicData);

      setNodes([
        { id: 'api-agent',   label: 'Gateway Orchestrator Agent', status: 'working', detail: NODE_DETAILS.api_working },
        { id: 'redis-agent', label: 'Distributed Lock Agent',    status: 'working', detail: NODE_DETAILS.redis_working },
        { id: 'queue-agent', label: 'DLQ Agent',                 status: 'working', detail: NODE_DETAILS.queue_working },
      ]);

      // T+2000ms: Lock Agent detects the leak → flip to error
      sched(() => {
        setNodes(prev =>
          prev.map(n =>
            n.id === 'redis-agent'
              ? { ...n, status: 'error' as const, detail: NODE_DETAILS.redis_error }
              : n
          )
        );
      }, 2000);

      // T+2500ms: Lock Agent pushes CRITICAL alert
      sched(() => { setIsTyping(true); setTypingAs('redis_agent'); }, 2500);
      sched(() => {
        setIsTyping(false);
        setTypingAs(null);
        setMessages(prev => [...prev, buildMsg('redis_agent', PHASE3_REDIS_ALERT, 'agent_alert')]);
      }, 2500 + TYPING_MS);

      // T+2s after alert: Bob weighs in
      const bobAt = 2500 + TYPING_MS + 2000;
      sched(() => { setIsTyping(true); setTypingAs('bob'); }, bobAt);
      sched(() => {
        setIsTyping(false);
        setTypingAs(null);
        setMessages(prev => [...prev, buildMsg('bob', PHASE3_BOB_RESPONSE, 'chat')]);
      }, bobAt + TYPING_MS);

      sched(() => {
        setPhase('waiting_resolution');
        setInputGate('resolution');
        setInputLocked(false);
      }, bobAt + TYPING_MS + INTER_MSG_MS);
    },
    [sched]
  );

  // ─── Phase 1: Auto-load boardroom dialogue ────────────────────────────────
  const startOrchestration = useCallback(() => {
    setPhase('phase1_running');
    revealQueue(PHASE1_MESSAGES, 800, () => {
      setPhase('waiting_input1');
      setInputGate('ttl');
      setInputLocked(false);
    });
  }, [revealQueue]);

  // ─── User message handler ─────────────────────────────────────────────────
  const handleUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || inputLocked || !inputGate) return;

      setMessages(prev => [...prev, buildMsg('charlie', text, 'chat')]);
      setInputLocked(true);

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
          runPhase3(null);
        }
        return;
      }

      if (inputGate === 'resolution') {
        setInputGate(null);
        runPhase4();
        return;
      }
    },
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
    showPRModal: phase === 'awaiting_pr',
    startOrchestration,
    handleUserMessage,
    approvePR,
  };
}
