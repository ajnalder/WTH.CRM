
import React from 'react';
import { Folder, DollarSign, TrendingUp, Clock } from 'lucide-react';
import type { TaskWithClient } from '@/hooks/useTasks';

interface Project {
  id: string;
  status: string;
  budget?: number | null;
}

interface TimeEntry {
  id: string;
  hours: number;
  date: string;
}

interface Invoice {
  id: string;
  status: string;
  total_amount: number;
}

interface StatsCardsProps {
  projects: Project[];
  tasks: TaskWithClient[];
  weeklyTimeEntries: TimeEntry[];
  invoices: Invoice[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  projects, 
  tasks, 
  weeklyTimeEntries,
  invoices,
}) => {
  // Calculate current projects (In Progress, Planning, or Review)
  const currentProjects = projects.filter(p => 
    p.status === 'In Progress' || p.status === 'Planning' || p.status === 'Review'
  );
  
  // Calculate pipeline value (unpaid invoices - draft, sent, overdue)
  const pipelineValue = invoices
    .filter(i => i.status === 'draft' || i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
  
  // Calculate total project value (sum of budgets for current projects)
  const totalProjectValue = currentProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  
  // Calculate total hours this week from actual time entries
  const totalHours = weeklyTimeEntries.reduce((sum, entry) => {
    const hours = Number(entry.hours) || 0;
    return sum + hours;
  }, 0);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const stats = [
    {
      title: 'Current Projects',
      value: currentProjects.length.toString(),
      change: `${projects.length} total`,
      icon: Folder,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(pipelineValue),
      change: `${invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length} unpaid`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Project Value',
      value: formatCurrency(totalProjectValue),
      change: `${currentProjects.length} active projects`,
      icon: DollarSign,
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
