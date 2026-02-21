'use client';

import { Task, AgentType } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const statusIcons = {
  pending: <Clock className="w-4 h-4 text-gray-500" />,
  assigned: <User className="w-4 h-4 text-blue-500" />,
  in_progress: <PlayCircle className="w-4 h-4 text-yellow-500" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const agentColors: Record<AgentType, string> = {
  main: 'bg-purple-100 text-purple-800',
  dev: 'bg-blue-100 text-blue-800',
  learn: 'bg-green-100 text-green-800',
  monitor: 'bg-orange-100 text-orange-800',
  creator: 'bg-pink-100 text-pink-800',
};

const priorityColors = {
  1: 'bg-red-100 text-red-800',
  2: 'bg-orange-100 text-orange-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-blue-100 text-blue-800',
  5: 'bg-gray-100 text-gray-800',
};

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`
      bg-white rounded-lg border shadow-sm p-4 mb-2
      ${isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md transition-shadow'}
      cursor-pointer
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            <h3 className="font-semibold text-lg">{task.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
              P{task.priority}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[task.status]}`}>
              {statusIcons[task.status]}
              {task.status.replace('_', ' ')}
            </span>
            
            {task.assignee && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${agentColors[task.assignee]}`}>
                {task.assignee} Agent
              </span>
            )}
            
            {task.metadata?.estimatedDuration && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{task.metadata?.estimatedDuration}m
              </span>
            )}
          </div>
          
          {task.metadata?.thoughtProcess && task.metadata.thoughtProcess.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showDetails ? 'Hide' : 'Show'} thought process ({task.metadata?.thoughtProcess?.length || 0})
              </button>
              
              {showDetails && (
                <div className="mt-2 pl-4 border-l-2 border-blue-200">
                  {task.metadata?.thoughtProcess?.map((thought, index) => (
                    <div key={index} className="text-sm text-gray-700 mb-1">
                      • {thought}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {task.metadata?.errorDetails && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center gap-1 text-red-700 font-medium text-sm mb-1">
                <AlertCircle className="w-4 h-4" />
                Error
              </div>
              <p className="text-red-600 text-sm">{task.metadata?.errorDetails}</p>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 text-right">
          <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
          {task.completedAt && (
            <div>Completed: {new Date(task.completedAt).toLocaleDateString()}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  );
}