export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
export type AgentType = 'main' | 'dev' | 'learn' | 'monitor' | 'creator';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number; // 1-5, 1 = highest
  assignee: AgentType | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  metadata?: {
    thoughtProcess?: string[];
    errorDetails?: string;
    estimatedDuration?: number; // in minutes
    actualDuration?: number; // in minutes
  };
}

export interface Agent {
  id: AgentType;
  name: string;
  status: 'idle' | 'busy' | 'error';
  lastHeartbeat: Date;
  currentTaskId: string | null;
  capabilities: string[];
}

export interface TaskBin {
  id: string;
  name: string;
  description: string;
  taskIds: string[];
  maxCapacity: number;
  priorityThreshold: number;
}

// Skill and Agent Activity Logging
export type SkillType = 'dev-flow' | 'audit-flow' | 'incident-triage' | 'notion-writer';
export type AgentActivityType = 'monitor' | 'dev' | 'learn' | 'creator' | `cron:${string}`;

export interface SkillLog {
  id: string;
  skill: SkillType;
  trigger: string;
  success: boolean;
  notes?: string;
  timestamp: Date;
}

export interface AgentLog {
  id: string;
  agent: AgentActivityType;
  trigger: string;
  durationSeconds?: number;
  success: boolean;
  notes?: string;
  timestamp: Date;
}

export interface ActivityStats {
  skillUsage: Record<string, number>;
  agentActivity: Record<string, number>;
  phase4Progress: Record<string, number>;
}
