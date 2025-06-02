
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmailLog {
  id: string;
  invoice_id: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  status: string;
  error_message?: string;
  created_at: string;
}

export const useEmailLogs = (invoiceId: string) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['email-logs', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailLog[];
    },
    enabled: !!invoiceId,
  });

  return {
    logs,
    isLoading,
  };
};
