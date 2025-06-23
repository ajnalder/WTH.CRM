
import { useState, useEffect } from 'react';
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

  // Handle OAuth callback on component mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('xero_code');
      const state = urlParams.get('xero_state');
      const error = urlParams.get('xero_error');

      if (error) {
        toast({
          title: "Error",
          description: `Xero connection failed: ${error}`,
          variant: "destructive",
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && state) {
        setIsConnecting(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('Not authenticated');

          const { data, error } = await supabase.functions.invoke('xero-oauth', {
            body: { 
              action: 'exchange_code',
              code,
              state 
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (error) throw error;

          toast({
            title: "Success",
            description: `Connected to Xero: ${data.tenant_name}`,
          });

          // Refresh connection status
          await checkConnectionStatus();
        } catch (error) {
          console.error('Error exchanging code:', error);
          toast({
            title: "Error",
            description: "Failed to complete Xero connection",
            variant: "destructive",
          });
        } finally {
          setIsConnecting(false);
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, [toast]);

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

      // Redirect to Xero OAuth page
      window.location.href = data.auth_url;

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
