
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project } from '@/types/project';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { TaskFormData } from '@/types/taskForm';

interface TaskFormFieldsProps {
  register: UseFormRegister<TaskFormData>;
  setValue: UseFormSetValue<TaskFormData>;
  watch: UseFormWatch<TaskFormData>;
  errors: FieldErrors<TaskFormData>;
  projects: Project[];
  isLoadingProjects: boolean;
  prefilledProject?: string;
  multipleMode?: boolean;
}

export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  register,
  setValue,
  watch,
  errors,
  projects,
  isLoadingProjects,
  prefilledProject,
  multipleMode = false
}) => {
  const { teamMembers } = useTeamMembers();
  const selectedProject = watch('project');
  const selectedAssignee = watch('assignee');

  return (
    <>
      {!multipleMode && (
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Enter task title"
            {...register('title', { required: 'Task title is required' })}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter task description (optional)"
          className="min-h-[80px]"
          {...register('description')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project">Project *</Label>
        <Select
          value={selectedProject}
          onValueChange={(value) => setValue('project', value)}
          disabled={!!prefilledProject}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.name}>
                <div className="flex flex-col">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-xs text-gray-500">{project.client_name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.project && (
          <p className="text-sm text-red-600">{errors.project.message}</p>
        )}
      </div>

      {multipleMode ? (
        <div className="space-y-2">
          <Label htmlFor="multipleTasks">Tasks *</Label>
          <Textarea
            id="multipleTasks"
            placeholder="Task 1&#10;Task 2&#10;Task 3"
            className="min-h-[120px]"
            {...register('multipleTasks', { required: 'Please enter at least one task' })}
          />
          {errors.multipleTasks && (
            <p className="text-sm text-red-600">{errors.multipleTasks.message}</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={selectedAssignee}
              onValueChange={(value) => setValue('assignee', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
            />
          </div>
        </>
      )}
    </>
  );
};
