
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CompanySettings {
  id: string;
  user_id: string;
  company_name: string;
  logo_base64?: string;
  logo_inverse_base64?: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  gst_number?: string;
  bank_details?: string;
  bank_account?: string;
  owner_name?: string;
  xero_account_code?: string;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching company settings:', error);
        throw error;
      }

      return data as CompanySettings | null;
    },
  });

  const createOrUpdateSettings = useMutation({
    mutationFn: async (updates: Partial<CompanySettings>) => {
      if (settings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('company_settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new settings - ensure user_id is included
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const newSettings = {
          ...updates,
          user_id: user.id,
        };

        const { data, error } = await supabase
          .from('company_settings')
          .insert([newSettings])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast({
        title: "Success",
        description: "Company settings updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating company settings:', error);
      toast({
        title: "Error",
        description: "Failed to update company settings",
        variant: "destructive",
      });
    },
  });

  const uploadLogo = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    settings,
    isLoading,
    updateSettings: createOrUpdateSettings.mutate,
    uploadLogo,
    isUpdating: createOrUpdateSettings.isPending
  };
};
