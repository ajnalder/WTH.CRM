import { useQuery as useConvexQuery } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';

export interface PrimaryContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export const usePrimaryContact = (clientId: string | undefined) => {
  const { user } = useAuth();

  const result = useConvexQuery(
    api.contacts.list,
    user && clientId ? { clientId, userId: user.id } : undefined
  ) as PrimaryContact[] | undefined;

  const primary = result?.find((c) => c.is_primary) ?? null;

  return {
    data: primary,
    isLoading: result === undefined,
    error: null,
  };
};
