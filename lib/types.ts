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
  metadata: {
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