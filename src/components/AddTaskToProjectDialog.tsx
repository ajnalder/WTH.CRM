
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { TeamMemberSelector } from '@/components/TeamMemberSelector';

interface AddTaskToProjectDialogProps {
  projectId: string;
  projectName: string;
  triggerText?: string;
}

export const AddTaskToProjectDialog: React.FC<AddTaskToProjectDialogProps> = ({
  projectId,
  projectName,
  triggerText = "Add Tasks"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<string>('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const { createTask, isCreating } = useTasks();

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

  const handleAddTasks = () => {
    if (!tasks.trim()) return;

    const taskLines = tasks
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    taskLines.forEach((taskTitle, index) => {
      // For now, we'll store the first selected team member as assignee
      // Later we can enhance this to support multiple assignees or rotate through them
      const assignee = selectedTeamMembers.length > 0 ? selectedTeamMembers[index % selectedTeamMembers.length] : null;
      
      createTask({
        title: taskTitle,
        description: null,
        assignee: assignee,
        due_date: null,
        tags: null,
        project: projectName,
        status: 'To Do',
        progress: 0,
        dropbox_url: null,
      });
    });

    setTasks('');
    setSelectedTeamMembers([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Tasks to {projectName}</DialogTitle>
          <DialogDescription>
            Add multiple tasks to this project. Enter each task on a new line.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tasks">Tasks</Label>
            <Textarea
              id="tasks"
              placeholder="Task 1&#10;Task 2&#10;Task 3"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddTasks} disabled={isCreating || !tasks.trim()}>
            {isCreating ? 'Adding...' : 'Add Tasks'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
