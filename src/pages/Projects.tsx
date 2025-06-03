
import React from 'react';
import { ProjectGrid } from '@/components/ProjectGrid';
import { ProjectControls } from '@/components/projects/ProjectControls';
import { useProjectsPage } from '@/hooks/useProjectsPage';

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
      <ProjectGrid />
    </div>
  );
};

export default Projects;
