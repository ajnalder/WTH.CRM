
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useXeroIntegration } from '@/hooks/useXeroIntegration';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface XeroAccount {
  code: string;
  name: string;
  type: string;
}

export const XeroIntegrationCard: React.FC = () => {
  const { 
    connectionStatus, 
    isConnecting, 
    connectToXero, 
    checkConnectionStatus 
  } = useXeroIntegration();
  
  const { settings, updateSettings } = useCompanySettings();
  const { toast } = useToast();
  const [accountCode, setAccountCode] = useState('');
  const [accounts, setAccounts] = useState<XeroAccount[]>([]);
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  useEffect(() => {
    if (settings?.xero_account_code) {
      setAccountCode(settings.xero_account_code);
    }
  }, [settings]);

  const fetchAccounts = async () => {
    setIsFetchingAccounts(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('xero-sync', {
        body: { action: 'fetch_accounts' }
      });

      if (response.error) throw response.error;
      
      if (response.data?.accounts) {
        setAccounts(response.data.accounts);
        toast({
          title: "Accounts loaded",
          description: `Found ${response.data.accounts.length} sales accounts`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch Xero accounts",
        variant: "destructive",
      });
    } finally {
      setIsFetchingAccounts(false);
    }
  };

  const handleAccountSelect = (code: string) => {
    setAccountCode(code);
    updateSettings({ xero_account_code: code });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink size={20} />
          Xero Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Connection Status</p>
            <div className="flex items-center gap-2 mt-1">
              {connectionStatus.isConnected ? (
                <>
                  <CheckCircle size={16} className="text-green-600" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                  {connectionStatus.tenantName && (
                    <span className="text-sm text-muted-foreground">
                      to {connectionStatus.tenantName}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-orange-600" />
                  <Badge variant="outline" className="border-orange-200 text-orange-800">
                    Not Connected
                  </Badge>
                </>
              )}
            </div>
          </div>
          
          {!connectionStatus.isConnected && (
            <Button
              onClick={connectToXero}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? 'Connecting...' : 'Connect to Xero'}
            </Button>
          )}
        </div>

        {connectionStatus.isConnected && (
          <>
            <div className="text-sm text-muted-foreground">
              <p>✓ Your invoices can now be synced to Xero</p>
              <p>✓ Contacts will be automatically created</p>
              <p>✓ Invoice data will be kept in sync</p>
            </div>
            
            <div className="pt-2 border-t">
              <Label className="text-sm font-medium">
                Sales Account Code
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                The Xero account for invoice line items
              </p>
              <div className="flex gap-2">
                {accounts.length > 0 ? (
                  <Select value={accountCode} onValueChange={handleAccountSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.code} value={acc.code}>
                          {acc.code} - {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex-1 text-sm text-muted-foreground border rounded-md px-3 py-2">
                    {accountCode || 'No account selected'}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchAccounts}
                  disabled={isFetchingAccounts}
                  title="Fetch accounts from Xero"
                >
                  <RefreshCw size={16} className={isFetchingAccounts ? 'animate-spin' : ''} />
                </Button>
              </div>
            </div>
          </>
        )}

        {!connectionStatus.isConnected && (
          <div className="text-sm text-muted-foreground">
            <p>Connect to Xero to:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Automatically sync invoices</li>
              <li>Keep contacts synchronized</li>
              <li>Streamline your accounting workflow</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
