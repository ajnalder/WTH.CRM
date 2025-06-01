
import React from 'react';
import { Bell, Search, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NewProjectForm } from './NewProjectForm';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search projects..."
                className="pl-10 w-64"
              />
            </div>
            
            <NewProjectForm />
            
            <Button variant="ghost" size="icon">
              <Bell size={20} />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
