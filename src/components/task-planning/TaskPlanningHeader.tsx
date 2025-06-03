
import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TaskPlanningHeaderProps {
  totalTasks: number;
  totalAllocatedMinutes: number;
}

export const TaskPlanningHeader: React.FC<TaskPlanningHeaderProps> = ({
  totalTasks,
  totalAllocatedMinutes,
}) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Planning</h1>
        <p className="text-gray-600">Organize your tasks, allocate time, and plan your day</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Allocated Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(totalAllocatedMinutes)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
