
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskAssigneeEditor } from '@/components/TaskAssigneeEditor';
import { TaskStatusEditor } from '@/components/TaskStatusEditor';
import { TaskDueDateEditor } from '@/components/TaskDueDateEditor';
import { TaskDropboxUrlEditor } from '@/components/TaskDropboxUrlEditor';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskDetailsMainProps {
  task: TaskWithClient;
  updateTaskAssignee: (assignee: string | null) => void;
  isUpdating: boolean;
  updateTaskStatus: (status: string) => void;
  isUpdatingStatus: boolean;
  updateTaskDueDate: (dueDate: string | null) => void;
  isUpdatingDueDate: boolean;
  updateTaskDropboxUrl: (url: string | null) => void;
  isUpdatingDropboxUrl: boolean;
}

export const TaskDetailsMain: React.FC<TaskDetailsMainProps> = ({ 
  task, 
  updateTaskAssignee, 
  isUpdating,
  updateTaskStatus,
  isUpdatingStatus,
  updateTaskDueDate,
  isUpdatingDueDate,
  updateTaskDropboxUrl,
  isUpdatingDropboxUrl
}) => {
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
          <TaskDueDateEditor
            currentDueDate={task.due_date}
            onDueDateUpdate={updateTaskDueDate}
            isUpdating={isUpdatingDueDate}
          />
        </div>

        <div>
          <TaskDropboxUrlEditor
            currentDropboxUrl={task.dropbox_url}
            onDropboxUrlUpdate={updateTaskDropboxUrl}
            isUpdating={isUpdatingDropboxUrl}
          />
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
