import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, User, GripVertical, Clock, Check, AlertCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import type { TaskPlanningItem } from '@/hooks/useTaskPlanning';

interface TaskPlanningCardProps {
  task: TaskPlanningItem;
  index?: number;
  dragHandleProps?: any;
  onTimeAllocationChange: (taskId: string, minutes: number) => void;
  onMarkComplete: (taskId: string) => void;
  onSchedule?: (taskId: string) => void;
  onUnschedule?: (taskId: string) => void;
  getAssigneeName: (assigneeId: string | null) => string;
  getClientName: (clientId: string | null) => string;
  getClientGradient: (clientId: string | null) => string;
  getClientInitials: (clientName: string) => string;
  isUpdating: boolean;
  showScheduleButton?: boolean;
  showUnscheduleButton?: boolean;
}

export const TaskPlanningCard: React.FC<TaskPlanningCardProps> = ({
  task,
  index,
  dragHandleProps,
  onTimeAllocationChange,
  onMarkComplete,
  onSchedule,
  onUnschedule,
  getAssigneeName,
  getClientName,
  getClientGradient,
  getClientInitials,
  isUpdating,
  showScheduleButton = false,
  showUnscheduleButton = false,
}) => {
  const navigate = useNavigate();
  const [timeInput, setTimeInput] = useState(Math.floor(task.allocated_minutes / 60).toString());
  const [minutesInput, setMinutesInput] = useState((task.allocated_minutes % 60).toString());
  const [pendingUpdate, setPendingUpdate] = useState(false);

  // Update local state when task.allocated_minutes changes
  useEffect(() => {
    setTimeInput(Math.floor(task.allocated_minutes / 60).toString());
    setMinutesInput((task.allocated_minutes % 60).toString());
  }, [task.allocated_minutes]);

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
      case 'High': return 'border-l-red-500';
      case 'Medium': return 'border-l-yellow-500';
      case 'Low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date() && task.status !== 'Done';
  };

  const handleTimeUpdate = () => {
    const hours = parseInt(timeInput) || 0;
    const minutes = parseInt(minutesInput) || 0;
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes !== task.allocated_minutes) {
      setPendingUpdate(true);
      onTimeAllocationChange(task.id, totalMinutes);
      
      // Clear pending state after a short delay
      setTimeout(() => setPendingUpdate(false), 1000);
    }
  };

  const handleTaskClick = (e: React.MouseEvent) => {
    // Only navigate if we're not clicking on interactive elements
    if (
      e.target instanceof HTMLElement && 
      (e.target.tagName === 'INPUT' || 
       e.target.tagName === 'BUTTON' || 
       e.target.closest('button') || 
       e.target.closest('input'))
    ) {
      return;
    }
    navigate(`/tasks/${task.id}`);
  };

  const clientName = getClientName(task.client_id || null);
  const clientGradient = getClientGradient(task.client_id || null);
  const clientInitials = getClientInitials(clientName);

  // Get card background class based on client gradient
  const getCardBackgroundClass = (gradient: string) => {
    if (gradient.includes('blue')) return 'bg-blue-50/50 border-blue-200/50';
    if (gradient.includes('green')) return 'bg-green-50/50 border-green-200/50';
    if (gradient.includes('purple')) return 'bg-purple-50/50 border-purple-200/50';
    if (gradient.includes('red')) return 'bg-red-50/50 border-red-200/50';
    if (gradient.includes('yellow')) return 'bg-yellow-50/50 border-yellow-200/50';
    if (gradient.includes('pink')) return 'bg-pink-50/50 border-pink-200/50';
    if (gradient.includes('indigo')) return 'bg-indigo-50/50 border-indigo-200/50';
    if (gradient.includes('teal')) return 'bg-teal-50/50 border-teal-200/50';
    if (gradient.includes('orange')) return 'bg-orange-50/50 border-orange-200/50';
    return 'bg-gray-50/50 border-gray-200/50';
  };

  return (
    <Card className={`border-l-4 ${getPriorityColor(task.priority)} ${getCardBackgroundClass(clientGradient)} hover:shadow-md transition-shadow ${
      pendingUpdate ? 'ring-2 ring-blue-300' : ''
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} />
            </div>
          )}

          {/* Order Number */}
          {index !== undefined && (
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              {index}
            </div>
          )}

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                {showUnscheduleButton ? (
                  <h3 
                    className="font-medium text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={handleTaskClick}
                  >
                    {task.title}
                  </h3>
                ) : (
                  <h3 className="font-medium text-gray-900 line-clamp-1">{task.title}</h3>
                )}
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
                {showUnscheduleButton && onUnschedule && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onUnschedule(task.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>
            </div>

            {/* Client and Task Details */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
              {/* Client Avatar and Name */}
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${clientGradient} flex items-center justify-center text-white text-xs font-semibold`}>
                  {clientInitials}
                </div>
                <span className="font-medium">{clientName}</span>
              </div>

              {task.project && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>{task.project}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{getAssigneeName(task.assignee)}</span>
              </div>
              
              <div className={`flex items-center gap-1 ${isOverdue(task.due_date) ? 'text-red-500' : ''}`}>
                {isOverdue(task.due_date) && <AlertCircle size={12} />}
                <Calendar size={12} />
                <span>{formatDate(task.due_date)}</span>
              </div>
            </div>

            {/* Time Allocation and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    onBlur={handleTimeUpdate}
                    onKeyDown={(e) => e.key === 'Enter' && handleTimeUpdate()}
                    className="w-12 h-6 text-xs text-center p-1"
                    min="0"
                    max="23"
                  />
                  <span className="text-xs text-gray-500">h</span>
                  <Input
                    type="number"
                    value={minutesInput}
                    onChange={(e) => setMinutesInput(e.target.value)}
                    onBlur={handleTimeUpdate}
                    onKeyDown={(e) => e.key === 'Enter' && handleTimeUpdate()}
                    className="w-12 h-6 text-xs text-center p-1"
                    min="0"
                    max="59"
                    step="15"
                  />
                  <span className="text-xs text-gray-500">m</span>
                  {pendingUpdate && (
                    <span className="text-xs text-blue-500">Saving...</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {showScheduleButton && onSchedule && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSchedule(task.id)}
                    className="h-6 px-2 text-xs"
                  >
                    Schedule
                  </Button>
                )}

                {task.status !== 'Done' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkComplete(task.id)}
                    disabled={isUpdating}
                    className="h-6 px-2 text-xs"
                  >
                    <Check size={12} className="mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
