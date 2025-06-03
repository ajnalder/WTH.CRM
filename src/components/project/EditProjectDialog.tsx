
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditProjectForm } from './edit/EditProjectForm';

interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  budget: number;
  isRetainer: boolean;
  client_id?: string;
  is_billable?: boolean;
}

interface EditProjectDialogProps {
  project: Project;
  trigger?: React.ReactNode;
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({ 
  project, 
  trigger 
}) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        
        <EditProjectForm project={project} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};
