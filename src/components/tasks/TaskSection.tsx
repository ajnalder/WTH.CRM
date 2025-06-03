
import React from 'react';
import { Search } from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { TaskTable } from '@/components/TaskTable';
import { ShadowBox } from '@/components/ui/shadow-box';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskSectionProps {
  title: string;
  tasks: TaskWithClient[];
  viewMode: 'cards' | 'table';
  isCompleted?: boolean;
}

export const TaskSection: React.FC<TaskSectionProps> = ({ 
  title, 
  tasks, 
  viewMode, 
  isCompleted = false 
}) => {
  const containerClasses = isCompleted ? 'opacity-75' : '';

  return (
    <ShadowBox className="p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {title} ({tasks.length})
        </h2>
      </div>

      {viewMode === 'cards' ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${containerClasses}`}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className={containerClasses}>
          <TaskTable tasks={tasks} />
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {isCompleted ? 'finished' : 'active'} tasks found
          </h3>
          <p className="text-gray-600">
            {isCompleted 
              ? 'No completed tasks match your search criteria'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      )}
    </ShadowBox>
  );
};
