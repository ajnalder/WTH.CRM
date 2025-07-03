
import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { TaskTable } from '@/components/TaskTable';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  onRefresh?: () => void;
}

export const TaskSection: React.FC<TaskSectionProps> = ({ 
  title, 
  tasks, 
  viewMode, 
  teamMembers = [],
  clients = [],
  isCompleted = false,
  onRefresh
}) => {
  const [isCollapsed, setIsCollapsed] = useState(isCompleted); // Collapsed by default for completed tasks
  const containerClasses = isCompleted ? 'opacity-75' : '';
  
  // Force table view for completed tasks, use viewMode for active tasks
  const actualViewMode = isCompleted ? 'table' : viewMode;

  const renderTasksContent = () => {
    if (actualViewMode === 'cards') {
      return (
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
      );
    } else {
      return (
        <div className={containerClasses}>
          <TaskTable tasks={tasks} />
        </div>
      );
    }
  };

  if (isCompleted && tasks.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {title} ({tasks.length})
              </h2>
              <ChevronDown 
                className={cn(
                  "h-5 w-5 text-gray-500 transition-transform duration-200",
                  !isCollapsed && "rotate-180"
                )}
              />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-6">
            {renderTasksContent()}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {title} ({tasks.length})
      </h2>

      {tasks.length > 0 ? (
        renderTasksContent()
      ) : (
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
