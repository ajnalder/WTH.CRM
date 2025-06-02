
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { TaskStatusDropdown } from './TaskStatusDropdown';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskDetailsMainProps {
  task: TaskWithClient;
  onStatusUpdate?: (status: string) => void;
  isUpdatingStatus?: boolean;
}

export const TaskDetailsMain: React.FC<TaskDetailsMainProps> = ({ 
  task, 
  onStatusUpdate,
  isUpdatingStatus = false 
}) => {
  const { teamMembers } = useTeamMembers();

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  const currentTeamMember = teamMembers.find(member => member.id === task.assignee);

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
            <h3 className="font-medium text-gray-900 mb-2">Team Member</h3>
            {currentTeamMember ? (
              <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                <div className={`w-4 h-4 bg-gradient-to-r ${currentTeamMember.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                  {currentTeamMember.avatar}
                </div>
                {currentTeamMember.name}
              </Badge>
            ) : (
              <span className="text-gray-500">No team member assigned</span>
            )}
          </div>
          <div>
            {onStatusUpdate ? (
              <TaskStatusDropdown
                currentStatus={task.status}
                onStatusUpdate={onStatusUpdate}
                isUpdating={isUpdatingStatus}
              />
            ) : (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Due Date</h3>
          <p className="text-gray-600">{formatDisplayDate(task.due_date)}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Dropbox Files</h3>
          {task.dropbox_url ? (
            <a
              href={task.dropbox_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              View Files <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <p className="text-gray-600 text-sm">No files linked</p>
          )}
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

  function getStatusColor(status: string) {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
};
