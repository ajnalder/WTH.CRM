
import React from 'react';
import { StatsCards } from '@/components/StatsCards';
import { ProjectGrid } from '@/components/ProjectGrid';
import { RecentActivity } from '@/components/RecentActivity';
import { TeamOverview } from '@/components/TeamOverview';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';

export const Dashboard = () => {
  const { teamMembers } = useTeamMembers();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { clients } = useClients();

  return (
    <div className="space-y-6">
      <StatsCards 
        projects={projects} 
        tasks={tasks} 
        teamMembers={teamMembers}
        clients={clients}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectGrid />
        </div>
        <div className="space-y-6">
          <RecentActivity tasks={tasks} />
          <TeamOverview members={teamMembers} />
        </div>
      </div>
    </div>
  );
};
