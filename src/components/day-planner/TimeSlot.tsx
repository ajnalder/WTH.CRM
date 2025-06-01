import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { ScheduledTaskCard } from './ScheduledTaskCard';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { Client } from '@/hooks/useClients';
import type { ScheduledTask } from '@/types/dayPlanner';

interface TimeSlotProps {
  timeSlot: string;
  scheduledTask?: ScheduledTask;
  task?: TaskWithClient;
  client?: Client;
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
  client,
  getAssigneeName,
  updateTaskDuration,
  removeScheduledTask,
  isOccupied,
  isFirstSlot
}) => {
  return (
    <div className="flex items-start border-b border-gray-100 py-2 min-h-[60px]">
      <div className="w-20 text-sm text-gray-500 font-mono">
        {timeSlot}
      </div>
      
      <Droppable droppableId={`timeslot-${timeSlot}`}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 ml-4 min-h-[56px] border-2 border-dashed rounded-lg p-2 transition-colors relative ${
              snapshot.isDraggingOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            {scheduledTask && isFirstSlot ? (
              <ScheduledTaskCard
                scheduledTask={scheduledTask}
                task={task}
                client={client}
                getAssigneeName={getAssigneeName}
                updateTaskDuration={updateTaskDuration}
                removeScheduledTask={removeScheduledTask}
              />
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
