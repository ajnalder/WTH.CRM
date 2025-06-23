
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { cn } from '@/lib/utils';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskEditFormData {
  title: string;
  description: string;
  assignee: string | null;
  status: string;
  due_date: string | null;
  dropbox_url: string;
}

interface TaskEditDialogProps {
  task: TaskWithClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TaskEditFormData) => void;
  isUpdating: boolean;
}

const STATUS_OPTIONS = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' }
];

export const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  task,
  open,
  onOpenChange,
  onSave,
  isUpdating
}) => {
  const { teamMembers } = useTeamMembers();
  
  const form = useForm<TaskEditFormData>({
    defaultValues: {
      title: task.title,
      description: task.description || '',
      assignee: task.assignee,
      status: task.status,
      due_date: task.due_date,
      dropbox_url: task.dropbox_url || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        description: task.description || '',
        assignee: task.assignee,
        status: task.status,
        due_date: task.due_date,
        dropbox_url: task.dropbox_url || '',
      });
    }
  }, [open, task, form]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const onSubmit = (data: TaskEditFormData) => {
    onSave({
      ...data,
      dropbox_url: data.dropbox_url.trim() || null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update all task details from this single dialog.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Task title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Member</FormLabel>
                    <Select value={field.value || 'unassigned'} onValueChange={(value) => field.onChange(value === 'unassigned' ? null : value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            {field.value ? (
                              (() => {
                                const member = teamMembers.find(m => m.id === field.value);
                                return member ? (
                                  <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                                    <div className={`w-4 h-4 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                                      {member.avatar}
                                    </div>
                                    {member.name}
                                  </Badge>
                                ) : 'Unassigned';
                              })()
                            ) : (
                              <span className="text-gray-500">Unassigned</span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <span className="text-gray-500">Unassigned</span>
                        </SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                                {member.avatar}
                              </div>
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            <Badge className={`text-xs ${getStatusColor(field.value)}`}>
                              {field.value}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={`text-xs ${getStatusColor(option.value)}`}>
                              {option.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), 'PPP') : 'No due date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Format the date to YYYY-MM-DD to avoid timezone issues
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const formattedDate = `${year}-${month}-${day}`;
                            field.onChange(formattedDate);
                          } else {
                            field.onChange(null);
                          }
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="p-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange(null)}
                          className="w-full"
                        >
                          Clear due date
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dropbox_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dropbox URL</FormLabel>
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
