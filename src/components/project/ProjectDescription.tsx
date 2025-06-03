
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Project {
  id: string;
  description: string;
}

interface ProjectDescriptionProps {
  project: Project;
}

export const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ project }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Description</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed">
          {project.description || 'No description provided'}
        </p>
      </CardContent>
    </Card>
  );
};
