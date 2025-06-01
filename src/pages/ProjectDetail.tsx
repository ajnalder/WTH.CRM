
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { ProjectStats } from '@/components/project/ProjectStats';
import { ProjectDescription } from '@/components/project/ProjectDescription';
import { ProjectTimeline } from '@/components/project/ProjectTimeline';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { ProjectTasks } from '@/components/project/ProjectTasks';
import { useProjects } from '@/hooks/useProjects';
import { transformProject, calculateDaysUntilDue, calculateProjectDuration } from '@/utils/projectUtils';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();
  
  const project = projects.find(p => p.id === id);
  const transformedProject = project ? transformProject(project) : null;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (!transformedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }
  
  const daysUntilDue = transformedProject.dueDate ? calculateDaysUntilDue(transformedProject.dueDate) : 0;
  const projectDuration = transformedProject.startDate && transformedProject.dueDate 
    ? calculateProjectDuration(transformedProject.startDate, transformedProject.dueDate) 
    : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        <ProjectHeader project={transformedProject} />
        
        <ProjectStats project={transformedProject} daysUntilDue={daysUntilDue} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectDescription project={transformedProject} />
            <ProjectTimeline project={transformedProject} projectDuration={projectDuration} />
          </div>

          <div className="space-y-6">
            <ProjectTeam project={transformedProject} />
            <ProjectTasks project={transformedProject} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
