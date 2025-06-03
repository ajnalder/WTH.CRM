
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NewProjectForm } from '@/components/NewProjectForm';

interface ProjectControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  onProjectCreated: () => void;
}

export const ProjectControls: React.FC<ProjectControlsProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onProjectCreated
}) => {
  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'name', label: 'Project Name' },
    { value: 'status', label: 'Status' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'priority', label: 'Priority' }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search projects, clients, or status..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>Sort by: {option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('cards')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              Cards
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              Table
            </button>
          </div>
          
          <NewProjectForm />
        </div>
      </div>
    </div>
  );
};
