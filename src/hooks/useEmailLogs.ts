import { useQuery as useConvexQuery } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const logsData = useConvexQuery(
    api.emailLogs.listByInvoice,
    user && invoiceId ? { invoiceId, userId: user.id } : undefined
  ) as EmailLog[] | undefined;

  return {
    logs: logsData ?? [],
    isLoading: logsData === undefined,
  };
};
