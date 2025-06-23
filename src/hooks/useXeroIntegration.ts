
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useXeroIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    tenantName?: string;
  }>({ isConnected: false });
  const { toast } = useToast();

  const checkConnectionStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('xero-oauth', {
        body: { action: 'get_connection_status' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setConnectionStatus({
        isConnected: data.is_connected,
        tenantName: data.tenant_name
      });

      return data;
    } catch (error) {
      console.error('Error checking Xero connection:', error);
      return { isConnected: false };
    }
  };

  const connectToXero = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('xero-oauth', {
        body: { action: 'get_auth_url' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Xero OAuth in popup
      const popup = window.open(data.auth_url, 'xero-oauth', 'width=600,height=700');
      
      // Listen for popup close or message
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          checkConnectionStatus();
          setIsConnecting(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Error connecting to Xero:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Xero",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const syncInvoiceToXero = async (invoiceId: string) => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('xero-sync', {
        body: { 
          action: 'sync_invoice',
          invoice_id: invoiceId 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message || "Invoice synced to Xero successfully",
      });

      return data;
    } catch (error) {
      console.error('Error syncing invoice to Xero:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sync invoice to Xero",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    connectionStatus,
    isConnecting,
    isSyncing,
    connectToXero,
    syncInvoiceToXero,
    checkConnectionStatus
  };
};
