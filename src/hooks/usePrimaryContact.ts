import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PrimaryContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export const usePrimaryContact = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['primary-contact', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, phone')
        .eq('client_id', clientId)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching primary contact:', error);
        return null;
      }

      return data as PrimaryContact | null;
    },
    enabled: !!clientId,
  });
};