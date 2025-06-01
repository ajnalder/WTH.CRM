
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskStatusEditorProps {
  currentStatus: string;
  onStatusUpdate: (status: string) => void;
  isUpdating: boolean;
}

const STATUS_OPTIONS = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' }
];

export const TaskStatusEditor: React.FC<TaskStatusEditorProps> = ({
  currentStatus,
  onStatusUpdate,
  isUpdating,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      onStatusUpdate(newStatus);
    }
  };

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2">Status</h3>
      <Select 
        value={currentStatus} 
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            <Badge className={`text-xs ${getStatusColor(currentStatus)}`}>
              {currentStatus}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <Badge className={`text-xs ${getStatusColor(option.value)}`}>
                {option.label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
