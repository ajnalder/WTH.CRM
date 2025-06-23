
import React from 'react';
import { Folder, CheckSquare, Users, Clock } from 'lucide-react';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { Client } from '@/hooks/useClients';

interface Project {
  id: string;
  status: string;
}

interface TeamMember {
  id: string;
  hours_this_week: number;
}

interface TimeEntry {
  id: string;
  hours: number;
  date: string;
}

interface StatsCardsProps {
  projects: Project[];
  tasks: TaskWithClient[];
  teamMembers: TeamMember[];
  clients: Client[];
  weeklyTimeEntries: TimeEntry[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  projects, 
  tasks, 
  teamMembers, 
  clients,
  weeklyTimeEntries 
}) => {
  // Calculate active projects (In Progress or Planning)
  const activeProjects = projects.filter(p => 
    p.status === 'In Progress' || p.status === 'Planning'
  ).length;
  
  // Calculate completed tasks (Done or Completed status)
  const completedTasks = tasks.filter(t => 
    t.status === 'Done' || t.status === 'Completed'
  ).length;
  
  // Calculate total hours this week from actual time entries
  const totalHours = weeklyTimeEntries.reduce((sum, entry) => {
    const hours = Number(entry.hours) || 0;
    return sum + hours;
  }, 0);
  
  // Calculate active clients
  const activeClients = clients.filter(c => c.status === 'active').length;

  const stats = [
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      change: `${projects.length} total`,
      icon: Folder,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Completed Tasks',
      value: completedTasks.toString(),
      change: `${tasks.length} total tasks`,
      icon: CheckSquare,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Active Clients',
      value: activeClients.toString(),
      change: `${clients.length} total clients`,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Hours This Week',
      value: totalHours.toFixed(1),
      change: `${weeklyTimeEntries.length} time entries`,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
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
