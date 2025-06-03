
import React from 'react';
import { ProjectGrid } from '@/components/ProjectGrid';
import { NewProjectForm } from '@/components/NewProjectForm';

const Projects = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">Manage and track all your projects</p>
        </div>
        <NewProjectForm />
      </div>
      
      <ProjectGrid />
    </div>
  );
};

export default Projects;
