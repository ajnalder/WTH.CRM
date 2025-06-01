
import React from 'react';
import { StatsCards } from '@/components/StatsCards';
import { ProjectGrid } from '@/components/ProjectGrid';
import { RecentActivity } from '@/components/RecentActivity';
import { TeamOverview } from '@/components/TeamOverview';

export const Dashboard = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Full Stack Developer',
      avatar: 'JD',
      status: 'online',
      currentTask: 'E-commerce Platform',
      hoursThisWeek: 32,
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      id: 2,
      name: 'Sarah Miller',
      role: 'UI/UX Designer',
      avatar: 'SM',
      status: 'online',
      currentTask: 'Mobile App Redesign',
      hoursThisWeek: 28,
      gradient: 'from-pink-400 to-pink-600',
    },
    {
      id: 3,
      name: 'Alex Lee',
      role: 'Frontend Developer',
      avatar: 'AL',
      status: 'away',
      currentTask: 'CRM Dashboard',
      hoursThisWeek: 35,
      gradient: 'from-green-400 to-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectGrid />
        </div>
        <div className="space-y-6">
          <RecentActivity />
          <TeamOverview members={teamMembers} />
        </div>
      </div>
    </div>
  );
};
