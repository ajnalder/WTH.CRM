
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskDetailsHeaderProps {
  task: TaskWithClient;
}

export const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({ task }) => {
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

  const getClientInitials = (clientName: string) => {
    return clientName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/tasks')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2" size={16} />
        Back to Tasks
      </Button>
      
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {task.client_name && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {getClientInitials(task.client_name)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
            <p className="text-gray-600">{task.project}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={`${getStatusColor(task.status)}`}>
            {task.status}
          </Badge>
          <Badge className={`${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
        </div>
      </div>
    </div>
  );
};
