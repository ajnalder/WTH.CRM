
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

interface ProjectCompletionDialogProps {
  projectId: string;
  projectName: string;
  currentStatus: string;
  trigger?: React.ReactNode;
}

export const ProjectCompletionDialog: React.FC<ProjectCompletionDialogProps> = ({
  projectId,
  projectName,
  currentStatus,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const { updateProject, isUpdating } = useProjects();
  const { toast } = useToast();

  const handleMarkComplete = () => {
    updateProject({
      projectId,
      projectData: { status: 'Completed' }
    });
    setOpen(false);
    toast({
      title: "Project Completed",
      description: `${projectName} has been marked as completed.`,
    });
  };

  const handleReactivate = () => {
    updateProject({
      projectId,
      projectData: { status: 'In Progress' }
    });
    setOpen(false);
    toast({
      title: "Project Reactivated",
      description: `${projectName} has been reactivated and is now in progress.`,
    });
  };

  const isCompleted = currentStatus === 'Completed';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            className={isCompleted ? "text-green-600 border-green-200" : "bg-green-600 hover:bg-green-700"}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isCompleted ? 'Reactivate' : 'Mark Complete'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCompleted ? 'Reactivate Project' : 'Complete Project'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-600">
            {isCompleted 
              ? `Are you sure you want to reactivate "${projectName}"? This will change its status back to "In Progress".`
              : `Are you sure you want to mark "${projectName}" as completed? This will move it to the completed projects section.`
            }
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={isCompleted ? handleReactivate : handleMarkComplete}
            disabled={isUpdating}
            className={isCompleted ? "" : "bg-green-600 hover:bg-green-700"}
          >
            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isCompleted ? 'Reactivate Project' : 'Mark Complete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
