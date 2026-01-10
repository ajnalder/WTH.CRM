import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAction } from 'convex/react';
import { api } from '@/integrations/convex/api';

export const useXeroIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    tenantName?: string;
  }>({ isConnected: false });
  const { toast } = useToast();
  const { user } = useAuth();

  const getAuthUrl = useAction(api.xero.getAuthUrl);
  const exchangeCode = useAction(api.xero.exchangeCode);
  const getStatus = useAction(api.xero.getConnectionStatus);
  const fetchAccountsAction = useAction(api.xero.fetchAccounts);
  const fetchContactsAction = useAction(api.xero.fetchContacts);
  const linkContactAction = useAction(api.xero.linkContact);
  const unlinkContactAction = useAction(api.xero.unlinkContact);
  const syncInvoiceAction = useAction(api.xero.syncInvoice);

  const checkConnectionStatus = useCallback(async () => {
    try {
      if (!user) return;
      const data = await getStatus({ userId: user.id });
      setConnectionStatus({
        isConnected: data.isConnected,
        tenantName: data.tenantName || undefined,
      });
      return data;
    } catch (error) {
      console.error('Error checking Xero connection:', error);
      return { isConnected: false };
    }
  }, [getStatus, user]);

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
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && state) {
        setIsConnecting(true);
        try {
          if (!user) throw new Error('Not authenticated');
          const data = await exchangeCode({ code, state, userId: user.id });
          toast({
            title: "Success",
            description: `Connected to Xero: ${data?.tenantName || 'Xero tenant'}`,
          });
          // Update local state directly instead of re-fetching to avoid premature refresh
          setConnectionStatus({
            isConnected: true,
            tenantName: data?.tenantName || undefined,
          });
        } catch (err: any) {
          console.error('Error exchanging code:', err);
          toast({
            title: "Error",
            description: err?.message || "Failed to complete Xero connection",
            variant: "destructive",
          });
        } finally {
          setIsConnecting(false);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, [toast, exchangeCode, user, checkConnectionStatus]);

  const connectToXero = async () => {
    setIsConnecting(true);
    try {
      if (!user) throw new Error('Not authenticated');
      const data = await getAuthUrl({ userId: user.id, frontendOrigin: window.location.origin });
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error('Error connecting to Xero:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to connect to Xero",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const syncInvoiceToXero = async (invoiceId: string) => {
    setIsSyncing(true);
    try {
      if (!user) throw new Error('Not authenticated');
      const data = await syncInvoiceAction({ userId: user.id, invoiceId });
      toast({
        title: "Success",
        description: data?.message || "Invoice synced to Xero successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error syncing invoice to Xero:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to sync invoice to Xero",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchAccounts = async () => {
    if (!user) throw new Error('Not authenticated');
    return fetchAccountsAction({ userId: user.id });
  };

  const fetchContacts = async () => {
    if (!user) throw new Error('Not authenticated');
    return fetchContactsAction({ userId: user.id });
  };

  const linkContact = async (clientId: string, xeroContactId: string) => {
    if (!user) throw new Error('Not authenticated');
    return linkContactAction({ userId: user.id, clientId, xeroContactId });
  };

  const unlinkContact = async (clientId: string) => {
    if (!user) throw new Error('Not authenticated');
    return unlinkContactAction({ userId: user.id, clientId });
  };

  return {
    connectionStatus,
    isConnecting,
    isSyncing,
    connectToXero,
    syncInvoiceToXero,
    checkConnectionStatus,
    fetchAccounts,
    fetchContacts,
    linkContact,
    unlinkContact,
  };
};
