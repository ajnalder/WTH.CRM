
import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { TaskTable } from '@/components/TaskTable';
import { MobileContainer } from '@/components/ui/mobile-container';
import { MobileButton } from '@/components/ui/mobile-button';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { cn } from '@/lib/utils';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { TeamMember } from '@/hooks/useTeamMembers';
import type { Client } from '@/hooks/useClients';

interface MobileTaskSectionProps {
  title: string;
  tasks: TaskWithClient[];
  viewMode: 'cards' | 'table';
  teamMembers?: TeamMember[];
  clients?: Client[];
  isCompleted?: boolean;
  onRefresh?: () => void;
}

export const MobileTaskSection: React.FC<MobileTaskSectionProps> = ({ 
  title, 
  tasks, 
  viewMode, 
  teamMembers = [],
  clients = [],
  isCompleted = false,
  onRefresh
}) => {
  const { isMobileDevice, vibrate } = useMobileOptimization();
  const containerClasses = isCompleted ? 'opacity-75' : '';

  const handleRefresh = () => {
    if (isMobileDevice) {
      vibrate(50);
    }
    onRefresh?.();
  };

  return (
    <MobileContainer className="bg-white rounded-lg shadow-sm border mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {title} ({tasks.length})
        </h2>
        {onRefresh && isMobileDevice && (
          <MobileButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            hapticFeedback={true}
            className="h-10 w-10 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </MobileButton>
        )}
      </div>

      {viewMode === 'cards' ? (
        <div className={cn(
          'grid gap-4',
          isMobileDevice 
            ? 'grid-cols-1 sm:grid-cols-2' 
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
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
        <div className={cn(containerClasses, isMobileDevice && 'overflow-x-auto')}>
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
          {isMobileDevice && (
            <p className="text-sm text-gray-500 mt-2">
              Pull down to refresh
            </p>
          )}
        </div>
      )}
    </MobileContainer>
  );
};
