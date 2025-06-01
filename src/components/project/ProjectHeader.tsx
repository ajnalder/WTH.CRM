
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/utils/projectUtils';

interface Project {
  name: string;
  client: string;
  status: string;
}

interface ProjectHeaderProps {
  project: Project;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/projects')}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
          <p className="text-lg text-gray-600">{project.client}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </div>
    </div>
  );
};
