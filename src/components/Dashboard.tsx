
import React from 'react';
import { StatsCards } from '@/components/StatsCards';
import { ProjectGrid } from '@/components/ProjectGrid';
import { RecentActivity } from '@/components/RecentActivity';
import { TeamOverview } from '@/components/TeamOverview';
import { PipelineOverview } from '@/components/PipelineOverview';
import { NewProjectForm } from '@/components/NewProjectForm';
import { TaskCreateDialog } from '@/components/task/TaskCreateDialog';
import { ShadowBox } from '@/components/ui/shadow-box';
import { DashboardRemindersPanel } from '@/components/reminders/DashboardRemindersPanel';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useInvoices } from '@/hooks/useInvoices';
import { useWeeklyTimeEntries } from '@/hooks/useTimeEntries';

export const Dashboard = () => {
  const { teamMembers, isLoading: isLoadingTeam } = useTeamMembers();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { tasks, isLoading: isLoadingTasks } = useTasks();
  const { invoices, isLoading: isLoadingInvoices } = useInvoices();
  const { data: weeklyTimeEntries, isLoading: isLoadingTimeEntries } = useWeeklyTimeEntries();

  const isLoading = isLoadingTeam || isLoadingProjects || isLoadingTasks || isLoadingInvoices || isLoadingTimeEntries;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Loading your project overview...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your projects and pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <TaskCreateDialog triggerText="New Task" />
          <NewProjectForm />
        </div>
      </div>

      <StatsCards 
        projects={projects} 
        tasks={tasks} 
        weeklyTimeEntries={weeklyTimeEntries || []}
        invoices={invoices}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectGrid />
        </div>
        <div className="space-y-6">
          <ShadowBox className="p-6">
            <DashboardRemindersPanel projects={projects} />
          </ShadowBox>
          <ShadowBox className="p-6">
            <PipelineOverview invoices={invoices} />
          </ShadowBox>
          <ShadowBox className="p-6">
            <RecentActivity tasks={tasks} />
          </ShadowBox>
          <ShadowBox className="p-6">
            <TeamOverview members={teamMembers} />
          </ShadowBox>
        </div>
      </div>
    </div>
  );
};
