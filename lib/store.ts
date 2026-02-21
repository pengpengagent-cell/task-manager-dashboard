import { Task, Agent, TaskBin, TaskStatus, AgentType, SkillLog, AgentLog, ActivityStats, SkillType } from './types';

// In-memory store for prototyping
// Will be replaced with Supabase in production

class TaskStore {
  private tasks: Map<string, Task> = new Map();
  private agents: Map<AgentType, Agent> = new Map();
  private bins: Map<string, TaskBin> = new Map();
  private skillLogs: Map<string, SkillLog> = new Map();
  private agentLogs: Map<string, AgentLog> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize agents
    const agents: Agent[] = [
      { id: 'main', name: 'PengPeng (Main)', status: 'idle', lastHeartbeat: new Date(), currentTaskId: null, capabilities: ['coordination', 'priority_management'] },
      { id: 'dev', name: 'Dev Agent', status: 'idle', lastHeartbeat: new Date(), currentTaskId: null, capabilities: ['code_review', 'deployment', 'environment_setup'] },
      { id: 'learn', name: 'Learn Agent', status: 'idle', lastHeartbeat: new Date(), currentTaskId: null, capabilities: ['analysis', 'research', 'summarization'] },
      { id: 'monitor', name: 'Monitor Agent', status: 'idle', lastHeartbeat: new Date(), currentTaskId: null, capabilities: ['system_monitoring', 'alerting', 'reporting'] },
      { id: 'creator', name: 'Creator Agent', status: 'idle', lastHeartbeat: new Date(), currentTaskId: null, capabilities: ['documentation', 'content_creation', 'report_generation'] },
    ];

    agents.forEach(agent => this.agents.set(agent.id, agent));

    // Initialize task bins
    const bins: TaskBin[] = [
      { id: 'inbox', name: 'Inbox', description: 'New tasks awaiting processing', taskIds: [], maxCapacity: 50, priorityThreshold: 0 },
      { id: 'high-priority', name: 'High Priority', description: 'Priority 1-2 tasks', taskIds: [], maxCapacity: 10, priorityThreshold: 2 },
      { id: 'medium-priority', name: 'Medium Priority', description: 'Priority 3 tasks', taskIds: [], maxCapacity: 20, priorityThreshold: 3 },
      { id: 'low-priority', name: 'Low Priority', description: 'Priority 4-5 tasks', taskIds: [], maxCapacity: 30, priorityThreshold: 5 },
      { id: 'assigned', name: 'Assigned', description: 'Tasks assigned to agents', taskIds: [], maxCapacity: 20, priorityThreshold: 0 },
      { id: 'in-progress', name: 'In Progress', description: 'Tasks being worked on', taskIds: [], maxCapacity: 15, priorityThreshold: 0 },
    ];

    bins.forEach(bin => this.bins.set(bin.id, bin));
  }

  // Task methods
  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Task {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };
    this.tasks.set(id, newTask);

    // Add to inbox bin
    const inbox = this.bins.get('inbox');
    if (inbox && inbox.taskIds.length < inbox.maxCapacity) {
      inbox.taskIds.push(id);
    }

    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  deleteTask(id: string): boolean {
    // Remove from all bins
    this.bins.forEach(bin => {
      const index = bin.taskIds.indexOf(id);
      if (index > -1) {
        bin.taskIds.splice(index, 1);
      }
    });

    return this.tasks.delete(id);
  }

  // Agent methods
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: AgentType): Agent | undefined {
    return this.agents.get(id);
  }

  updateAgent(id: AgentType, updates: Partial<Agent>): Agent | undefined {
    const agent = this.agents.get(id);
    if (!agent) return undefined;

    const updatedAgent = {
      ...agent,
      ...updates,
    };

    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  // Bin methods
  getBins(): TaskBin[] {
    return Array.from(this.bins.values());
  }

  getBin(id: string): TaskBin | undefined {
    return this.bins.get(id);
  }

  moveTaskToBin(taskId: string, binId: string): boolean {
    const task = this.tasks.get(taskId);
    const targetBin = this.bins.get(binId);

    if (!task || !targetBin || targetBin.taskIds.length >= targetBin.maxCapacity) {
      return false;
    }

    // Remove from current bin
    this.bins.forEach(bin => {
      const index = bin.taskIds.indexOf(taskId);
      if (index > -1) {
        bin.taskIds.splice(index, 1);
      }
    });

    // Add to target bin
    targetBin.taskIds.push(taskId);
    return true;
  }

  // Assignment logic
  assignTaskToAgent(taskId: string, agentId: AgentType): boolean {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);

    if (!task || !agent || agent.status === 'busy') {
      return false;
    }

    // Update task
    task.assignee = agentId;
    task.status = 'assigned';
    task.updatedAt = new Date();

    // Update agent
    agent.status = 'busy';
    agent.currentTaskId = taskId;
    agent.lastHeartbeat = new Date();

    // Move to assigned bin
    this.moveTaskToBin(taskId, 'assigned');

    return true;
  }

  // Priority-based assignment
  autoAssignTasks(): string[] {
    const assignedTasks: string[] = [];
    const idleAgents = Array.from(this.agents.values()).filter(a => a.status === 'idle');
    const pendingTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending')
      .sort((a, b) => a.priority - b.priority); // Higher priority first

    for (let i = 0; i < Math.min(idleAgents.length, pendingTasks.length); i++) {
      const agent = idleAgents[i];
      const task = pendingTasks[i];

      if (this.assignTaskToAgent(task.id, agent.id)) {
        assignedTasks.push(task.id);
      }
    }

    return assignedTasks;
  }

  // Skill logging methods
  getSkillLogs(): SkillLog[] {
    return Array.from(this.skillLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  createSkillLog(log: Omit<SkillLog, 'id' | 'timestamp'>): SkillLog {
    const id = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLog: SkillLog = {
      ...log,
      id,
      timestamp: new Date(),
    };
    this.skillLogs.set(id, newLog);
    return newLog;
  }

  // Agent logging methods
  getAgentLogs(): AgentLog[] {
    return Array.from(this.agentLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  createAgentLog(log: Omit<AgentLog, 'id' | 'timestamp'>): AgentLog {
    const id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLog: AgentLog = {
      ...log,
      id,
      timestamp: new Date(),
    };
    this.agentLogs.set(id, newLog);
    return newLog;
  }

  // Activity statistics
  getActivityStats(): ActivityStats {
    const skillUsage: Record<string, number> = {};
    const agentActivity: Record<string, number> = {};
    const phase4Progress: Record<string, number> = {};

    // Count skill usage
    this.skillLogs.forEach(log => {
      skillUsage[log.skill] = (skillUsage[log.skill] || 0) + 1;
    });

    // Count agent activity
    this.agentLogs.forEach(log => {
      agentActivity[log.agent] = (agentActivity[log.agent] || 0) + 1;
    });

    // Calculate Phase 4 progress (goal: 5 uses per skill)
    const skillTypes: SkillType[] = ['dev-flow', 'audit-flow', 'incident-triage', 'notion-writer'];
    skillTypes.forEach(skill => {
      phase4Progress[skill] = Math.min(100, Math.round((skillUsage[skill] || 0) / 5 * 100));
    });

    return {
      skillUsage,
      agentActivity,
      phase4Progress,
    };
  }

  // Get combined activity timeline
  getActivityTimeline(limit: number = 50): Array<SkillLog | AgentLog> {
    const allLogs: Array<SkillLog | AgentLog> = [
      ...this.skillLogs.values(),
      ...this.agentLogs.values(),
    ];

    return allLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// Singleton instance
export const taskStore = new TaskStore();
