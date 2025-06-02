
import React, { useState, useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { TaskCardContent } from './TaskCardContent';
import { ResizeHandle } from './ResizeHandle';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { Client } from '@/hooks/useClients';
import type { ScheduledTask } from '@/types/dayPlanner';

interface ScheduledTaskCardProps {
  scheduledTask: ScheduledTask;
  task?: TaskWithClient;
  client?: Client;
  getAssigneeName: (assigneeId: string | null) => string;
  updateTaskDuration: (taskId: string, duration: number) => void;
  removeScheduledTask: (taskId: string) => void;
}

export const ScheduledTaskCard: React.FC<ScheduledTaskCardProps> = React.memo(({
  scheduledTask,
  task,
  client,
  getAssigneeName,
  updateTaskDuration,
  removeScheduledTask
}) => {
  const [showControls, setShowControls] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getCustomColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 border-blue-300';
      case 'green': return 'bg-green-100 border-green-300';
      case 'yellow': return 'bg-yellow-100 border-yellow-300';
      case 'red': return 'bg-red-100 border-red-300';
      case 'purple': return 'bg-purple-100 border-purple-300';
      default: return 'bg-blue-100 border-blue-300';
    }
  };

  const getClientColorClass = (client: Client) => {
    // Extract the color from the gradient for background tint
    const gradientMatch = client.gradient.match(/from-(\w+)-\d+/);
    const color = gradientMatch ? gradientMatch[1] : 'blue';
    
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200';
      case 'green': return 'bg-green-50 border-green-200';
      case 'purple': return 'bg-purple-50 border-purple-200';
      case 'red': return 'bg-red-50 border-red-200';
      case 'yellow': return 'bg-yellow-50 border-yellow-200';
      case 'pink': return 'bg-pink-50 border-pink-200';
      case 'indigo': return 'bg-indigo-50 border-indigo-200';
      case 'teal': return 'bg-teal-50 border-teal-200';
      case 'orange': return 'bg-orange-50 border-orange-200';
      case 'cyan': return 'bg-cyan-50 border-cyan-200';
      case 'lime': return 'bg-lime-50 border-lime-200';
      case 'rose': return 'bg-rose-50 border-rose-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getCardStyle = (client: Client | undefined, scheduledTask: ScheduledTask) => {
    if (scheduledTask.task_type === 'custom') {
      return getCustomColor(scheduledTask.color || 'blue');
    }
    
    if (client) {
      return getClientColorClass(client);
    }
    
    return 'bg-white border-gray-200';
  };

  const calculateHeight = (duration: number) => {
    const slots = Math.ceil(duration / 15);
    return `${Math.max(60, slots * 69 - 8)}px`;
  };

  // Dummy function to satisfy ResizeHandle props - we don't use this during resize
  const handleTempDurationChange = () => {
    // Do nothing - we handle this with direct DOM manipulation now
  };

  // Memoize the style object to prevent unnecessary re-renders
  const cardStyle = React.useMemo(() => ({
    height: calculateHeight(scheduledTask.duration),
    minHeight: '60px',
    top: '4px',
    left: '4px',
    right: '4px',
  }), [scheduledTask.duration]);

  // Memoize the card class to prevent recalculation
  const cardClassName = React.useMemo(() => 
    `border rounded-lg shadow-sm relative group absolute inset-x-0 z-10 ${getCardStyle(client, scheduledTask)} ${
      isResizing ? 'select-none transition-none transform-none' : 'transition-all duration-200'
    }`, [client, scheduledTask, isResizing]);

  return (
    <Draggable 
      draggableId={scheduledTask.task_id} 
      index={0}
      isDragDisabled={isResizing}
    >
      {(provided, snapshot) => (
        <div
          ref={(el) => {
            provided.innerRef(el);
            cardRef.current = el;
          }}
          {...provided.draggableProps}
          data-task-card
          className={`${cardClassName} ${
            snapshot.isDragging ? 'shadow-lg z-50 rotate-2 scale-105' : ''
          }`}
          style={{ 
            ...cardStyle,
            ...provided.draggableProps.style,
            // Prevent any transforms that might cause position jumps
            ...(isResizing ? { transform: 'none !important' } : {})
          }}
          onMouseEnter={() => !isResizing && setShowControls(true)}
          onMouseLeave={() => !isResizing && setShowControls(false)}
        >
          <TaskCardContent
            scheduledTask={scheduledTask}
            task={task}
            client={client}
            getAssigneeName={getAssigneeName}
            updateTaskDuration={updateTaskDuration}
            removeScheduledTask={removeScheduledTask}
            showControls={showControls}
            dragHandleProps={provided.dragHandleProps}
          />
          
          {!snapshot.isDragging && (
            <ResizeHandle
              scheduledTask={scheduledTask}
              updateTaskDuration={updateTaskDuration}
              isResizing={isResizing}
              setIsResizing={setIsResizing}
              onTempDurationChange={handleTempDurationChange}
            />
          )}
        </div>
      )}
    </Draggable>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.scheduledTask.duration === nextProps.scheduledTask.duration &&
    prevProps.scheduledTask.task_id === nextProps.scheduledTask.task_id &&
    prevProps.scheduledTask.start_time === nextProps.scheduledTask.start_time &&
    prevProps.task?.id === nextProps.task?.id &&
    prevProps.client?.id === nextProps.client?.id
  );
});

ScheduledTaskCard.displayName = 'ScheduledTaskCard';
