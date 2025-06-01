
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  project: string;
  dueDate: string;
  tags: string[];
  progress: number;
}

interface TaskCardProps {
  task: Task;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={`text-xs ${getStatusColor(task.status)}`}>
              {task.status}
            </Badge>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <User size={16} className="mr-2" />
            <span>{task.assignee}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Tag size={16} className="mr-2" />
            <span>{task.project}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>Due {formatDate(task.dueDate)}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {task.progress > 0 && (
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
