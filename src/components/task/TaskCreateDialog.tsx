
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TaskCreateTrigger } from './create/TaskCreateTrigger';
import { TaskCreateForm } from './create/TaskCreateForm';
import { TaskCreateDialogProps } from '@/types/taskForm';

export const TaskCreateDialog: React.FC<TaskCreateDialogProps> = ({
  triggerText = "New Task",
  triggerVariant = "default",
  prefilledProject,
  multipleMode = false,
  onTaskCreated
}) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleTaskCreated = () => {
    onTaskCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TaskCreateTrigger 
          triggerText={triggerText}
          triggerVariant={triggerVariant}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <TaskCreateForm
          prefilledProject={prefilledProject}
          multipleMode={multipleMode}
          onClose={handleClose}
          onTaskCreated={handleTaskCreated}
        />
      </DialogContent>
    </Dialog>
  );
};
