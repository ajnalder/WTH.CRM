import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/ui/mobile-container';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { ProjectHeaderControls } from '@/components/project/ProjectHeaderControls';
import { ProjectStats } from '@/components/project/ProjectStats';
import { ProjectDescription } from '@/components/project/ProjectDescription';
import { ProjectTimeline } from '@/components/project/ProjectTimeline';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { ProjectTasks } from '@/components/project/ProjectTasks';
import { ProjectTasksList } from '@/components/project/ProjectTasksList';
import { TaskCreateDialog } from '@/components/task/TaskCreateDialog';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { transformProject, calculateDaysUntilDue, calculateProjectDuration } from '@/utils/projectUtils';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, isLoading, error, updateProject } = useProjects();
  const { tasks } = useTasks();
  const { clients } = useClients();
  const { isMobileDevice, isOnline } = useMobileOptimization();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <MobileContainer>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </MobileContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <MobileContainer>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Project</h1>
            <p className="text-gray-600 mb-4">There was an error loading the project details.</p>
            {!isOnline && (
              <p className="text-red-600 text-sm mb-4">You appear to be offline. Please check your connection.</p>
            )}
            <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
          </div>
        </MobileContainer>
      </div>
    );
  }
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <MobileContainer>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
          </div>
        </MobileContainer>
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

  // Find the client to get the client_id
  const projectClient = clients.find(c => c.company === transformedProject.client);
  
  // Enhanced project data for the header with all required fields
  const enhancedProject = {
    ...projectWithRealTasks,
    client_id: projectClient?.id || project.client_id,
    is_billable: project.is_billable
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
      <div className={isMobileDevice ? 'space-y-3' : 'p-6'}>
        <MobileContainer padding="md">
          <ProjectHeader project={enhancedProject} />
        </MobileContainer>
        
        <MobileContainer padding="md">
          <ProjectHeaderControls project={projectWithRealTasks} />
        </MobileContainer>
        
        <MobileContainer padding="md">
          <ProjectStats 
            project={projectWithRealTasks} 
            daysUntilDue={daysUntilDue} 
            onDueDateUpdate={handleDueDateUpdate}
          />
        </MobileContainer>

        <div className={isMobileDevice 
          ? 'space-y-3' 
          : 'grid grid-cols-1 lg:grid-cols-3 gap-6 px-6'
        }>
          <div className={isMobileDevice 
            ? 'space-y-3' 
            : 'lg:col-span-2 space-y-6'
          }>
            <MobileContainer padding="md">
              <ProjectDescription project={{ id: transformedProject.id, description: transformedProject.description }} />
            </MobileContainer>
            
            <MobileContainer padding="md">
              <TaskCreateDialog 
                prefilledProject={transformedProject.name}
                triggerText="Add task"
                triggerVariant="default"
              />
            </MobileContainer>
            
            <MobileContainer padding="md">
              <ProjectTasksList projectName={transformedProject.name} />
            </MobileContainer>
            
            {!transformedProject.isRetainer && transformedProject.startDate && transformedProject.dueDate && (
              <MobileContainer padding="md">
                <ProjectTimeline project={transformedProject} projectDuration={projectDuration} />
              </MobileContainer>
            )}
          </div>

          <div className={isMobileDevice ? 'space-y-3' : 'space-y-6'}>
            <MobileContainer padding="md">
              <ProjectTeam projectId={transformedProject.id} />
            </MobileContainer>
            <MobileContainer padding="md">
              <ProjectTasks project={projectWithRealTasks} />
            </MobileContainer>
          </div>
        </div>

        {!isOnline && (
          <MobileContainer padding="md">
            <div className="text-center py-4">
              <p className="text-amber-600 text-sm">Offline mode - some features may be limited</p>
            </div>
          </MobileContainer>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
