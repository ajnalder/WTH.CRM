
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskCardProps {
  task: TaskWithClient;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getClientInitials = (clientName: string) => {
    return clientName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {task.client_name && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {getClientInitials(task.client_name)}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Badge className={`text-xs ${getStatusColor(task.status)}`}>
              {task.status}
            </Badge>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
          {task.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {task.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="space-y-3">
          {task.assignee && (
            <div className="flex items-center text-sm text-gray-600">
              <User size={16} className="mr-2" />
              <span>{task.assignee}</span>
            </div>
          )}
          
          {task.project && (
            <div className="flex items-center text-sm text-gray-600">
              <Tag size={16} className="mr-2" />
              <span>{task.project}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>Due {formatDate(task.due_date)}</span>
          </div>
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {task.progress && task.progress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
