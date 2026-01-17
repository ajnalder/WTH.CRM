
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';

export interface CompanySettings {
  id: string;
  user_id: string;
  company_name: string;
  logo_base64?: string;
  logo_inverse_base64?: string;
  logo_storage_id?: string;
  logo_inverse_storage_id?: string;
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

export const useCompanySettings = (userIdOverride?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const settingsData = useConvexQuery(
    api.companySettings.get,
    userIdOverride ? { userId: userIdOverride } : user ? { userId: user.id } : undefined
  ) as CompanySettings | null | undefined;
  const isLoading = settingsData === undefined;
  const settings = settingsData ?? null;

  const upsertSettings = useConvexMutation(api.companySettings.upsert);

  const createOrUpdateSettings = async (updates: Partial<CompanySettings>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setIsUpdating(true);
      await upsertSettings({ userId: user.id, updates });
      toast({
        title: "Success",
        description: "Company settings updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating company settings:', error);
      toast({
        title: "Error",
        description: "Failed to update company settings",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

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
    updateSettings: createOrUpdateSettings,
    uploadLogo,
    isUpdating,
  };
};
