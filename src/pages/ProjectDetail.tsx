
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { ProjectStats } from '@/components/project/ProjectStats';
import { ProjectDescription } from '@/components/project/ProjectDescription';
import { ProjectTimeline } from '@/components/project/ProjectTimeline';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { ProjectTasks } from '@/components/project/ProjectTasks';
import { getProjectById, calculateDaysUntilDue, calculateProjectDuration } from '@/utils/projectUtils';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const project = getProjectById(id!);
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }
  
  const daysUntilDue = calculateDaysUntilDue(project.dueDate);
  const projectDuration = calculateProjectDuration(project.startDate, project.dueDate);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        <ProjectHeader project={project} />
        
        <ProjectStats project={project} daysUntilDue={daysUntilDue} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectDescription project={project} />
            <ProjectTimeline project={project} projectDuration={projectDuration} />
          </div>

          <div className="space-y-6">
            <ProjectTeam project={project} />
            <ProjectTasks project={project} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
