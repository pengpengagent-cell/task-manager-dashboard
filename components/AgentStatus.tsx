'use client';

import { Agent } from '@/lib/types';
import { 
  User, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  PlayCircle,
  Cpu,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AgentStatusProps {
  agent: Agent;
  onAssignTask?: (agentId: string) => void;
}

const statusConfig = {
  idle: {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    color: 'bg-green-100 text-green-800',
    label: 'Idle',
  },
  busy: {
    icon: <PlayCircle className="w-5 h-5 text-yellow-500" />,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Busy',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    color: 'bg-red-100 text-red-800',
    label: 'Error',
  },
};

const agentIcons: Record<string, JSX.Element> = {
  main: <User className="w-6 h-6 text-purple-600" />,
  dev: <Cpu className="w-6 h-6 text-blue-600" />,
  learn: <Zap className="w-6 h-6 text-green-600" />,
  monitor: <AlertCircle className="w-6 h-6 text-orange-600" />,
  creator: <User className="w-6 h-6 text-pink-600" />,
};

export function AgentStatus({ agent, onAssignTask }: AgentStatusProps) {
  const [timeSinceHeartbeat, setTimeSinceHeartbeat] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const lastHeartbeat = new Date(agent.lastHeartbeat);
      const diffMs = now.getTime() - lastHeartbeat.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        setTimeSinceHeartbeat('Just now');
      } else if (diffMins < 60) {
        setTimeSinceHeartbeat(`${diffMins}m ago`);
      } else {
        const diffHours = Math.floor(diffMins / 60);
        setTimeSinceHeartbeat(`${diffHours}h ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [agent.lastHeartbeat]);

  const status = statusConfig[agent.status];

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {agentIcons[agent.id] || <User className="w-6 h-6 text-gray-600" />}
          </div>
          <div>
            <h3 className="font-bold text-lg">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                {status.icon}
                {status.label}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeSinceHeartbeat}
              </span>
            </div>
          </div>
        </div>
        
        {onAssignTask && agent.status === 'idle' && (
          <button
            onClick={() => onAssignTask(agent.id)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            Assign Task
          </button>
        )}
      </div>

      {agent.currentTaskId && (
        <div className="mb-3 p-2 bg-gray-50 rounded border">
          <p className="text-sm font-medium text-gray-700 mb-1">Current Task</p>
          <p className="text-xs text-gray-600 truncate">ID: {agent.currentTaskId}</p>
        </div>
      )}

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Capabilities</p>
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.map((capability, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {capability.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Agent ID:</span>
          <span className="font-mono">{agent.id}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Status:</span>
          <span className="font-medium">{agent.status}</span>
        </div>
      </div>
    </div>
  );
}