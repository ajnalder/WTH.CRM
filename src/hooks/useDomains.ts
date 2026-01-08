import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Domain {
  id: string;
  client_id: string;
  name: string;
  registrar: string;
  renewal_date: string;
  platform: string;
  renewal_cost: number;
  client_managed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDomainData {
  client_id: string;
  name: string;
  registrar: string;
  renewal_date: string;
  platform: string;
  renewal_cost: number;
  client_managed: boolean;
  notes?: string;
}

export const useDomains = (clientId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Note: Convex domains.listByUser returns all domains for the user with client info
  // We need to filter by clientId on the frontend
  const allDomainsData = useConvexQuery(
    api.domains.listByUser,
    user ? { userId: user.id } : undefined
  );

  const domains = (allDomainsData ?? []).filter((d: any) => d.client_id === clientId);
  const isLoading = allDomainsData === undefined;
  const error = null;

  const createDomainMutation = useConvexMutation(api.domains.create);
  const deleteDomainMutation = useConvexMutation(api.domains.remove);

  const createDomain = async (domainData: CreateDomainData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Input validation
    if (!domainData.name || domainData.name.trim().length === 0) {
      throw new Error('Domain name is required');
    }

    if (domainData.name.length > 255) {
      throw new Error('Domain name must be less than 255 characters');
    }

    if (!domainData.registrar || domainData.registrar.trim().length === 0) {
      throw new Error('Registrar is required');
    }

    if (domainData.registrar.length > 100) {
      throw new Error('Registrar name must be less than 100 characters');
    }

    if (!domainData.renewal_date) {
      throw new Error('Renewal date is required');
    }

    if (domainData.renewal_cost < 0) {
      throw new Error('Renewal cost cannot be negative');
    }

    if (domainData.renewal_cost > 999999.99) {
      throw new Error('Renewal cost is too high');
    }

    try {
      await createDomainMutation({
        userId: user.id,
        ...domainData,
      });
      toast({
        title: "Domain Added",
        description: "Domain has been successfully added.",
      });
    } catch (error: any) {
      console.error('Create domain error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create domain. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteDomain = async (domainId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await deleteDomainMutation({ id: domainId, userId: user.id });
      toast({
        title: "Domain Deleted",
        description: "Domain has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Delete domain error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete domain. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    domains,
    isLoading,
    error,
    createDomain,
    deleteDomain,
    isCreating: false,
    isDeleting: false,
  };
};
