
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ExternalLink, Calendar, User, Tag } from 'lucide-react';
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

  console.log('TaskDetailsMain - Task assignee:', task.assignee);
  console.log('TaskDetailsMain - Available team members:', teamMembers);

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  const currentTeamMember = teamMembers.find(member => member.id === task.assignee);
  console.log('TaskDetailsMain - Found team member:', currentTeamMember);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8">
        <div className="space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          )}
          
          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Member */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <User className="w-4 h-4" />
                Team Member
              </div>
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

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                Status
              </div>
              {onStatusUpdate ? (
                <TaskStatusDropdown
                  currentStatus={task.status}
                  onStatusUpdate={onStatusUpdate}
                  isUpdating={isUpdatingStatus}
                />
              ) : (
                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </Badge>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Calendar className="w-4 h-4" />
                Due Date
              </div>
              <p className="text-gray-700">{formatDisplayDate(task.due_date)}</p>
            </div>
          </div>

          {/* Dropbox Files */}
          {(task.dropbox_url || onStatusUpdate) && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                <ExternalLink className="w-4 h-4" />
                Dropbox Files
              </div>
              {task.dropbox_url ? (
                <a
                  href={task.dropbox_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                >
                  View Files <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p className="text-gray-500 text-sm">No files linked</p>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                <Tag className="w-4 h-4" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
