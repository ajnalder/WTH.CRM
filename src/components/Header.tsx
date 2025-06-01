
import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NewProjectForm } from '@/components/NewProjectForm';

export const Header = () => {
  const handleProjectCreated = (project: any) => {
    console.log('New project created from header:', project);
    // You could add global state management here if needed
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search projects, tasks, or team members..."
              className="pl-10 w-80"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <NewProjectForm onProjectCreated={handleProjectCreated} />
          <div className="relative">
            <Bell className="text-gray-600 hover:text-gray-900 cursor-pointer" size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
};
