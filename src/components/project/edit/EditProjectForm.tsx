
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ProjectBasicFields } from './ProjectBasicFields';
import { ProjectDateFields } from './ProjectDateFields';
import { ProjectSettingsFields } from './ProjectSettingsFields';
import { ProjectTeamSection } from './ProjectTeamSection';
import { useProjects } from '@/hooks/useProjects';
import { useProjectTeamMembers } from '@/hooks/useProjectTeamMembers';

const editProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string(),
  status: z.enum(['Planning', 'In Progress', 'Review', 'Completed']),
  priority: z.enum(['Low', 'Medium', 'High']),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  budget: z.string(),
  is_retainer: z.boolean(),
  is_billable: z.boolean(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

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
  onSuccess 
}) => {
  const { updateProject, isUpdating } = useProjects();
  const { 
    projectTeamMembers, 
    assignTeamMember, 
    removeTeamMember 
  } = useProjectTeamMembers(project.id);

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      status: (project.status as EditProjectFormData['status']) || 'Planning',
      priority: (project.priority as EditProjectFormData['priority']) || 'Medium',
      start_date: project.startDate ? new Date(project.startDate) : undefined,
      due_date: project.dueDate ? new Date(project.dueDate) : undefined,
      budget: project.budget ? project.budget.toString() : '',
      is_retainer: project.isRetainer || false,
      is_billable: project.is_billable ?? true,
    },
  });

  const onSubmit = (data: EditProjectFormData) => {
    updateProject({
      projectId: project.id,
      projectData: {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date?.toISOString().split('T')[0] || null,
        due_date: data.due_date?.toISOString().split('T')[0] || null,
        budget: data.budget ? parseFloat(data.budget) : null,
        is_retainer: data.is_retainer,
        is_billable: data.is_billable,
      }
    });
    onSuccess();
  };

  const selectedMembers = projectTeamMembers.map(ptm => ptm.user_id);

  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      const projectTeamMember = projectTeamMembers.find(
        ptm => ptm.user_id === memberId
      );
      if (projectTeamMember) {
        removeTeamMember({ 
          projectId: project.id, 
          teamMemberId: projectTeamMember.id 
        });
      }
    } else {
      assignTeamMember({ 
        projectId: project.id, 
        teamMemberId: memberId 
      });
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const projectTeamMember = projectTeamMembers.find(
      ptm => ptm.user_id === memberId
    );
    if (projectTeamMember) {
      removeTeamMember({ 
        projectId: project.id, 
        teamMemberId: projectTeamMember.id 
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ProjectBasicFields control={form.control} />
        <ProjectDateFields control={form.control} />
        <ProjectSettingsFields control={form.control} />
        <ProjectTeamSection
          selectedMembers={selectedMembers}
          onMemberToggle={handleMemberToggle}
          onRemoveMember={handleRemoveMember}
        />
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? 'Updating...' : 'Update Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
