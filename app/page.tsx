'use client';

import { useState, useEffect } from 'react';
import { TaskBin } from '@/components/TaskBin';
import { AgentStatus } from '@/components/AgentStatus';
import { AddTaskModal } from '@/components/AddTaskModal';
import { Task, Agent, TaskBin as TaskBinType } from '@/lib/types';
import { taskStore } from '@/lib/store';
import { 
  RefreshCw, 
  Zap, 
  Users, 
  Inbox,
  BarChart3,
  Settings
} from 'lucide-react';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bins, setBins] = useState<TaskBinType[]>([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoAssignCount, setAutoAssignCount] = useState(0);

  // Fetch initial data
  useEffect(() => {
    fetchData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // In production, these would be API calls
      // For now, use the in-memory store directly
      setTasks(taskStore.getTasks());
      setAgents(taskStore.getAgents());
      setBins(taskStore.getBins());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleTaskMove = async (taskId: string, targetBinId: string) => {
    try {
      // In production: await fetch(`/api/bins`, { method: 'POST', body: JSON.stringify({ taskId, binId: targetBinId }) });
      const moved = taskStore.moveTaskToBin(taskId, targetBinId);
      if (moved) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleAddTask = async (taskData: {
    title: string;
    description: string;
    priority: number;
    metadata?: any;
  }) => {
    try {
      // In production: await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(taskData) });
      taskStore.createTask({
        ...taskData,
        status: 'pending',
        assignee: null,
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleAutoAssign = async () => {
    try {
      // In production: await fetch('/api/auto-assign', { method: 'POST' });
      const assignedTasks = taskStore.autoAssignTasks();
      setAutoAssignCount(assignedTasks.length);
      fetchData(); // Refresh data
      
      // Reset count after 3 seconds
      setTimeout(() => setAutoAssignCount(0), 3000);
    } catch (error) {
      console.error('Failed to auto-assign:', error);
    }
  };

  const handleAssignToAgent = async (agentId: string) => {
    // Find a pending task to assign
    const pendingTask = tasks.find(t => t.status === 'pending');
    if (pendingTask) {
      try {
        // In production: await fetch('/api/agents', { method: 'POST', body: JSON.stringify({ taskId: pendingTask.id, agentId }) });
        taskStore.assignTaskToAgent(pendingTask.id, agentId as any);
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Failed to assign task:', error);
      }
    }
  };

  // Calculate statistics
  const stats = {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    idleAgents: agents.filter(a => a.status === 'idle').length,
    busyAgents: agents.filter(a => a.status === 'busy').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading task manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Inbox className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PengPeng Task Manager</h1>
                <p className="text-sm text-gray-600">Main agent coordination dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleAutoAssign}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Auto-assign Tasks
                {autoAssignCount > 0 && (
                  <span className="bg-green-800 text-white text-xs px-2 py-1 rounded-full">
                    {autoAssignCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsAddTaskModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Task
              </button>
              
              <button
                onClick={fetchData}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
              <p className="text-xs text-gray-600">Total Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.idleAgents}</p>
              <p className="text-xs text-gray-600">Idle Agents</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.busyAgents}</p>
              <p className="text-xs text-gray-600">Busy Agents</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agents Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Sub-Agents Status
            </h2>
            <div className="text-sm text-gray-600">
              {stats.idleAgents} idle, {stats.busyAgents} busy
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {agents.map(agent => (
              <AgentStatus
                key={agent.id}
                agent={agent}
                onAssignTask={handleAssignToAgent}
              />
            ))}
          </div>
        </section>

        {/* Task Bins Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Task Bins
            </h2>
            <div className="text-sm text-gray-600">
              Drag and drop to prioritize and assign
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bins.map(bin => (
              <TaskBin
                key={bin.id}
                bin={bin}
                tasks={tasks}
                onTaskMove={handleTaskMove}
                onAddTask={bin.id === 'inbox' ? () => setIsAddTaskModalOpen(true) : undefined}
              />
            ))}
          </div>
        </section>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Add new tasks using the "Add Task" button</li>
            <li>• Drag tasks between bins to change priority</li>
            <li>• Use "Auto-assign Tasks" to automatically assign pending tasks to idle agents</li>
            <li>• Click "Assign Task" on idle agents to manually assign tasks</li>
            <li>• Click on tasks to see thought process and details</li>
          </ul>
        </div>
      </main>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
}