
import React from 'react';
import { ProjectGrid } from '@/components/ProjectGrid';

const Projects = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-1">Manage and track all your projects</p>
      </div>
      <ProjectGrid />
    </div>
  );
};

export default Projects;
