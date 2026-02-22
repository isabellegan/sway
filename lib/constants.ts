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
    ring:   'ring-orange-400',
    msg1:   "Whatever you do, do it fast. My team is getting crushed by angry tweets and duplicate charge disputes.",
    msg2:   "As long as it doesn't drop active carts or double-bill them, I'm good. Fix it.",
  },
  {
    id:     'evan',
    name:   'Evan',
    role:   'CISO',
    accent: 'text-slate-400',
    ring:   'ring-slate-400',
    msg1:   "Redis is fine, just ensure the connection string is pulled dynamically from AWS Secrets Manager and not hardcoded.",
    msg2:   "500ms is tight, but acceptable for our risk profile. Ensure the DLQ data is encrypted at rest.",
  },
  {
    id:     'fiona',
    name:   'Fiona',
    role:   'Product Marketing Lead',
    accent: 'text-pink-400',
    ring:   'ring-pink-400',
    msg1:   "If this isn't stabilized, I have to pause the $50k ad spend for Friday's launch. We cannot afford the brand hit of another oversell.",
    msg2:   "Agreed. Fluid inventory is better than frozen inventory. We need to keep the checkout funnel moving.",
  },
  {
    id:     'greg',
    name:   'Greg',
    role:   'CFO',
    accent: 'text-emerald-400',
    ring:   'ring-emerald-400',
    msg1:   "We are currently bleeding revenue. Every blocked checkout is a lost sale. What is the infrastructure cost of scaling Redis globally?",
    msg2:   "A 500ms deadlock risk is cheaper than the alternative. Proceed, but monitor the Redis compute costs.",
  },
  {
    id:     'hannah',
    name:   'Hannah',
    role:   'Lead Data Engineer',
    accent: 'text-cyan-400',
    ring:   'ring-cyan-400',
    msg1:   "If you implement a DLQ, make sure the schema matches our Snowflake ingest pipeline so we can reconcile the failed orders tomorrow.",
    msg2:   "Make sure the DLQ payload includes the raw timestamp and the exact lock state at failure so we can debug the telemetry later.",
  },
  {
    id:     'ian',
    name:   'Ian',
    role:   'Legal Counsel',
    accent: 'text-yellow-400',
    ring:   'ring-yellow-400',
    msg1:   "Overselling inventory violates the Terms of Service for our flash sales. We need an audit trail of exactly which requests hit the race condition.",
    msg2:   "As long as the DLQ captures the rejected PII securely, we satisfy compliance. Keep the audit logs intact.",
  },
  {
    id:     'julia',
    name:   'Julia',
    role:   'SRE Lead',
    accent: 'text-teal-400',
    ring:   'ring-teal-400',
    msg1:   "I'm monitoring the pods now. CPU utilization is fine, this is purely an isolation level bottleneck. Redis is the right call.",
    msg2:   "If we go 500ms, I'm setting up PagerDuty alerts for any lock acquisition failures exceeding 400ms. We need a buffer before expiry.",
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
