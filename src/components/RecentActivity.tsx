
import React from 'react';
import { Clock, CheckSquare, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TaskWithClient } from '@/hooks/useTasks';

interface RecentActivityProps {
  tasks: TaskWithClient[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ tasks }) => {
  // Get the most recent 5 tasks, sorted by updated_at
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'Done':
      case 'Completed':
        return CheckSquare;
      case 'In Progress':
        return Clock;
      default:
        return User;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'Done':
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-orange-600 bg-orange-100';
      case 'Review':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <Calendar className="text-gray-400" size={20} />
      </div>
      
      <div className="space-y-4">
        {recentTasks.length > 0 ? (
          recentTasks.map((task) => {
            const ActivityIcon = getActivityIcon(task.status);
            const colorClass = getActivityColor(task.status);
            
            return (
              <div key={task.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <ActivityIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status changed to {task.status}
                    {task.project && ` in ${task.project}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No recent activity. Start working on tasks to see updates here!</p>
          </div>
        )}
      </div>
    </div>
  );
};
