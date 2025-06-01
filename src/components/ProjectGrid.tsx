
import React from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { transformProject } from '@/utils/projectUtils';
import { useTasks } from '@/hooks/useTasks';
import type { Project } from '@/hooks/useProjects';

interface ProjectGridProps {
  projects: Project[];
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  const { tasks } = useTasks();
  
  // Show only the most recent 6 projects
  const recentProjects = projects.slice(0, 6);
  
  const transformedProjects = recentProjects.map(project => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
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
          <p>No projects found. Create your first project to get started!</p>
        </div>
      )}
    </div>
  );
};
