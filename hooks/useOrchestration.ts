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
  Stakeholder,
  StakeholderId,
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
  PHASE_REFACTOR_SYSTEM_MSG,
  NODE_DETAILS,
} from '@/lib/constants';

type InputGate = 'ttl' | 'approval' | 'resolution' | 'refactor' | null;

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
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<StakeholderId | null>(null);

  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Ref so TTL + refactor callback chains always see the stakeholder without stale closure
  const selectedStakeholderRef = useRef<Stakeholder | null>(null);

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

  // ─── approvePR: works for both PR 1 and PR 2 ─────────────────────────────
  const approvePR = useCallback(() => {
    setPhase('pr_approved');

    sched(() => {
      setNodes(prev =>
        prev.map(n =>
          n.id === 'redis-agent'
            ? { ...n, status: 'success' as const, detail: NODE_DETAILS.redis_success }
            : n
        )
      );
    }, 600);

    sched(() => { setIsTyping(true); setTypingAs('system'); }, 1000);

    sched(() => {
      setIsTyping(false);
      setTypingAs(null);
      setMessages(prev => [...prev, buildMsg('system', PHASE4_SYSTEM_MSG, 'system_alert')]);
    }, 1000 + TYPING_MS);

    sched(() => {
      setSystemStatus('operational');
      setDeployHash(DEPLOY_HASH);
      setPhase('complete');
    }, 1000 + TYPING_MS + 1200);
  }, [sched]);

  // ─── requestChanges: "Request Changes" clicked on PR 1 ───────────────────
  const requestChanges = useCallback(() => {
    setPhase('waiting_refactor');
    setInputGate('refactor');
    setInputLocked(false);
  }, []);

  // ─── runRefactoring: triggered when Charlie submits the refactor command ──
  const runRefactoring = useCallback(() => {
    setPhase('refactoring');
    setInputLocked(true);

    // T+300ms: All agents flip to refactoring state
    sched(() => {
      setNodes(prev =>
        prev.map(n => ({
          ...n,
          status: 'working' as const,
          detail:
            n.id === 'api-agent'
              ? NODE_DETAILS.api_refactoring
              : n.id === 'redis-agent'
              ? NODE_DETAILS.redis_refactoring
              : NODE_DETAILS.queue_refactoring,
        }))
      );
    }, 300);

    // T+500ms: System types the refactor message
    sched(() => { setIsTyping(true); setTypingAs('system'); }, 500);

    sched(() => {
      setIsTyping(false);
      setTypingAs(null);
      setMessages(prev => [...prev, buildMsg('system', PHASE_REFACTOR_SYSTEM_MSG, 'system_alert')]);
    }, 500 + TYPING_MS);

    // T+3800ms: PR 2 modal appears
    sched(() => { setPhase('awaiting_pr_2'); }, 3800);
  }, [sched]);

  // ─── Phase 4: Agents write code → PR 1 Modal ──────────────────────────────
  const runPhase4 = useCallback(() => {
    setPhase('phase4_running');
    setInputLocked(true);

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

    sched(() => { setIsTyping(true); setTypingAs('system'); }, 500);

    sched(() => {
      setIsTyping(false);
      setTypingAs(null);
      setMessages(prev => [...prev, buildMsg('system', PHASE4_COMPILE_MSG, 'system_alert')]);
    }, 500 + TYPING_MS);

    // PR 1 pops up
    sched(() => { setPhase('awaiting_pr_1'); }, 3800);
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

      sched(() => {
        setNodes(prev =>
          prev.map(n =>
            n.id === 'redis-agent'
              ? { ...n, status: 'error' as const, detail: NODE_DETAILS.redis_error }
              : n
          )
        );
      }, 2000);

      sched(() => { setIsTyping(true); setTypingAs('redis_agent'); }, 2500);
      sched(() => {
        setIsTyping(false);
        setTypingAs(null);
        setMessages(prev => [...prev, buildMsg('redis_agent', PHASE3_REDIS_ALERT, 'agent_alert')]);
      }, 2500 + TYPING_MS);

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

  // ─── selectStakeholder ────────────────────────────────────────────────────
  const selectStakeholder = useCallback(
    (stakeholder: Stakeholder) => {
      selectedStakeholderRef.current = stakeholder;
      setSelectedStakeholderId(stakeholder.id);

      revealQueue(
        [{ sender: stakeholder.id, text: stakeholder.msg1 }],
        400,
        () => {
          setPhase('waiting_input1');
          setInputGate('ttl');
          setInputLocked(false);
        }
      );
    },
    [revealQueue]
  );

  // ─── Phase 1: Auto-load boardroom dialogue ────────────────────────────────
  const startOrchestration = useCallback(() => {
    setPhase('phase1_running');
    revealQueue(PHASE1_MESSAGES, 800, () => {
      setPhase('waiting_stakeholder');
    });
  }, [revealQueue]);

  // ─── User message handler ─────────────────────────────────────────────────
  const handleUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || inputLocked || !inputGate) return;

      setMessages(prev => [...prev, buildMsg('charlie', text, 'chat')]);
      setInputLocked(true);

      // Gate: TTL question → Bob responds → stakeholder msg2 → approval
      if (inputGate === 'ttl') {
        const stakeholder = selectedStakeholderRef.current;
        setInputGate(null);
        revealQueue(
          [{ sender: 'bob', text: PHASE2_BOB_TTL }],
          600,
          () => {
            if (stakeholder) {
              revealQueue(
                [{ sender: stakeholder.id, text: stakeholder.msg2 }],
                400,
                () => {
                  setPhase('waiting_approval');
                  setInputGate('approval');
                  setInputLocked(false);
                }
              );
            } else {
              setPhase('waiting_approval');
              setInputGate('approval');
              setInputLocked(false);
            }
          }
        );
        return;
      }

      // Gate: approval → API synthesize → Phase 3
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

      // Gate: resolution → Phase 4 (write code → PR 1)
      if (inputGate === 'resolution') {
        setInputGate(null);
        runPhase4();
        return;
      }

      // Gate: refactor command → agents refactor → PR 2
      if (inputGate === 'refactor') {
        setInputGate(null);
        runRefactoring();
        return;
      }
    },
    [inputLocked, inputGate, messages, revealQueue, runPhase3, runPhase4, runRefactoring]
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
    showPRModal: phase === 'awaiting_pr_1' || phase === 'awaiting_pr_2',
    prVersion: phase === 'awaiting_pr_2' ? 2 : 1,
    selectedStakeholderId,
    startOrchestration,
    handleUserMessage,
    approvePR,
    requestChanges,
    selectStakeholder,
  };
}
