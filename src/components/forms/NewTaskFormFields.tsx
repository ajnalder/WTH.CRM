
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Project {
  id: string;
  name: string;
}

interface NewTaskFormFieldsProps {
  control: Control<any>;
  projects: Project[];
  isLoadingProjects: boolean;
  prefilledProject?: string;
  hideFields?: string[]; // New prop to hide specific fields
}

export const NewTaskFormFields: React.FC<NewTaskFormFieldsProps> = ({
  control,
  projects,
  isLoadingProjects,
  prefilledProject,
  hideFields = []
}) => {
  return (
    <>
      {!hideFields.includes('title') && (
        <FormField
          control={control}
          name="title"
          rules={{ required: 'Task title is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter task description (optional)" 
                {...field} 
                className="min-h-[80px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="project"
        rules={{ required: 'Project is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              disabled={!!prefilledProject}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.name}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {!hideFields.includes('dueDate') && (
        <FormField
          control={control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {!hideFields.includes('tags') && (
        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="Enter tags separated by commas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {!hideFields.includes('dropboxUrl') && (
        <FormField
          control={control}
          name="dropboxUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dropbox URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter Dropbox URL (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
