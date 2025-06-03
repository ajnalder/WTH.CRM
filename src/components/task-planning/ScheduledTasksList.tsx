
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskPlanningCard } from './TaskPlanningCard';
import type { TaskPlanningItem } from '@/hooks/useTaskPlanning';

interface ScheduledTasksListProps {
  tasks: TaskPlanningItem[];
  onTimeAllocationChange: (taskId: string, minutes: number) => void;
  onMarkComplete: (taskId: string) => void;
  onUnscheduleTask: (taskId: string) => void;
  getAssigneeName: (assigneeId: string | null) => string;
  getClientName: (clientId: string | null) => string;
  getClientGradient: (clientId: string | null) => string;
  getClientInitials: (clientName: string) => string;
  isUpdating: boolean;
}

export const ScheduledTasksList: React.FC<ScheduledTasksListProps> = ({
  tasks,
  onTimeAllocationChange,
  onMarkComplete,
  onUnscheduleTask,
  getAssigneeName,
  getClientName,
  getClientGradient,
  getClientInitials,
  isUpdating,
}) => {
  if (tasks.length === 0) {
    return (
      <Droppable droppableId="scheduled-tasks">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`bg-white rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              snapshot.isDraggingOver ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}
          >
            <p className="text-gray-500 text-lg">No scheduled tasks</p>
            <p className="text-gray-400 text-sm mt-2">Drag tasks from the available pool to schedule them</p>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  return (
    <Droppable droppableId="scheduled-tasks">
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`space-y-3 p-4 rounded-lg transition-colors ${
            snapshot.isDraggingOver ? 'bg-green-50 border-2 border-green-200' : 'bg-white border-2 border-gray-200'
          }`}
        >
          {tasks.map((task, index) => (
            <Draggable
              key={task.id}
              draggableId={task.id}
              index={index}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className={`transition-shadow ${
                    snapshot.isDragging ? 'shadow-lg' : ''
                  }`}
                >
                  <TaskPlanningCard
                    task={task}
                    index={index + 1}
                    dragHandleProps={provided.dragHandleProps}
                    onTimeAllocationChange={onTimeAllocationChange}
                    onMarkComplete={onMarkComplete}
                    onUnschedule={onUnscheduleTask}
                    getAssigneeName={getAssigneeName}
                    getClientName={getClientName}
                    getClientGradient={getClientGradient}
                    getClientInitials={getClientInitials}
                    isUpdating={isUpdating}
                    showUnscheduleButton={true}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
