
import React from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { ShadowBox } from '@/components/ui/shadow-box';
import { transformProject } from '@/utils/projectUtils';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
export const ProjectGrid: React.FC = () => {
  const { projects, isLoading } = useProjects();
  const { tasks } = useTasks();
  
  if (isLoading) {
    return (
      <ShadowBox className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Current Projects</h2>
          <button className="text-blue-600 hover:text-blue-800 font-medium">View All</button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Loading projects...</p>
        </div>
      </ShadowBox>
    );
  }
  
  // Filter to show only current/active projects (In Progress, Planning, Review)
  const currentProjects = projects
    .filter(p => p.status === 'In Progress' || p.status === 'Planning' || p.status === 'Review')
    .slice(0, 6);
  
  const transformedProjects = currentProjects.map(project => {
    // Since the Project type doesn't include clients but the query returns client data,
    // we need to access it through the any type and provide fallback
    const projectWithClients = {
      ...project,
      clients: (project as any).clients || { company: 'Unknown Client', name: 'Unknown Client' }
    };
    
    const transformedProject = transformProject(projectWithClients);
    
    // Calculate real task counts for this project
    const projectTasks = tasks.filter(task => task.project === project.name);
    const completedTasks = projectTasks.filter(task => task.status === 'Completed' || task.status === 'Done').length;
    
    return {
      ...transformedProject,
      tasks: {
        completed: completedTasks,
        total: projectTasks.length
      }
    };
  });

  return (
    <ShadowBox className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Current Projects</h2>
        <button className="text-blue-600 hover:text-blue-800 font-medium">View All</button>
      </div>
      
      {transformedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transformedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
      <div className="text-center py-8 text-gray-500">
          <p>All caught up! No active projects at the moment.</p>
        </div>
      )}
    </ShadowBox>
  );
};
