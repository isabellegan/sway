import type { Sender, Stakeholder } from './types';

// ─── Timing ───────────────────────────────────────────────────────────────────
export const TYPING_MS = 2200;   // Duration of "typing…" indicator before message appears
export const INTER_MSG_MS = 1200; // Pause between messages in a sequence

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
  "CRITICAL: P99 DB write latency spiking to 650ms. Current lock TTL is 500ms. Risk of 'Lock Leak'. Furthermore, SETNX is a single point of failure — one Redis node down and the entire lock strategy collapses. Do we hard-increase TTL, or implement a Watchdog Heartbeat with a Redlock Quorum and Fencing Tokens?";

export const PHASE3_BOB_RESPONSE =
  "Damn, the agent is right. If we bump the TTL to 5 seconds and a pod dies, inventory is frozen for 5 seconds. Watchdog is harder to build, but it's the only safe play.";

// ─── Phase 3 — Factory Floor node initial details ────────────────────────────
export const NODE_DETAILS = {
  api_working:       'Intercepting checkout streams...',
  redis_working:     'Initializing SETNX lock cluster...',
  redis_error:       'LOCK LEAK — P99 latency: 650ms',
  redis_success:     'Watchdog heartbeat active.',
  queue_working:     'Provisioning dead-letter queue...',
  api_refactoring:   'Refactoring Redis bindings...',
  redis_refactoring: 'Extracting TTL → process.env.REDLOCK_TTL...',
  queue_refactoring: 'Updating DLQ config references...',
} as const;

// ─── Stakeholders ─────────────────────────────────────────────────────────────
export const STAKEHOLDERS: ReadonlyArray<Stakeholder> = [
  {
    id:     'diana',
    name:   'Diana',
    role:   'Head of Customer Success',
    accent: 'text-orange-400',
    ring:   'ring-orange-500/40',
    msg1:   "Ticket volume for duplicate charges is spiking. We need this resolved before the next traffic surge.",
    msg2:   "Understood. Prioritize preventing double-billing over maintaining active carts if necessary.",
  },
  {
    id:     'evan',
    name:   'Evan',
    role:   'CISO',
    accent: 'text-slate-400',
    ring:   'ring-slate-500/40',
    msg1:   "Ensure the Redis connection strings are rotated and pulled directly from AWS Secrets Manager.",
    msg2:   "500ms is within our acceptable risk profile. Verify that the DLQ payload is encrypted at rest.",
  },
  {
    id:     'fiona',
    name:   'Fiona',
    role:   'Product Marketing Lead',
    accent: 'text-pink-400',
    ring:   'ring-pink-500/40',
    msg1:   "If this isn't stabilized, I have to pause the $50k ad spend for Friday's launch. We cannot afford the brand hit of another oversell.",
    msg2:   "Agreed. A higher drop-off rate is preferable to overselling. We need to keep the checkout funnel moving.",
  },
  {
    id:     'greg',
    name:   'Greg',
    role:   'CFO',
    accent: 'text-emerald-400',
    ring:   'ring-emerald-500/40',
    msg1:   "Every blocked checkout is hitting the top line. Outline the infrastructure cost of scaling Redis globally before we commit.",
    msg2:   "The 500ms deadlock risk is acceptable. Proceed, but log the associated compute costs for the Redis cluster.",
  },
  {
    id:     'hannah',
    name:   'Hannah',
    role:   'Lead Data Engineer',
    accent: 'text-cyan-400',
    ring:   'ring-cyan-500/40',
    msg1:   "Ensure the DLQ schema strictly matches our Snowflake ingest pipeline for tomorrow's order reconciliation.",
    msg2:   "Include the raw timestamp and the exact lock state at failure in the DLQ payload for telemetry debugging.",
  },
  {
    id:     'ian',
    name:   'Ian',
    role:   'SRE Lead',
    accent: 'text-yellow-400',
    ring:   'ring-yellow-500/40',
    msg1:   "Pod CPU utilization is stable; this is strictly a database isolation bottleneck. A Redis-backed lock is the correct architectural path.",
    msg2:   "At a 500ms TTL, I will configure PagerDuty alerts for any lock acquisition latency exceeding 400ms.",
  },
  {
    id:     'julia',
    name:   'Julia',
    role:   'Legal Counsel',
    accent: 'text-teal-400',
    ring:   'ring-teal-500/40',
    msg1:   "Overselling violates our flash sale Terms of Service. We require an immutable audit trail of all requests hitting the race condition.",
    msg2:   "Provided the DLQ sanitizes and secures rejected PII, we meet compliance requirements. Preserve the audit logs.",
  },
];

// ─── Refactor phase — after "Request Changes" on PR 1 ───────────────────────
export const PHASE_REFACTOR_SYSTEM_MSG =
  '[SYSTEM]: Agents refactoring. Hardcoded values extracted to env config. PR #48 queued.';

// ─── Phase 4 — Resolution ────────────────────────────────────────────────────
// Emitted during Phase 4 while agents write code
export const PHASE4_COMPILE_MSG =
  '[SYSTEM]: Agents compiling. Pull request queued for review.';

// Emitted after PR approval
export const PHASE4_SYSTEM_MSG =
  '[SYSTEM]: Redlock watchdog active. Fencing token verified. Quorum: 3/3. Deploy successful.';
