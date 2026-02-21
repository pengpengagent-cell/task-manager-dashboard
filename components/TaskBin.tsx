'use client';

import { TaskBin as TaskBinType, Task } from '@/lib/types';
import { SortableTaskCard } from './TaskCard';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';

interface TaskBinProps {
  bin: TaskBinType;
  tasks: Task[];
  onTaskMove?: (taskId: string, targetBinId: string) => void;
  onAddTask?: () => void;
}

export function TaskBin({ bin, tasks, onTaskMove, onAddTask }: TaskBinProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isOver, setIsOver] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && onTaskMove) {
      onTaskMove(active.id as string, bin.id);
    }
    
    setActiveTask(null);
    setIsOver(false);
  };

  const handleDragOver = () => {
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const binTasks = tasks.filter(task => bin.taskIds.includes(task.id));
  const isFull = binTasks.length >= bin.maxCapacity;
  const usagePercentage = (binTasks.length / bin.maxCapacity) * 100;

  return (
    <div 
      className={`
        bg-gray-50 rounded-lg border-2 p-4 min-h-[400px]
        ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}
        ${isFull ? 'border-red-300 bg-red-50' : ''}
        transition-colors
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{bin.name}</h3>
          <p className="text-sm text-gray-600">{bin.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {binTasks.length} / {bin.maxCapacity}
          </span>
          {bin.priorityThreshold > 0 && (
            <span className="px-2 py-1 bg-gray-200 rounded text-xs">
              P≤{bin.priorityThreshold}
            </span>
          )}
        </div>
      </div>

      {/* Capacity indicator */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, usagePercentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{Math.round(usagePercentage)}%</span>
          <span>100%</span>
        </div>
      </div>

      {isFull && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">Bin is full</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={binTasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {binTasks.map(task => (
              <SortableTaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeTask && (
            <div className="opacity-80">
              <SortableTaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {bin.id === 'inbox' && onAddTask && (
        <button
          onClick={onAddTask}
          className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      )}

      {binTasks.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No tasks in this bin</p>
          <p className="text-sm mt-1">Drag tasks here or create new ones</p>
        </div>
      )}
    </div>
  );
}