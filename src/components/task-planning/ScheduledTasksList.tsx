
import React from 'react';
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
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center min-h-[200px]">
        <p className="text-gray-500 text-lg">No scheduled tasks</p>
        <p className="text-gray-400 text-sm mt-2">Use the Schedule button on available tasks to add them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-lg bg-white border-2 border-gray-200 min-h-[200px]">
      {tasks.map((task, index) => (
        <TaskPlanningCard
          key={task.id}
          task={task}
          index={index + 1}
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
      ))}
    </div>
  );
};
