
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { TaskTable } from '@/components/TaskTable';
import { ShadowBox } from '@/components/ui/shadow-box';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskSectionProps {
  title: string;
  tasks: TaskWithClient[];
  viewMode: 'cards' | 'table';
  isCompleted?: boolean;
  onRefresh?: () => void;
}

export const TaskSection: React.FC<TaskSectionProps> = ({ 
  title, 
  tasks, 
  viewMode, 
  isCompleted = false,
  onRefresh
}) => {
  const [isOpen, setIsOpen] = useState(!isCompleted);
  const containerClasses = isCompleted ? 'opacity-75' : '';

  // For completed tasks, always use table view to save space
  const displayMode = isCompleted ? 'table' : viewMode;

  const SectionContent = () => (
    <>
      {displayMode === 'cards' ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 ${containerClasses}`}>
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
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <Search size={32} className="mx-auto" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            No {isCompleted ? 'finished' : 'active'} tasks found
          </h3>
          <p className="text-sm text-gray-600">
            {isCompleted 
              ? 'No completed tasks match your search criteria'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      )}
    </>
  );

  if (isCompleted) {
    return (
      <ShadowBox className="p-3 sm:p-6 mb-3 sm:mb-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full p-0 h-auto hover:bg-transparent"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {title} ({tasks.length})
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-500">Table view</span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 sm:mt-6">
            <SectionContent />
          </CollapsibleContent>
        </Collapsible>
      </ShadowBox>
    );
  }

  // For active tasks, render normally without collapsible
  return (
    <ShadowBox className="p-3 sm:p-6 mb-3 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {title} ({tasks.length})
        </h2>
      </div>
      <SectionContent />
    </ShadowBox>
  );
};
