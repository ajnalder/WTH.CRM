
import React from 'react';
import { TaskPlanningCard } from './TaskPlanningCard';
import type { TaskPlanningItem } from '@/hooks/useTaskPlanning';

interface TaskPoolProps {
  tasks: TaskPlanningItem[];
  onTimeAllocationChange: (taskId: string, minutes: number) => void;
  onMarkComplete: (taskId: string) => void;
  onScheduleTask: (taskId: string) => void;
  getAssigneeName: (assigneeId: string | null) => string;
  getClientName: (clientId: string | null) => string;
  getClientGradient: (clientId: string | null) => string;
  getClientInitials: (clientName: string) => string;
  isUpdating: boolean;
}

export const TaskPool: React.FC<TaskPoolProps> = ({
  tasks,
  onTimeAllocationChange,
  onMarkComplete,
  onScheduleTask,
  getAssigneeName,
  getClientName,
  getClientGradient,
  getClientInitials,
  isUpdating,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500 text-lg">No available tasks</p>
        <p className="text-gray-400 text-sm mt-2">All tasks have been scheduled or completed</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-lg bg-gray-50 border-2 border-gray-200">
      {tasks.map((task) => (
        <TaskPlanningCard
          key={task.id}
          task={task}
          onTimeAllocationChange={onTimeAllocationChange}
          onMarkComplete={onMarkComplete}
          onSchedule={onScheduleTask}
          getAssigneeName={getAssigneeName}
          getClientName={getClientName}
          getClientGradient={getClientGradient}
          getClientInitials={getClientInitials}
          isUpdating={isUpdating}
          showScheduleButton={true}
        />
      ))}
    </div>
  );
};
