
import React from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EditProjectDialog } from './EditProjectDialog';
import { ProjectCompletionDialog } from './ProjectCompletionDialog';

interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  description: string;
  priority: string;
  startDate: string;
  dueDate: string;
  budget: number;
  isRetainer: boolean;
  client_id?: string;
  is_billable?: boolean;
}

interface ProjectHeaderProps {
  project: Project;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    // TODO: Implement delete project functionality
    console.log('Delete project:', project.id);
  };

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
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center space-x-2 ml-auto">
              <ProjectCompletionDialog
                projectId={project.id}
                projectName={project.name}
                currentStatus={project.status}
              />
              <EditProjectDialog
                project={project}
                trigger={
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                }
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDelete}
                className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-600">{project.client}</p>
        </div>
      </div>
    </div>
  );
};
