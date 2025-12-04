
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useXeroIntegration } from '@/hooks/useXeroIntegration';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export const XeroIntegrationCard: React.FC = () => {
  const { 
    connectionStatus, 
    isConnecting, 
    connectToXero, 
    checkConnectionStatus 
  } = useXeroIntegration();
  
  const { settings, updateSettings } = useCompanySettings();
  const [accountCode, setAccountCode] = useState('');

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  useEffect(() => {
    if (settings?.xero_account_code) {
      setAccountCode(settings.xero_account_code);
    }
  }, [settings]);

  const handleAccountCodeSave = () => {
    if (accountCode !== settings?.xero_account_code) {
      updateSettings({ xero_account_code: accountCode });
    }
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
              <Label htmlFor="xero-account-code" className="text-sm font-medium">
                Sales Account Code
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                The Xero account code for invoice line items (e.g., 200, 400)
              </p>
              <div className="flex gap-2">
                <Input
                  id="xero-account-code"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  placeholder="200"
                  className="w-32"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAccountCodeSave}
                  disabled={accountCode === settings?.xero_account_code}
                >
                  Save
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
