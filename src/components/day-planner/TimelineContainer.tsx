
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TimelineRuler } from './TimelineRuler';
import { FloatingTaskCard } from './FloatingTaskCard';
import type { ScheduledTask } from '@/types/dayPlanner';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { Client } from '@/hooks/useClients';

interface TimelineContainerProps {
  scheduledTasks: ScheduledTask[];
  getTaskById: (taskId: string) => TaskWithClient | undefined;
  getClientByName: (clientName: string) => Client | undefined;
  getAssigneeName: (assigneeId: string | null) => string;
  updateTaskDuration: (taskId: string, duration: number) => void;
  removeScheduledTask: (taskId: string) => void;
  updateTaskStartTime: (taskId: string, startTime: number) => void;
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  scheduledTasks,
  getTaskById,
  getClientByName,
  getAssigneeName,
  updateTaskDuration,
  removeScheduledTask,
  updateTaskStartTime
}) => {
  const TIMELINE_HEIGHT = 480; // 8 hours * 60 minutes
  const HOUR_HEIGHT = TIMELINE_HEIGHT / 8; // 60px per hour

  return (
    <div className="flex bg-white rounded-lg border shadow-sm">
      <TimelineRuler />
      
      <Droppable droppableId="timeline">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`relative flex-1 min-h-[480px] border-l border-gray-200 ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
            style={{ height: `${TIMELINE_HEIGHT}px` }}
          >
            {/* Hour grid lines */}
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ top: `${i * HOUR_HEIGHT}px` }}
              />
            ))}
            
            {/* Scheduled tasks */}
            {scheduledTasks.map((scheduledTask) => {
              const task = scheduledTask.task_type === 'task' 
                ? getTaskById(scheduledTask.task_id) 
                : undefined;
              const client = task?.client_name 
                ? getClientByName(task.client_name) 
                : undefined;

              return (
                <FloatingTaskCard
                  key={scheduledTask.task_id}
                  scheduledTask={scheduledTask}
                  task={task}
                  client={client}
                  getAssigneeName={getAssigneeName}
                  updateTaskDuration={updateTaskDuration}
                  removeScheduledTask={removeScheduledTask}
                  updateTaskStartTime={updateTaskStartTime}
                  timelineHeight={TIMELINE_HEIGHT}
                />
              );
            })}
            
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
