import React, { useState, useMemo } from 'react';
import { ClientTable } from '@/components/ClientTable';
import { AddClientDialog } from '@/components/AddClientDialog';
import { ShadowBox } from '@/components/ui/shadow-box';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useClients } from '@/hooks/useClients';

const Clients = () => {
  const { clients, isLoading } = useClients();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    
    const query = searchQuery.toLowerCase();
    return clients.filter(client => 
      client.company.toLowerCase().includes(query) ||
      client.description?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships and projects</p>
        </div>
        <AddClientDialog />
      </div>

      <ShadowBox className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, description, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ClientTable clients={filteredClients} />
        
        {filteredClients.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        )}
      </ShadowBox>
    </div>
  );
};

export default Clients;
