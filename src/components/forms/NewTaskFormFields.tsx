
import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskFormData {
  title: string;
  description: string;
  project: string;
  dueDate: string;
  tags: string;
  dropboxUrl: string;
}

interface NewTaskFormFieldsProps {
  control: Control<TaskFormData>;
  projects: any[];
  isLoadingProjects: boolean;
  prefilledProject?: string;
}

export const NewTaskFormFields: React.FC<NewTaskFormFieldsProps> = ({
  control,
  projects,
  isLoadingProjects,
  prefilledProject
}) => {
  return (
    <>
      <FormField
        control={control}
        name="title"
        rules={{ required: "Task title is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Task Title</FormLabel>
            <FormControl>
              <Input placeholder="Design user dashboard mockups" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Detailed description of the task..."
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="project"
        rules={{ required: "Project is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={!!prefilledProject}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoadingProjects ? (
                  <SelectItem value="" disabled>Loading projects...</SelectItem>
                ) : projects.length === 0 ? (
                  <SelectItem value="" disabled>No projects available</SelectItem>
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4">
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
        
        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Frontend, React"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="dropboxUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dropbox URL (optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://dropbox.com/..."
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
