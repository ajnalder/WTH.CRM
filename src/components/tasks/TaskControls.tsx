
import React from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TaskCreateDialog } from '@/components/task/TaskCreateDialog';

interface TaskControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  onTaskCreated: () => void;
}

export const TaskControls: React.FC<TaskControlsProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onTaskCreated
}) => {
  const statusOptions = ['All', 'To Do', 'In Progress', 'Review'];
  const sortOptions = [
    { value: 'due_date', label: 'Due Date' },
    { value: 'created_at', label: 'Created' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
    { value: 'assignee', label: 'Assignee' }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-0 p-3 sm:p-4 mb-4">
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
      </div>
      
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex items-center gap-1 flex-1">
          <Filter className="text-gray-400" size={14} />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 bg-white text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 bg-white text-xs flex-1 sm:flex-none focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center border border-gray-200 rounded p-1">
          <button
            onClick={() => onViewModeChange('cards')}
            className={`p-1 rounded text-xs ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            title="Cards"
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-1 rounded text-xs ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            title="Table"
          >
            <List size={14} />
          </button>
        </div>
        
        <TaskCreateDialog onTaskCreated={onTaskCreated} />
      </div>
    </div>
  );
};
