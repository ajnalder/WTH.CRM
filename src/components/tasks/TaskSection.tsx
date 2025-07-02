
import React from 'react';
import { Search } from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { TaskTable } from '@/components/TaskTable';
import { cn } from '@/lib/utils';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { TeamMember } from '@/hooks/useTeamMembers';
import type { Client } from '@/hooks/useClients';

interface TaskSectionProps {
  title: string;
  tasks: TaskWithClient[];
  viewMode: 'cards' | 'table';
  teamMembers?: TeamMember[];
  clients?: Client[];
  isCompleted?: boolean;
}

export const TaskSection: React.FC<TaskSectionProps> = ({ 
  title, 
  tasks, 
  viewMode, 
  teamMembers = [],
  clients = [],
  isCompleted = false 
}) => {
  const containerClasses = isCompleted ? 'opacity-75' : '';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {title} ({tasks.length})
      </h2>

      {viewMode === 'cards' ? (
        <div className={cn(
          'grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
          containerClasses
        )}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              teamMembers={teamMembers}
              clients={clients}
            />
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
    </div>
  );
};
