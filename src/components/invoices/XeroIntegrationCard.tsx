
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, CheckCircle, AlertCircle, RefreshCw, Users, Link, Unlink } from 'lucide-react';
import { useXeroIntegration } from '@/hooks/useXeroIntegration';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface XeroAccount {
  code: string;
  name: string;
  type: string;
}

interface XeroContact {
  contact_id: string;
  name: string;
  email: string;
  phone: string;
}

export const XeroIntegrationCard: React.FC = () => {
  const { 
    connectionStatus, 
    isConnecting, 
    connectToXero, 
    checkConnectionStatus 
  } = useXeroIntegration();
  
  const { settings, updateSettings } = useCompanySettings();
  const { clients } = useClients();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [accountCode, setAccountCode] = useState('');
  const [accounts, setAccounts] = useState<XeroAccount[]>([]);
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);
  
  const [xeroContacts, setXeroContacts] = useState<XeroContact[]>([]);
  const [isFetchingContacts, setIsFetchingContacts] = useState(false);
  const [linkingClientId, setLinkingClientId] = useState<string | null>(null);

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

  const fetchContacts = async () => {
    setIsFetchingContacts(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('xero-sync', {
        body: { action: 'fetch_contacts' }
      });

      if (response.error) throw response.error;
      
      if (response.data?.contacts) {
        setXeroContacts(response.data.contacts);
        toast({
          title: "Contacts loaded",
          description: `Found ${response.data.contacts.length} Xero contacts`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch Xero contacts",
        variant: "destructive",
      });
    } finally {
      setIsFetchingContacts(false);
    }
  };

  const linkContact = async (clientId: string, xeroContactId: string) => {
    setLinkingClientId(clientId);
    try {
      const response = await supabase.functions.invoke('xero-sync', {
        body: { action: 'link_contact', client_id: clientId, xero_contact_id: xeroContactId }
      });

      if (response.error) throw response.error;

      toast({
        title: "Contact linked",
        description: "Xero contact linked to client successfully",
      });
      
      // Refresh clients data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error: any) {
      console.error('Error linking contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to link contact",
        variant: "destructive",
      });
    } finally {
      setLinkingClientId(null);
    }
  };

  const unlinkContact = async (clientId: string) => {
    setLinkingClientId(clientId);
    try {
      const response = await supabase.functions.invoke('xero-sync', {
        body: { action: 'unlink_contact', client_id: clientId }
      });

      if (response.error) throw response.error;

      toast({
        title: "Contact unlinked",
        description: "Xero contact unlinked from client",
      });
      
      // Refresh clients data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error: any) {
      console.error('Error unlinking contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unlink contact",
        variant: "destructive",
      });
    } finally {
      setLinkingClientId(null);
    }
  };

  const handleAccountSelect = (code: string) => {
    setAccountCode(code);
    updateSettings({ xero_account_code: code });
  };

  // Get linked Xero contact name for a client
  const getLinkedContactName = (xeroContactId: string | null) => {
    if (!xeroContactId) return null;
    const contact = xeroContacts.find(c => c.contact_id === xeroContactId);
    return contact?.name || 'Linked (name not loaded)';
  };

  // Get available (unlinked) Xero contacts for dropdown
  const getAvailableContacts = () => {
    const linkedIds = new Set(clients?.filter(c => c.xero_contact_id).map(c => c.xero_contact_id));
    return xeroContacts.filter(c => !linkedIds.has(c.contact_id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink size={20} />
          Xero Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
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
              <p>✓ Contacts will be automatically created or linked</p>
              <p>✓ Invoice data will be kept in sync</p>
            </div>
            
            {/* Sales Account Code */}
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

            {/* Xero Contacts Linking */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users size={16} />
                    Link Xero Contacts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Link existing Xero contacts to your CRM clients
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchContacts}
                  disabled={isFetchingContacts}
                >
                  <RefreshCw size={14} className={`mr-2 ${isFetchingContacts ? 'animate-spin' : ''}`} />
                  {xeroContacts.length > 0 ? 'Refresh' : 'Fetch Contacts'}
                </Button>
              </div>

              {xeroContacts.length > 0 && clients && clients.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {clients.map(client => {
                    const isLinked = !!client.xero_contact_id;
                    const linkedName = getLinkedContactName(client.xero_contact_id);
                    const availableContacts = getAvailableContacts();
                    const isLinking = linkingClientId === client.id;

                    return (
                      <div key={client.id} className="flex items-center gap-3 p-2 rounded-md border bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{client.company}</p>
                          {isLinked && linkedName && (
                            <p className="text-xs text-green-600">→ {linkedName}</p>
                          )}
                        </div>
                        
                        {isLinked ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => unlinkContact(client.id)}
                            disabled={isLinking}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Unlink size={14} className="mr-1" />
                            Unlink
                          </Button>
                        ) : (
                          <Select
                            value=""
                            onValueChange={(xeroContactId) => linkContact(client.id, xeroContactId)}
                            disabled={isLinking || availableContacts.length === 0}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder={
                                availableContacts.length === 0 
                                  ? "No contacts available" 
                                  : "Link to Xero contact"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {availableContacts.map((contact) => (
                                <SelectItem key={contact.contact_id} value={contact.contact_id}>
                                  {contact.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {xeroContacts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Click "Fetch Contacts" to load your Xero contacts
                </p>
              )}
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
