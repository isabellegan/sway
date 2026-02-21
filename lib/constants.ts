import type { Sender } from './types';

// ─── Timing ───────────────────────────────────────────────────────────────────
export const TYPING_MS = 1400;   // Duration of "typing…" indicator before message appears
export const INTER_MSG_MS = 700; // Pause between messages in a sequence

// ─── Header ───────────────────────────────────────────────────────────────────
export const DEPLOY_HASH = 'a3f9c2e';

// ─── Phase 1 — Boardroom Auto-Load ───────────────────────────────────────────
export const PHASE1_MESSAGES: ReadonlyArray<{ sender: Sender; text: string }> = [
  {
    sender: 'alice',
    text: "Post-mortem is in. We oversold the limited drop by 500 units. Customer success is in a total meltdown. We cannot ship the Friday release like this.",
  },
  {
    sender: 'bob',
    text: "Logs confirm a classic race condition. Our horizontal pods are processing concurrent checkouts faster than the DB isolation level can keep up.",
  },
  {
    sender: 'alice',
    text: "Can we just beef up the database hardware? Vertical scaling?",
  },
  {
    sender: 'bob',
    text: "No, higher IOPS won't fix application layer concurrency. We need a global distributed lock. I'm thinking a Redis SETNX strategy to ensure atomicity across the cluster.",
  },
];

// ─── Phase 2 — Bob responds to Charlie's TTL question ────────────────────────
export const PHASE2_BOB_TTL =
  "True, if a pod crashes mid-checkout, we can't have deadlocks blocking the remaining inventory. I'll set a 500ms expiry. It's aggressive, but it keeps the inventory fluid. If a pod dies, the lock clears almost instantly.";

// ─── Phase 3 — Escalation ────────────────────────────────────────────────────
export const PHASE3_REDIS_ALERT =
  "CRITICAL: P99 DB write latency is spiking to 650ms. Current lock TTL is 500ms. Risk of 'Lock Leak': Server B will acquire the lock before Server A finishes writing. Collision imminent. Do we hard-increase TTL to 5000ms (high deadlock risk) or implement a watchdog heartbeat (complexity increase)?";

export const PHASE3_BOB_RESPONSE =
  "Damn, the agent is right. If we bump the TTL to 5 seconds and a pod dies, inventory is frozen for 5 seconds. Watchdog is harder to build, but it's the only safe play.";

// ─── Phase 3 — Factory Floor node initial details ────────────────────────────
export const NODE_DETAILS = {
  api_working:   'Intercepting checkout flows...',
  redis_working: 'Provisioning SETNX locks...',
  redis_error:   'LOCK LEAK — P99 latency: 650ms',
  redis_success: 'Watchdog heartbeat active.',
  queue_working: 'Provisioning DLQ...',
} as const;

// ─── Phase 4 — Resolution ────────────────────────────────────────────────────
export const PHASE4_SYSTEM_MSG = '[SYSTEM]: Watchdog initialized. Lock safety verified.';
