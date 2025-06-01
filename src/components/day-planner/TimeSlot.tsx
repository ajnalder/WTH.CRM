
import React, { useState, useRef } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, GripVertical, X, MoreVertical } from 'lucide-react';
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

interface TimeSlotProps {
  timeSlot: string;
  scheduledTask?: ScheduledTask;
  task?: TaskWithClient;
  getAssigneeName: (assigneeId: string | null) => string;
  updateTaskDuration: (taskId: string, duration: number) => void;
  removeScheduledTask: (taskId: string) => void;
  isOccupied: boolean;
  isFirstSlot: boolean;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  timeSlot,
  scheduledTask,
  task,
  getAssigneeName,
  updateTaskDuration,
  removeScheduledTask,
  isOccupied,
  isFirstSlot
}) => {
  const [showControls, setShowControls] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const initialDurationRef = useRef(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    return `${slots * 60 - 4}px`; // 60px per slot minus gap
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!scheduledTask) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startYRef.current = e.clientY;
    initialDurationRef.current = scheduledTask.duration;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startYRef.current;
      const slotHeight = 60; // Each 15-minute slot is 60px
      const slotsChanged = Math.round(deltaY / slotHeight);
      const newDuration = Math.max(15, initialDurationRef.current + (slotsChanged * 15));
      
      // Cap at reasonable maximum (8 hours)
      const cappedDuration = Math.min(newDuration, 480);
      
      if (cappedDuration !== scheduledTask.duration) {
        updateTaskDuration(scheduledTask.taskId, cappedDuration);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // If this slot is occupied but not the first slot, render as occupied space
  if (isOccupied && !isFirstSlot) {
    return (
      <div className="flex items-center border-b border-gray-100 py-2">
        <div className="w-20 text-sm text-gray-500 font-mono">
          {timeSlot}
        </div>
        <div className="flex-1 ml-4 min-h-[60px] bg-gray-50 rounded border-2 border-dashed border-gray-200">
          {/* Occupied space - no content */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center border-b border-gray-100 py-2">
      <div className="w-20 text-sm text-gray-500 font-mono">
        {timeSlot}
      </div>
      
      <Droppable droppableId={`timeslot-${timeSlot}`}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 ml-4 min-h-[60px] border-2 border-dashed rounded-lg p-2 transition-colors ${
              snapshot.isDraggingOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            {scheduledTask && isFirstSlot ? (
              <Draggable draggableId={`task-${scheduledTask.taskId}`} index={0}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`border border-gray-200 rounded-lg shadow-sm relative group ${
                      scheduledTask.type === 'custom' 
                        ? getCustomColor(scheduledTask.color || 'blue')
                        : 'bg-white'
                    } ${snapshot.isDragging ? 'shadow-lg' : ''} ${isResizing ? 'select-none' : ''}`}
                    style={{ 
                      ...provided.draggableProps.style,
                      height: calculateHeight(scheduledTask.duration),
                      minHeight: '56px'
                    }}
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(false)}
                  >
                    <div className="p-3 h-full flex flex-col">
                      <div {...provided.dragHandleProps} className="absolute top-2 left-2 cursor-move">
                        <GripVertical size={14} className="text-gray-400" />
                      </div>
                      
                      {showControls && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeScheduledTask(scheduledTask.taskId)}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      )}
                      
                      <div className="ml-6 mr-8 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {scheduledTask.type === 'custom' ? scheduledTask.title : task?.title}
                          </h4>
                          {task && (
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          {task && (
                            <div className="flex items-center space-x-1">
                              <User size={12} />
                              <span>{getAssigneeName(task.assignee)}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{scheduledTask.duration}min</span>
                          </div>
                        </div>
                        
                        {showControls && (
                          <div className="mt-2">
                            <Select
                              value={scheduledTask.duration.toString()}
                              onValueChange={(value) => updateTaskDuration(scheduledTask.taskId, parseInt(value))}
                            >
                              <SelectTrigger className="h-6 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 min</SelectItem>
                                <SelectItem value="30">30 min</SelectItem>
                                <SelectItem value="45">45 min</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1.5 hours</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                                <SelectItem value="180">3 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Resize Handle */}
                    <div
                      ref={resizeRef}
                      className={`absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-gradient-to-t from-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg ${
                        isResizing ? 'opacity-100 bg-blue-300' : ''
                      }`}
                      onMouseDown={handleResizeStart}
                      title="Drag to resize duration"
                    >
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-500 rounded-t"></div>
                    </div>
                  </div>
                )}
              </Draggable>
            ) : (
              !isOccupied && (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Drop a task here
                </div>
              )
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
