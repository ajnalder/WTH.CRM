
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TaskAssigneeEditor } from '@/components/TaskAssigneeEditor';
import { TaskStatusEditor } from '@/components/TaskStatusEditor';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskDetailsMainProps {
  task: TaskWithClient;
  updateTaskAssignee: (assignee: string | null) => void;
  isUpdating: boolean;
  updateTaskStatus: (status: string) => void;
  isUpdatingStatus: boolean;
}

export const TaskDetailsMain: React.FC<TaskDetailsMainProps> = ({ 
  task, 
  updateTaskAssignee, 
  isUpdating,
  updateTaskStatus,
  isUpdatingStatus
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <TaskAssigneeEditor
              currentAssignee={task.assignee}
              onAssigneeUpdate={updateTaskAssignee}
              isUpdating={isUpdating}
            />
          </div>
          <div>
            <TaskStatusEditor
              currentStatus={task.status}
              onStatusUpdate={updateTaskStatus}
              isUpdating={isUpdatingStatus}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-1">Due Date</h3>
          <p className="text-gray-600">{formatDate(task.due_date)}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Progress</h3>
          <div className="flex items-center space-x-3">
            <Progress value={task.progress || 0} className="flex-1" />
            <span className="text-sm text-gray-600">{task.progress || 0}%</span>
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
