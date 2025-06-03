
import React from 'react';
import { ProjectGrid } from '@/components/ProjectGrid';
import { ProjectTable } from '@/components/ProjectTable';
import { ProjectControls } from '@/components/projects/ProjectControls';
import { useProjectsPage } from '@/hooks/useProjectsPage';
import { transformProject } from '@/utils/projectUtils';
import { useTasks } from '@/hooks/useTasks';

const Projects = () => {
  const {
    projects,
    isLoading,
    error,
    searchTerm,
    sortBy,
    viewMode,
    setSearchTerm,
    setSortBy,
    setViewMode,
    handleProjectCreated
  } = useProjectsPage();

  const { tasks } = useTasks();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Projects</h1>
        <p className="text-gray-600 mb-4">There was an error loading the projects.</p>
      </div>
    );
  }

  // Transform projects for display
  const transformedProjects = projects.map(project => {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
        <p className="text-gray-600">Manage and track all your projects</p>
      </div>

      {/* Controls */}
      <ProjectControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onProjectCreated={handleProjectCreated}
      />

      {/* Projects Display */}
      {transformedProjects.length > 0 ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transformedProjects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.client}</p>
                  <p className="text-sm text-gray-500">{project.status}</p>
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <ProjectTable projects={transformedProjects} />
          )}
        </div>
      ) : (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 text-center py-8 text-gray-500">
          <p>No projects found. Create your first project to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Projects;
