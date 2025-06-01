
import React from 'react';
import { Home, Folder, Users, Calendar, Settings, BarChart3, CheckSquare } from 'lucide-react';

const navigationItems = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: Folder, label: 'Projects' },
  { icon: CheckSquare, label: 'Tasks' },
  { icon: Users, label: 'Team' },
  { icon: Calendar, label: 'Calendar' },
  { icon: BarChart3, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PM</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ProjectFlow</span>
        </div>
      </div>
      
      <nav className="px-4">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 mb-1 ${
              item.active
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
