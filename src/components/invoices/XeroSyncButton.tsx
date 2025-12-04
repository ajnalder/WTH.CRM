
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useXeroIntegration } from '@/hooks/useXeroIntegration';

interface XeroSyncButtonProps {
  invoiceId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const XeroSyncButton: React.FC<XeroSyncButtonProps> = ({
  invoiceId,
  variant = 'outline',
  size = 'sm'
}) => {
  const { connectionStatus, isSyncing, syncInvoiceToXero, checkConnectionStatus } = useXeroIntegration();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  if (!connectionStatus.isConnected) {
    return null;
  }

  const handleSync = async () => {
    try {
      await syncInvoiceToXero(invoiceId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isSyncing}
      className="gap-2"
    >
      {isSyncing ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ExternalLink size={16} />
      )}
      {isSyncing ? 'Syncing...' : 'Sync to Xero'}
    </Button>
  );
};
