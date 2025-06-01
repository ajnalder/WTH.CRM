import React, { useState } from 'react';
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

export const ScheduledTaskCard: React.FC<ScheduledTaskCardProps> = ({
  scheduledTask,
  task,
  client,
  getAssigneeName,
  updateTaskDuration,
  removeScheduledTask
}) => {
  const [showControls, setShowControls] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

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

  const calculateHeight = (duration: number) => {
    const slots = Math.ceil(duration / 15);
    return `${slots * 64 - 8}px`; // 64px per slot (60px + 4px gap) minus final gap
  };

  const getCardStyle = () => {
    if (scheduledTask.type === 'custom') {
      return getCustomColor(scheduledTask.color || 'blue');
    }
    
    if (client) {
      return getClientColorClass(client);
    }
    
    return 'bg-white border-gray-200';
  };

  return (
    <Draggable 
      draggableId={`task-${scheduledTask.taskId}`} 
      index={0}
      isDragDisabled={isResizing}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border rounded-lg shadow-sm relative group absolute left-0 right-0 z-10 ${getCardStyle()} ${
            snapshot.isDragging ? 'shadow-lg z-50 rotate-2 scale-105' : ''
          } ${isResizing ? 'select-none pointer-events-none' : ''}`}
          style={{ 
            height: calculateHeight(scheduledTask.duration),
            minHeight: '52px',
            top: '2px',
            // Let react-beautiful-dnd handle all transforms during drag
            ...provided.draggableProps.style
          }}
          onMouseEnter={() => !isResizing && setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
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
            />
          )}
        </div>
      )}
    </Draggable>
  );
};
