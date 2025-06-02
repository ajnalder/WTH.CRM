
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { ProjectHeaderControls } from '@/components/project/ProjectHeaderControls';
import { ProjectStats } from '@/components/project/ProjectStats';
import { ProjectDescription } from '@/components/project/ProjectDescription';
import { ProjectTimeline } from '@/components/project/ProjectTimeline';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { ProjectTasks } from '@/components/project/ProjectTasks';
import { ProjectTasksList } from '@/components/project/ProjectTasksList';
import { NewTaskForm } from '@/components/NewTaskForm';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { transformProject, calculateDaysUntilDue, calculateProjectDuration } from '@/utils/projectUtils';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, isLoading, error, updateProject } = useProjects();
  const { tasks } = useTasks();
  
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
  
  // Calculate real task counts for this project
  const projectTasks = tasks.filter(task => task.project === transformedProject.name);
  const completedTasks = projectTasks.filter(task => task.status === 'Completed' || task.status === 'Done').length;
  
  const projectWithRealTasks = {
    ...transformedProject,
    tasks: {
      completed: completedTasks,
      total: projectTasks.length
    }
  };
  
  const daysUntilDue = transformedProject.dueDate 
    ? calculateDaysUntilDue(transformedProject.dueDate, transformedProject.isRetainer) 
    : 0;
  const projectDuration = transformedProject.startDate && transformedProject.dueDate 
    ? calculateProjectDuration(transformedProject.startDate, transformedProject.dueDate, transformedProject.isRetainer) 
    : 0;

  const handleDueDateUpdate = (dueDate: string | null) => {
    updateProject({
      projectId: transformedProject.id,
      projectData: { due_date: dueDate }
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        <ProjectHeader project={projectWithRealTasks} />
        
        <ProjectHeaderControls project={projectWithRealTasks} />
        
        <ProjectStats 
          project={projectWithRealTasks} 
          daysUntilDue={daysUntilDue} 
          onDueDateUpdate={handleDueDateUpdate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectDescription project={{ id: transformedProject.id, description: transformedProject.description }} />
            
            <div className="flex gap-3">
              <NewTaskForm 
                prefilledProject={transformedProject.name}
                prefilledTitle={transformedProject.name}
                prefilledDescription={transformedProject.description || ''}
                triggerText="Add task"
                triggerVariant="default"
              />
              
              <NewTaskForm 
                prefilledProject={transformedProject.name}
                triggerText="Add multiple tasks"
                triggerVariant="outline"
              />
            </div>
            
            <ProjectTasksList projectName={transformedProject.name} />
            
            {!transformedProject.isRetainer && transformedProject.startDate && transformedProject.dueDate && (
              <ProjectTimeline project={transformedProject} projectDuration={projectDuration} />
            )}
          </div>

          <div className="space-y-6">
            <ProjectTeam projectId={transformedProject.id} />
            <ProjectTasks project={projectWithRealTasks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
