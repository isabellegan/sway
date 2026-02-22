// ─── Phases ──────────────────────────────────────────────────────────────────
export type Phase =
  | 'idle'
  | 'phase1_running'      // Auto-playing boardroom dialogue
  | 'waiting_stakeholder' // Stakeholder dropdown shown; input stays locked
  | 'waiting_input1'      // Unlock: Charlie asks about TTL
  | 'phase2a_running'     // Bob responds to TTL question
  | 'waiting_approval'    // Unlock: Charlie issues "Approved. Swarm, execute…"
  | 'api_loading'         // POST /api/synthesize in flight
  | 'phase3_running'      // Factory Floor awake; Redis escalation plays out
  | 'waiting_resolution'  // Unlock: Charlie chooses Redlock Watchdog
  | 'phase4_running'      // Agents write code for 3 seconds
  | 'awaiting_pr_1'       // PR #47 shown (hardcoded values); waiting for decision
  | 'waiting_refactor'    // "Request Changes" clicked; input unlocked for Charlie
  | 'refactoring'         // Agents extracting hardcoded values to env config
  | 'awaiting_pr_2'       // PR #48 shown (env vars); waiting for decision
  | 'pr_approved'         // Telemetry node activates; deploy completes
  | 'complete';           // Header → Operational

// ─── Stakeholders ─────────────────────────────────────────────────────────────
export type StakeholderId = 'diana' | 'evan' | 'fiona' | 'greg' | 'hannah' | 'ian' | 'julia';

export interface Stakeholder {
  id: StakeholderId;
  name: string;
  role: string;
  msg1: string;
  msg2: string;
  accent: string; // full Tailwind text-color class  (e.g. 'text-orange-400')
  ring: string;   // full Tailwind ring-color class   (e.g. 'ring-orange-400')
}

// ─── Participants ─────────────────────────────────────────────────────────────
export type Sender = 'alice' | 'bob' | 'charlie' | 'system' | 'redis_agent' | StakeholderId;

// ─── Chat ─────────────────────────────────────────────────────────────────────
export type MessageType = 'chat' | 'system_alert' | 'agent_alert';

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  type: MessageType;
  timestamp: number;
}

// ─── Factory Floor Nodes ──────────────────────────────────────────────────────
export type NodeStatus = 'idle' | 'working' | 'error' | 'success';

export interface FactoryNode {
  id: string;
  label: string;
  status: NodeStatus;
  detail?: string;
}

// ─── System ───────────────────────────────────────────────────────────────────
export type SystemStatus = 'pending' | 'operational';

// ─── Epic (AI output) ─────────────────────────────────────────────────────────
export interface EpicJSON {
  title: string;
  strategy: string;
  components: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedComplexity: 'low' | 'medium' | 'high';
}

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface OrchestrationReturn {
  phase: Phase;
  messages: ChatMessage[];
  nodes: FactoryNode[];
  systemStatus: SystemStatus;
  deployHash: string | null;
  isTyping: boolean;
  typingAs: Sender | null;
  inputLocked: boolean;
  epic: EpicJSON | null;
  showPRModal: boolean;
  prVersion: 1 | 2;
  selectedStakeholderId: StakeholderId | null;
  startOrchestration: () => void;
  handleUserMessage: (text: string) => Promise<void>;
  approvePR: () => void;
  requestChanges: () => void;
  selectStakeholder: (s: Stakeholder) => void;
}
