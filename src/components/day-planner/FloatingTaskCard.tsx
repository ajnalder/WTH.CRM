
import React, { useState, useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/clientGradients';
import type { ScheduledTask } from '@/types/dayPlanner';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { Client } from '@/hooks/useClients';

interface FloatingTaskCardProps {
  scheduledTask: ScheduledTask;
  task?: TaskWithClient;
  client?: Client;
  getAssigneeName: (assigneeId: string | null) => string;
  updateTaskDuration: (taskId: string, duration: number) => void;
  removeScheduledTask: (taskId: string) => void;
  updateTaskStartTime: (taskId: string, startTime: number) => void;
  timelineHeight: number;
}

export const FloatingTaskCard: React.FC<FloatingTaskCardProps> = ({
  scheduledTask,
  task,
  client,
  getAssigneeName,
  updateTaskDuration,
  removeScheduledTask,
  updateTaskStartTime,
  timelineHeight
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const startYRef = useRef(0);
  const startDurationRef = useRef(0);

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

  const getCardStyle = () => {
    if (scheduledTask.task_type === 'custom') {
      return getCustomColor(scheduledTask.color || 'blue');
    }
    
    if (client) {
      return getClientColorClass(client);
    }
    
    return 'bg-white border-gray-200';
  };

  // Calculate position and height based on timeline
  const topPosition = (scheduledTask.start_time / 480) * timelineHeight;
  const cardHeight = Math.max(40, (scheduledTask.duration / 480) * timelineHeight);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    startYRef.current = e.clientY;
    startDurationRef.current = scheduledTask.duration;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaY = e.clientY - startYRef.current;
      const pixelsPerMinute = timelineHeight / 480;
      const deltaMinutes = deltaY / pixelsPerMinute;
      const newDuration = Math.max(15, startDurationRef.current + deltaMinutes);
      
      // Update duration immediately for visual feedback
      updateTaskDuration(scheduledTask.task_id, newDuration);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const formatTime = (minutes: number) => {
    const totalMinutes = 8 * 60 + minutes; // Add 8 AM offset
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const displayHour = hours > 12 ? hours - 12 : hours;
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${mins.toString().padStart(2, '0')}${period}`;
  };

  return (
    <Draggable 
      draggableId={`scheduled-${scheduledTask.task_id}`} 
      index={0}
      isDragDisabled={isResizing}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`absolute left-2 right-2 border rounded-lg shadow-sm group ${getCardStyle()} ${
            snapshot.isDragging ? 'shadow-lg z-50 rotate-1 scale-105' : 'z-10'
          } ${isResizing ? 'select-none' : ''}`}
          style={{
            top: `${topPosition}px`,
            height: `${cardHeight}px`,
            minHeight: '40px',
            ...provided.draggableProps.style
          }}
          onMouseEnter={() => !isResizing && setShowControls(true)}
          onMouseLeave={() => !isResizing && setShowControls(false)}
        >
          <div className="p-3 h-full flex flex-col">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {client && (
                  <Avatar className="h-4 w-4 flex-shrink-0">
                    <AvatarFallback className={`bg-gradient-to-br ${client.gradient} text-white text-xs font-semibold`}>
                      {getInitials(client.company)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div 
                  {...provided.dragHandleProps}
                  className="flex items-center gap-1 cursor-move"
                >
                  <GripVertical size={12} className="text-gray-400" />
                </div>
              </div>
              
              {showControls && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeScheduledTask(scheduledTask.task_id)}
                >
                  <X size={12} />
                </Button>
              )}
            </div>
            
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">
              {scheduledTask.task_type === 'custom' 
                ? scheduledTask.title 
                : task?.title || 'Unknown Task'
              }
            </h4>
            
            <div className="mt-auto pt-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{formatTime(scheduledTask.start_time)}</span>
                <span>{formatDuration(scheduledTask.duration)}</span>
              </div>
            </div>
          </div>
          
          {/* Resize handle */}
          {!snapshot.isDragging && (
            <div
              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-gradient-to-t from-gray-400 via-gray-300 to-transparent rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={handleResizeStart}
            >
              <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gray-600 rounded"></div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
