
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { useProjectTeamMembers } from '@/hooks/useProjectTeamMembers';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ProjectBasicFields } from './ProjectBasicFields';
import { ProjectDateFields } from './ProjectDateFields';
import { ProjectSettingsFields } from './ProjectSettingsFields';
import { ProjectTeamSection } from './ProjectTeamSection';

const editProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['Planning', 'In Progress', 'Review', 'Completed']),
  priority: z.enum(['Low', 'Medium', 'High']),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  budget: z.string().optional(),
  is_retainer: z.boolean(),
  is_billable: z.boolean(),
});

export type EditProjectFormData = z.infer<typeof editProjectSchema>;

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

interface EditProjectFormProps {
  project: Project;
  onSuccess: () => void;
}

export const EditProjectForm: React.FC<EditProjectFormProps> = ({
  project,
  onSuccess,
}) => {
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const { updateProject } = useProjects();
  const { 
    projectTeamMembers, 
    assignTeamMember, 
    removeTeamMember,
    isAssigning,
    isRemoving 
  } = useProjectTeamMembers(project.id);
  const { toast } = useToast();

  // Initialize selected team members when team members change
  React.useEffect(() => {
    if (projectTeamMembers.length > 0) {
      setSelectedTeamMembers(projectTeamMembers.map(ptm => ptm.user_id));
    }
  }, [projectTeamMembers]);

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      status: project.status as any,
      priority: project.priority as any,
      start_date: project.startDate ? new Date(project.startDate) : undefined,
      due_date: project.dueDate ? new Date(project.dueDate) : undefined,
      budget: project.budget ? project.budget.toString() : '',
      is_retainer: project.isRetainer || false,
      is_billable: project.is_billable !== false,
    },
  });

  const handleTeamMemberToggle = (memberId: string) => {
    const currentlyAssigned = projectTeamMembers.some(ptm => ptm.user_id === memberId);
    const isInSelectedList = selectedTeamMembers.includes(memberId);

    if (currentlyAssigned && isInSelectedList) {
      // Remove from project and selected list
      removeTeamMember({ projectId: project.id, teamMemberId: memberId });
      setSelectedTeamMembers(prev => prev.filter(id => id !== memberId));
    } else if (!currentlyAssigned && !isInSelectedList) {
      // Add to selected list (will be assigned on form submit)
      setSelectedTeamMembers(prev => [...prev, memberId]);
    } else if (currentlyAssigned && !isInSelectedList) {
      // Remove from project
      removeTeamMember({ projectId: project.id, teamMemberId: memberId });
    } else if (!currentlyAssigned && isInSelectedList) {
      // Remove from selected list
      setSelectedTeamMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  const handleRemoveTeamMember = (memberId: string) => {
    const currentlyAssigned = projectTeamMembers.some(ptm => ptm.user_id === memberId);
    
    if (currentlyAssigned) {
      removeTeamMember({ projectId: project.id, teamMemberId: memberId });
    }
    
    setSelectedTeamMembers(prev => prev.filter(id => id !== memberId));
  };

  const onSubmit = async (data: EditProjectFormData) => {
    try {
      const updateData = {
        name: data.name,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date ? format(data.start_date, 'yyyy-MM-dd') : null,
        due_date: data.due_date ? format(data.due_date, 'yyyy-MM-dd') : null,
        budget: data.budget ? parseFloat(data.budget) : null,
        is_retainer: data.is_retainer,
        is_billable: data.is_billable,
      };

      updateProject({
        projectId: project.id,
        projectData: updateData
      });

      // Assign new team members
      const currentlyAssignedIds = projectTeamMembers.map(ptm => ptm.user_id);
      const newAssignments = selectedTeamMembers.filter(id => !currentlyAssignedIds.includes(id));
      
      newAssignments.forEach(memberId => {
        assignTeamMember({ projectId: project.id, teamMemberId: memberId });
      });

      onSuccess();
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ProjectBasicFields control={form.control} clientName={project.client} />
        <ProjectDateFields control={form.control} />
        <ProjectSettingsFields control={form.control} />
        <ProjectTeamSection
          selectedMembers={selectedTeamMembers}
          onMemberToggle={handleTeamMemberToggle}
          onRemoveMember={handleRemoveTeamMember}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isAssigning || isRemoving}
          >
            {isAssigning || isRemoving ? 'Updating...' : 'Update Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
