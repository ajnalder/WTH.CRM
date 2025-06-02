
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Clock, X, GripVertical } from 'lucide-react';
import { getInitials } from '@/utils/clientGradients';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { Client } from '@/hooks/useClients';
import type { ScheduledTask } from '@/types/dayPlanner';

interface TaskCardContentProps {
  scheduledTask: ScheduledTask;
  task?: TaskWithClient;
  client?: Client;
  getAssigneeName: (assigneeId: string | null) => string;
  updateTaskDuration: (taskId: string, duration: number) => void;
  removeScheduledTask: (taskId: string) => void;
  showControls: boolean;
  dragHandleProps: any;
}

export const TaskCardContent: React.FC<TaskCardContentProps> = ({
  scheduledTask,
  task,
  client,
  getAssigneeName,
  updateTaskDuration,
  removeScheduledTask,
  showControls,
  dragHandleProps
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 h-full flex flex-col">
      <div 
        {...dragHandleProps} 
        className="absolute top-2 left-2 cursor-move z-30 p-1 hover:bg-gray-100 rounded transition-colors"
        title="Drag to move task"
      >
        <GripVertical size={14} className="text-gray-400" />
      </div>
      
      {showControls && (
        <div className="absolute top-2 right-2 flex gap-1 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => removeScheduledTask(scheduledTask.task_id)}
          >
            <X size={12} />
          </Button>
        </div>
      )}
      
      <div className="ml-6 mr-8 flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {client && (
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarFallback className={`bg-gradient-to-br ${client.gradient} text-white text-xs font-semibold`}>
                  {getInitials(client.company)}
                </AvatarFallback>
              </Avatar>
            )}
            <h4 className="font-medium text-gray-900 text-sm line-clamp-1 min-w-0">
              {scheduledTask.task_type === 'custom' ? scheduledTask.title : task?.title}
            </h4>
          </div>
          {task && (
            <Badge className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          {task && (
            <div className="flex items-center space-x-1">
              <User size={12} />
              <span>{getAssigneeName(task.assignee)}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>{scheduledTask.duration}min</span>
          </div>
        </div>
        
        {showControls && (
          <div className="mt-2">
            <Select
              value={scheduledTask.duration.toString()}
              onValueChange={(value) => updateTaskDuration(scheduledTask.task_id, parseInt(value))}
            >
              <SelectTrigger className="h-6 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
