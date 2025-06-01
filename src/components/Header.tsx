
import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Header = () => {
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
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Plus size={20} className="mr-2" />
            New Project
          </Button>
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
