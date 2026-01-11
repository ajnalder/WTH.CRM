
import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditProjectDialog } from './EditProjectDialog';
import { ProjectCompletionDialog } from './ProjectCompletionDialog';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { useProjects } from '@/hooks/useProjects';

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
  const { isMobileDevice } = useMobileOptimization();
  const { deleteProject, isDeleting } = useProjects();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      setShowDeleteDialog(false);
      navigate('/projects');
    } catch (error) {
      // Toasts handled in hook; keep dialog open on error.
    }
  };

  if (isMobileDevice) {
    return (
      <div className="mb-6">
        <MobileButton 
          variant="ghost" 
          onClick={() => navigate('/projects')}
          className="mb-4 -ml-2"
          hapticFeedback={true}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </MobileButton>
        
        <div className="space-y-4">
          {/* Project title - full width */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight break-words">
              {project.name}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-1">{project.client}</p>
          </div>
          
          {/* Action buttons - stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <ProjectCompletionDialog
              projectId={project.id}
              projectName={project.name}
              currentStatus={project.status}
            />
            <div className="flex gap-2">
              <EditProjectDialog
                project={project}
                trigger={
                  <MobileButton 
                    variant="outline" 
                    size="sm"
                    className="flex-1 sm:flex-none"
                    hapticFeedback={true}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span>Edit</span>
                  </MobileButton>
                }
              />
              <MobileButton 
                variant="outline" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                hapticFeedback={true}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Delete</span>
              </MobileButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
