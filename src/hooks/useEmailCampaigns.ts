import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }

      return data as EmailCampaign[];
    },
    enabled: !!user,
  });

  const createCampaign = useMutation({
    mutationFn: async (campaign: CreateCampaignData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaign,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailCampaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error) => {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    },
  });

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