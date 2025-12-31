
export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  SEARCHING = 'SEARCHING',
  REFLECTING = 'REFLECTING',
  EXECUTING = 'EXECUTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'spark' | 'maestro';
  message: string;
  details?: string;
}

export interface VectorPoint {
  id: string | number;
  collection: string;
  score: number;
  content: string;
  metadata: Record<string, any>;
}

export interface Reflection {
  iteration: number;
  was_productive: boolean;
  key_insight: string;
  next_action: string;
  confidence: number;
}

export interface AgentState {
  status: AgentStatus;
  currentTask: string | null;
  iterations: number;
  maxIterations: number;
  reflections: Reflection[];
  qdrantHits: VectorPoint[];
}
