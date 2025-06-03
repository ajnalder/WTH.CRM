
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
import { Switch } from '@/components/ui/switch';

interface EditProjectFormData {
  name: string;
  description?: string;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  start_date?: Date;
  due_date?: Date;
  budget?: string;
  is_retainer: boolean;
  is_billable: boolean;
}

interface ProjectSettingsFieldsProps {
  control: Control<EditProjectFormData>;
}

export const ProjectSettingsFields: React.FC<ProjectSettingsFieldsProps> = ({
  control,
}) => {
  return (
    <>
      <FormField
        control={control}
        name="budget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Budget</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter budget amount" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="is_retainer"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Retainer Project</FormLabel>
                <div className="text-sm text-muted-foreground">
                  This is an ongoing retainer project
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="is_billable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Billable Project</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Time logged to this project is billable
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
