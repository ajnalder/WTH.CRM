
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
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
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { TeamMemberSelector } from '@/components/TeamMemberSelector';

interface TaskFormData {
  title: string;
  description: string;
  project: string;
  dueDate: string;
  tags: string;
  dropboxUrl: string;
}

interface NewTaskFormProps {
  onTaskCreated?: () => void;
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ onTaskCreated }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = React.useState<string[]>([]);
  const { createTask, isCreating } = useTasks();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const form = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      project: '',
      dueDate: '',
      tags: '',
      dropboxUrl: '',
    },
  });

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleRemoveTeamMember = (memberId: string) => {
    setSelectedTeamMembers(prev => prev.filter(id => id !== memberId));
  };

  const onSubmit = (data: TaskFormData) => {
    console.log('Creating new task:', data, 'with team members:', selectedTeamMembers);
    
    const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // For now, we'll store the first selected team member as assignee
    // Later we can enhance this to support multiple assignees
    const assignee = selectedTeamMembers.length > 0 ? selectedTeamMembers[0] : null;
    
    createTask({
      title: data.title,
      description: data.description || null,
      assignee: assignee,
      due_date: data.dueDate || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      project: data.project,
      status: 'To Do',
      progress: 0,
      dropbox_url: data.dropboxUrl || null,
    });
    
    setOpen(false);
    form.reset();
    setSelectedTeamMembers([]);
    
    if (onTaskCreated) {
      onTaskCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus size={20} className="mr-2" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to track progress and assign to team members.
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
                    <Input placeholder="Design user dashboard mockups" {...field} />
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
              control={form.control}
              name="project"
              rules={{ required: "Project is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            
            <div>
              <label className="text-sm font-medium">Assign Team Members</label>
              <div className="mt-2">
                <TeamMemberSelector
                  selectedMembers={selectedTeamMembers}
                  onMemberToggle={handleTeamMemberToggle}
                  onRemoveMember={handleRemoveTeamMember}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
              control={form.control}
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
