import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ChecklistTemplate, ClientChecklist, ClientChecklistWithClient } from '@/types/checklist';

export const useChecklists = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get checklist templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['checklist-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data.map(template => ({
        ...template,
        items: typeof template.items === 'string' ? JSON.parse(template.items) : template.items
      })) as ChecklistTemplate[];
    },
  });

  // Get client checklists with client info
  const { data: clientChecklists = [], isLoading: checklistsLoading } = useQuery({
    queryKey: ['client-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_checklists')
        .select(`
          *,
          client:clients(id, company, name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(checklist => ({
        ...checklist,
        completed_items: typeof checklist.completed_items === 'string' 
          ? JSON.parse(checklist.completed_items) 
          : checklist.completed_items
      })) as ClientChecklistWithClient[];
    },
    enabled: !!user?.id,
  });

  // Create new checklist
  const createChecklist = useMutation({
    mutationFn: async ({ clientId, templateId, templateName }: { 
      clientId: string; 
      templateId: string; 
      templateName: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('client_checklists')
        .insert({
          user_id: user.id,
          client_id: clientId,
          template_id: templateId,
          template_name: templateName,
          status: 'in_progress',
          completed_items: []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-checklists'] });
      toast({
        title: "Checklist Created",
        description: "New checklist has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create checklist. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating checklist:', error);
    },
  });

  // Update checklist progress
  const updateChecklist = useMutation({
    mutationFn: async ({ 
      id, 
      completedItems, 
      status 
    }: { 
      id: string; 
      completedItems: string[]; 
      status?: 'in_progress' | 'completed';
    }) => {
      const updates: any = {
        completed_items: completedItems,
        updated_at: new Date().toISOString()
      };

      if (status) {
        updates.status = status;
        if (status === 'completed') {
          updates.completed_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('client_checklists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-checklists'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update checklist. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating checklist:', error);
    },
  });

  // Delete checklist
  const deleteChecklist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-checklists'] });
      toast({
        title: "Checklist Deleted",
        description: "Checklist has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete checklist. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting checklist:', error);
    },
  });

  // Update template
  const updateTemplate = useMutation({
    mutationFn: async ({ name, items }: { name: string; items: any[] }) => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .update({
          items,
          updated_at: new Date().toISOString()
        })
        .eq('name', name)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: "Template Updated",
        description: "Checklist template has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating template:', error);
    },
  });

  return {
    templates,
    templatesLoading,
    clientChecklists,
    checklistsLoading,
    createChecklist: createChecklist.mutate,
    updateChecklist: updateChecklist.mutate,
    deleteChecklist: deleteChecklist.mutate,
    updateTemplate: updateTemplate.mutate,
    isCreating: createChecklist.isPending,
    isUpdating: updateChecklist.isPending,
    isDeleting: deleteChecklist.isPending,
    isUpdatingTemplate: updateTemplate.isPending,
  };
};
