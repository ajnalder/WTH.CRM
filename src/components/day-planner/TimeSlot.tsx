
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import type { TaskWithClient } from '@/hooks/useTasks';

interface ScheduledTask {
  id: string;
  taskId: string;
  startTime: string;
  duration: number;
}

interface TimeSlotProps {
  timeSlot: string;
  scheduledTask?: ScheduledTask;
  task?: TaskWithClient;
  getAssigneeName: (assigneeId: string | null) => string;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  timeSlot,
  scheduledTask,
  task,
  getAssigneeName
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            {scheduledTask && task ? (
              <Draggable draggableId={`task-${task.id}`} index={0}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-move ${
                      snapshot.isDragging ? 'shadow-lg' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {task.title}
                      </h4>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User size={12} />
                        <span>{getAssigneeName(task.assignee)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{scheduledTask.duration}min</span>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Drop a task here
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
