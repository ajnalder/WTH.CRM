
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TaskFormFields } from './TaskFormFields';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { TaskFormData } from '@/types/taskForm';

interface TaskCreateFormProps {
  prefilledProject?: string;
  multipleMode?: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export const TaskCreateForm: React.FC<TaskCreateFormProps> = ({
  prefilledProject,
  multipleMode = false,
  onClose,
  onTaskCreated
}) => {
  const { createTask, isCreating } = useTasks();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      project: prefilledProject || '',
      assignee: 'unassigned',
      dueDate: '',
      multipleTasks: ''
    }
  });

  React.useEffect(() => {
    if (prefilledProject) {
      setValue('project', prefilledProject);
    }
  }, [prefilledProject, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    console.log('TaskCreateForm - Form submission:', { data, multipleMode });

    if (multipleMode) {
      // Handle multiple tasks
      if (!data.multipleTasks?.trim()) {
        console.error('Multiple tasks text is required');
        return;
      }

      const taskLines = data.multipleTasks
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      console.log('TaskCreateForm - Creating multiple tasks:', taskLines);

      for (const taskTitle of taskLines) {
        const taskData = {
          title: taskTitle,
          description: data.description || null,
          project: data.project,
          assignee: data.assignee === 'unassigned' ? null : data.assignee,
          due_date: data.dueDate || null,
          status: 'To Do',
          progress: 0,
          tags: null,
          dropbox_url: null
        };
        
        console.log('TaskCreateForm - Creating task:', taskData);
        await createTask(taskData);
      }
    } else {
      // Handle single task
      if (!data.title?.trim()) {
        console.error('Task title is required');
        return;
      }

      const taskData = {
        title: data.title,
        description: data.description || null,
        project: data.project,
        assignee: data.assignee === 'unassigned' ? null : data.assignee,
        due_date: data.dueDate || null,
        status: 'To Do',
        progress: 0,
        tags: null,
        dropbox_url: null
      };
      
      console.log('TaskCreateForm - Creating single task:', taskData);
      await createTask(taskData);
    }

    // Close dialog and reset form
    onClose();
    reset();
    onTaskCreated?.();
  };

  const dialogTitle = multipleMode ? "Add Multiple Tasks" : "Create New Task";
  const dialogDescription = multipleMode 
    ? "Add multiple tasks to this project. Enter each task on a new line."
    : "Add a new task to track progress and assign to team members.";

  return (
    <>
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>{dialogDescription}</DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TaskFormFields
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          projects={projects}
          isLoadingProjects={isLoadingProjects}
          prefilledProject={prefilledProject}
          multipleMode={multipleMode}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : multipleMode ? 'Add Tasks' : 'Create Task'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};
