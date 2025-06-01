
import React from 'react';
import { Folder, CheckSquare, Users, Clock } from 'lucide-react';

const stats = [
  {
    title: 'Active Projects',
    value: '12',
    change: '+2 this month',
    icon: Folder,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Completed Tasks',
    value: '248',
    change: '+18 this week',
    icon: CheckSquare,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Team Members',
    value: '15',
    change: '+3 this month',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Hours Logged',
    value: '1,247',
    change: '+124 this week',
    icon: Clock,
    color: 'from-orange-500 to-orange-600',
  },
];

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-sm text-green-600 mt-1">{stat.change}</p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon className="text-white" size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
