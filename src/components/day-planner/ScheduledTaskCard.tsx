
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { TaskCardContent } from './TaskCardContent';
import { ResizeHandle } from './ResizeHandle';
import type { TaskWithClient } from '@/hooks/useTasks';

interface ScheduledTask {
  id: string;
  taskId: string;
  startTime: string;
  duration: number;
  type: 'task' | 'custom';
  title?: string;
  color?: string;
}

interface ScheduledTaskCardProps {
  scheduledTask: ScheduledTask;
  task?: TaskWithClient;
  getAssigneeName: (assigneeId: string | null) => string;
  updateTaskDuration: (taskId: string, duration: number) => void;
  removeScheduledTask: (taskId: string) => void;
}

export const ScheduledTaskCard: React.FC<ScheduledTaskCardProps> = ({
  scheduledTask,
  task,
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

  const calculateHeight = (duration: number) => {
    const slots = Math.ceil(duration / 15);
    return `${slots * 64 - 8}px`; // 64px per slot (60px + 4px gap) minus final gap
  };

  return (
    <Draggable draggableId={`task-${scheduledTask.taskId}`} index={0}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border border-gray-200 rounded-lg shadow-sm relative group absolute left-0 right-0 z-10 ${
            scheduledTask.type === 'custom' 
              ? getCustomColor(scheduledTask.color || 'blue')
              : 'bg-white'
          } ${snapshot.isDragging ? 'shadow-lg' : ''} ${isResizing ? 'select-none' : ''}`}
          style={{ 
            ...provided.draggableProps.style,
            height: calculateHeight(scheduledTask.duration),
            minHeight: '52px',
            top: '2px'
          }}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <TaskCardContent
            scheduledTask={scheduledTask}
            task={task}
            getAssigneeName={getAssigneeName}
            updateTaskDuration={updateTaskDuration}
            removeScheduledTask={removeScheduledTask}
            showControls={showControls}
            dragHandleProps={provided.dragHandleProps}
          />
          
          <ResizeHandle
            scheduledTask={scheduledTask}
            updateTaskDuration={updateTaskDuration}
            isResizing={isResizing}
            setIsResizing={setIsResizing}
          />
        </div>
      )}
    </Draggable>
  );
};
