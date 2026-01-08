import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ChecklistTemplate, ClientChecklist, ClientChecklistWithClient } from '@/types/checklist';

export const useChecklists = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Get checklist templates
  const templatesData = useConvexQuery(api.checklists.listTemplates, {});
  const templates = (templatesData ?? []) as ChecklistTemplate[];
  const templatesLoading = templatesData === undefined;

  // Get client checklists with client info
  const checklistsData = useConvexQuery(
    api.checklists.listByUser,
    user ? { userId: user.id } : undefined
  );
  const clientChecklists = (checklistsData ?? []) as ClientChecklistWithClient[];
  const checklistsLoading = checklistsData === undefined;

  const createChecklistMutation = useConvexMutation(api.checklists.createChecklist);
  const updateChecklistMutation = useConvexMutation(api.checklists.updateChecklist);
  const deleteChecklistMutation = useConvexMutation(api.checklists.removeChecklist);
  const updateTemplateMutation = useConvexMutation(api.checklists.updateTemplate);

  // Create new checklist
  const createChecklist = {
    mutate: async ({ clientId, templateId, templateName }: {
      clientId: string;
      templateId: string;
      templateName: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const data = await createChecklistMutation({
          userId: user.id,
          client_id: clientId,
          template_id: templateId,
          template_name: templateName,
        });
        toast({
          title: "Checklist Created",
          description: "New checklist has been created successfully.",
        });
        return data;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create checklist. Please try again.",
          variant: "destructive",
        });
        console.error('Error creating checklist:', error);
        throw error;
      }
    },
    isPending: false,
  };

  // Update checklist progress
  const updateChecklist = {
    mutate: async ({
      id,
      completedItems,
      status
    }: {
      id: string;
      completed_items?: string[];
      completedItems?: string[];
      status?: 'in_progress' | 'completed';
    }) => {
      if (!user) throw new Error('User not authenticated');

      try {
        await updateChecklistMutation({
          id,
          userId: user.id,
          completed_items: completedItems || completed_items || [],
          status,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update checklist. Please try again.",
          variant: "destructive",
        });
        console.error('Error updating checklist:', error);
        throw error;
      }
    },
    isPending: false,
  };

  // Delete checklist
  const deleteChecklist = {
    mutate: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        await deleteChecklistMutation({ id, userId: user.id });
        toast({
          title: "Checklist Deleted",
          description: "Checklist has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete checklist. Please try again.",
          variant: "destructive",
        });
        console.error('Error deleting checklist:', error);
        throw error;
      }
    },
    isPending: false,
  };

  // Update template
  const updateTemplate = {
    mutate: async ({ name, items }: { name: string; items: any[] }) => {
      try {
        await updateTemplateMutation({ name, items });
        toast({
          title: "Template Updated",
          description: "Checklist template has been updated successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update template. Please try again.",
          variant: "destructive",
        });
        console.error('Error updating template:', error);
        throw error;
      }
    },
    isPending: false,
  };

  return {
    templates,
    templatesLoading,
    clientChecklists,
    checklistsLoading,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    updateTemplate,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isUpdatingTemplate: false,
  };
};
