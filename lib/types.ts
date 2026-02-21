// ─── Phases ──────────────────────────────────────────────────────────────────
export type Phase =
  | 'idle'
  | 'phase1_running'     // Auto-playing boardroom dialogue
  | 'waiting_input1'     // Unlock: Charlie asks about TTL
  | 'phase2a_running'    // Bob responds to TTL question
  | 'waiting_approval'   // Unlock: Charlie issues "Approved. Swarm, execute…"
  | 'api_loading'        // POST /api/synthesize in flight
  | 'phase3_running'     // Factory Floor awake; Redis escalation plays out
  | 'waiting_resolution' // Unlock: Charlie chooses Watchdog
  | 'phase4_running'     // Watchdog deploy sequence
  | 'complete';          // Header → Operational

// ─── Participants ─────────────────────────────────────────────────────────────
export type Sender = 'alice' | 'bob' | 'charlie' | 'system' | 'redis_agent';

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
  startOrchestration: () => void;
  handleUserMessage: (text: string) => Promise<void>;
}
