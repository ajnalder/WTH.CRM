
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
  const { projects, isLoading, error } = useProjects();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Project</h1>
          <p className="text-gray-600 mb-4">There was an error loading the project details.</p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  const transformedProject = transformProject(project);
  const daysUntilDue = transformedProject.dueDate 
    ? calculateDaysUntilDue(transformedProject.dueDate, transformedProject.isRetainer) 
    : 0;
  const projectDuration = transformedProject.startDate && transformedProject.dueDate 
    ? calculateProjectDuration(transformedProject.startDate, transformedProject.dueDate, transformedProject.isRetainer) 
    : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        <ProjectHeader project={transformedProject} />
        
        <ProjectStats project={transformedProject} daysUntilDue={daysUntilDue} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectDescription project={{ id: transformedProject.id, description: transformedProject.description }} />
            {!transformedProject.isRetainer && transformedProject.startDate && transformedProject.dueDate && (
              <ProjectTimeline project={transformedProject} projectDuration={projectDuration} />
            )}
            {transformedProject.isRetainer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Retainer Project</h3>
                <p className="text-blue-700 text-sm">
                  This is an ongoing retainer project without specific start and end dates. 
                  Work is performed on a recurring basis as part of the client's retainer agreement.
                </p>
              </div>
            )}
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
