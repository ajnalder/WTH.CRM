import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmailCampaign {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content_html: string;
  content_json?: any;
  status: 'draft' | 'sending' | 'sent' | 'paused';
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
  updated_at: string;
}

export type CreateCampaignData = {
  name: string;
  subject: string;
  content_html: string;
  content_json?: any;
  status?: 'draft' | 'sending' | 'sent' | 'paused';
  scheduled_at?: string;
};

export const useEmailCampaigns = () => {
  const { user } = useAuth();

  const campaignsData = useConvexQuery(
    api.emailCampaigns.list,
    user ? { userId: user.id } : undefined
  );

  const campaigns = (campaignsData ?? []) as EmailCampaign[];
  const isLoading = campaignsData === undefined;

  const createCampaignMutation = useConvexMutation(api.emailCampaigns.create);
  const updateCampaignMutation = useConvexMutation(api.emailCampaigns.update);
  const deleteCampaignMutation = useConvexMutation(api.emailCampaigns.remove);

  const createCampaign = {
    mutate: async (campaign: CreateCampaignData) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const data = await createCampaignMutation({
          userId: user.id,
          ...campaign,
        });
        toast.success('Campaign created successfully');
        return data;
      } catch (error) {
        console.error('Error creating campaign:', error);
        toast.error('Failed to create campaign');
        throw error;
      }
    },
    isPending: false,
  };

  const updateCampaign = {
    mutate: async ({ id, ...updates }: Partial<EmailCampaign> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const data = await updateCampaignMutation({ id, userId: user.id, updates });
        toast.success('Campaign updated successfully');
        return data;
      } catch (error) {
        console.error('Error updating campaign:', error);
        toast.error('Failed to update campaign');
        throw error;
      }
    },
    isPending: false,
  };

  const deleteCampaign = {
    mutate: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        await deleteCampaignMutation({ id, userId: user.id });
        toast.success('Campaign deleted successfully');
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.error('Failed to delete campaign');
        throw error;
      }
    },
    isPending: false,
  };

  return {
    campaigns,
    isLoading,
    createCampaign: createCampaign.mutate,
    updateCampaign: updateCampaign.mutate,
    deleteCampaign: deleteCampaign.mutate,
    isCreating: createCampaign.isPending,
    isUpdating: updateCampaign.isPending,
    isDeleting: deleteCampaign.isPending,
  };
};
