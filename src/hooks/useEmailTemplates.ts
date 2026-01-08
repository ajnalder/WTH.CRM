import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  content_html: string;
  content_json?: any;
  thumbnail_url?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateTemplateData = {
  name: string;
  description?: string;
  content_html: string;
  content_json?: any;
  thumbnail_url?: string;
};

export const useEmailTemplates = () => {
  const { user } = useAuth();

  const templatesData = useConvexQuery(
    api.emailTemplates.list,
    user ? { userId: user.id } : undefined
  );

  const templates = (templatesData ?? []) as EmailTemplate[];
  const isLoading = templatesData === undefined;

  const createTemplateMutation = useConvexMutation(api.emailTemplates.create);
  const updateTemplateMutation = useConvexMutation(api.emailTemplates.update);
  const deleteTemplateMutation = useConvexMutation(api.emailTemplates.remove);

  const createTemplate = {
    mutate: async (template: CreateTemplateData) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const data = await createTemplateMutation({
          userId: user.id,
          ...template,
        });
        toast.success('Template created successfully');
        return data;
      } catch (error) {
        console.error('Error creating template:', error);
        toast.error('Failed to create template');
        throw error;
      }
    },
    isPending: false,
  };

  const updateTemplate = {
    mutate: async ({ id, ...updates }: Partial<EmailTemplate> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const data = await updateTemplateMutation({ id, userId: user.id, updates });
        toast.success('Template updated successfully');
        return data;
      } catch (error) {
        console.error('Error updating template:', error);
        toast.error('Failed to update template');
        throw error;
      }
    },
    isPending: false,
  };

  const deleteTemplate = {
    mutate: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        await deleteTemplateMutation({ id, userId: user.id });
        toast.success('Template deleted successfully');
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete template');
        throw error;
      }
    },
    isPending: false,
  };

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
};
