
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Building2, Plus, Check, X, Trash2 } from 'lucide-react';
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Domain {
  id: string;
  name: string;
  registrar: string;
  renewal_date: string;
  platform: 'Webflow' | 'Shopify';
  renewal_cost: number;
  client_managed: boolean;
  notes?: string;
  client_id: string;
  client_company?: string;
  created_at: string;
  updated_at: string;
}

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'Webflow': return 'bg-blue-100 text-blue-800';
    case 'Shopify': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Domains = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('renewal_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newRows, setNewRows] = useState<Array<Partial<Domain & { tempId: string }>>>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const domainsData = useConvexQuery(
    api.domains.listByUser,
    user ? { userId: user.id } : undefined
  ) as Domain[] | undefined;
  const domains = domainsData ?? [];
  const isLoading = domainsData === undefined;

  const clientsData = useConvexQuery(
    api.clients.list,
    user ? { userId: user.id } : undefined
  ) as Array<{ id: string; company: string }> | undefined;
  const clients = clientsData ?? [];

  const deleteDomainMutation = useConvexMutation(api.domains.remove);
  const updateDomainMutation = useConvexMutation(api.domains.update);
  const createDomainMutation = useConvexMutation(api.domains.create);

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.registrar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.client_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDomains = [...filteredDomains].sort((a, b) => {
    let aValue = a[sortBy as keyof Domain];
    let bValue = b[sortBy as keyof Domain];

    if (sortBy === 'client_company') {
      aValue = a.client_company || '';
      bValue = b.client_company || '';
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const handleFieldUpdate = (id: string, field: string, value: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to update domains.",
        variant: "destructive",
      });
      return;
    }

    let processedValue: any = value;
    if (field === 'renewal_cost') {
      processedValue = parseFloat(value) || 0;
    } else if (field === 'client_managed') {
      processedValue = Boolean(value);
    }

    updateDomainMutation({
      id,
      userId: user.id,
      updates: { [field]: processedValue } as any,
    }).catch((error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update domain",
        variant: "destructive",
      });
    });
  };

  const addNewRow = () => {
    const tempId = `temp-${Date.now()}`;
    setNewRows(prev => [{
      tempId,
      name: '',
      registrar: '',
      renewal_date: new Date().toISOString().split('T')[0],
      platform: 'Webflow' as const,
      renewal_cost: 0,
      client_managed: false,
      notes: '',
      client_id: clients.length > 0 ? clients[0].id : '',
    }, ...prev]);
  };

  const handleNewRowUpdate = (tempId: string, field: string, value: any) => {
    setNewRows(prev => prev.map(row => 
      row.tempId === tempId 
        ? { ...row, [field]: value }
        : row
    ));
  };

  const saveNewRow = async (tempId: string) => {
    const newRow = newRows.find(row => row.tempId === tempId);
    if (!newRow || !newRow.name || !newRow.registrar || !newRow.client_id) {
      toast({
        title: "Error",
        description: "Please fill in domain name, registrar, and select a client",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to add domains.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDomainMutation({
        userId: user.id,
        name: newRow.name,
        registrar: newRow.registrar,
        renewal_date: newRow.renewal_date || new Date().toISOString().split('T')[0],
        platform: (newRow.platform as Domain['platform']) || 'Webflow',
        renewal_cost: Number(newRow.renewal_cost) || 0,
        client_managed: Boolean(newRow.client_managed),
        notes: newRow.notes || undefined,
        client_id: newRow.client_id,
      });
      toast({
        title: "Success",
        description: "Domain created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create domain",
        variant: "destructive",
      });
    }

    setNewRows(prev => prev.filter(row => row.tempId !== tempId));
  };

  const removeNewRow = (tempId: string) => {
    setNewRows(prev => prev.filter(row => row.tempId !== tempId));
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Domain Management</h1>
          <p className="text-gray-600 mt-2">Manage all your client domains in one place</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Domains
          </CardTitle>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search domains, clients, or registrars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Domain Name</SelectItem>
                <SelectItem value="renewal_date">Expiry Date</SelectItem>
                <SelectItem value="client_company">Client</SelectItem>
                <SelectItem value="registrar">Registrar</SelectItem>
                <SelectItem value="renewal_cost">Renewal Cost</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            <Button
              onClick={addNewRow}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table className="min-w-[1700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[280px]">Domain</TableHead>
                      <TableHead className="w-[280px]">Client</TableHead>
                      <TableHead className="w-[200px]">Registrar</TableHead>
                      <TableHead className="w-[300px]">Expiry & Cost</TableHead>
                      <TableHead className="w-[280px]">Platform</TableHead>
                      <TableHead className="w-[300px]">Notes</TableHead>
                      <TableHead className="w-[20px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {newRows.map((newRow) => (
                    <TableRow key={newRow.tempId} className="bg-blue-50/50">
                      <TableCell className="w-[280px]">
                        <Input
                          value={newRow.name || ''}
                          onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'name', e.target.value)}
                          className="border-dashed border-2 border-blue-300 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-blue-500 text-sm"
                          placeholder="Enter domain name..."
                        />
                      </TableCell>
                       <TableCell className="w-[280px]">
                        <Select 
                          value={newRow.client_id || ''} 
                          onValueChange={(value) => handleNewRowUpdate(newRow.tempId!, 'client_id', value)}
                        >
                          <SelectTrigger className="border-dashed border-2 border-blue-300 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-blue-500">
                            <SelectValue placeholder="Select client..." />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <Input
                          value={newRow.registrar || ''}
                          onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'registrar', e.target.value)}
                          className="border-dashed border-2 border-blue-300 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-blue-500 text-sm"
                          placeholder="Enter registrar..."
                        />
                      </TableCell>
                       <TableCell className="w-[300px]">
                         <div className="space-y-1">
                           <Input
                             type="date"
                             value={newRow.renewal_date || ''}
                             onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'renewal_date', e.target.value)}
                             className="border-dashed border-2 border-blue-300 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-blue-500 text-sm"
                           />
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-gray-500">$</span>
                             <Input
                               type="number"
                               step="0.01"
                               value={newRow.renewal_cost || ''}
                               onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'renewal_cost', e.target.value)}
                               className="border-dashed border-2 border-blue-300 p-1 h-auto bg-white focus-visible:ring-1 focus-visible:ring-blue-500 text-xs"
                               placeholder="0.00"
                             />
                           </div>
                         </div>
                        </TableCell>
                        <TableCell className="w-[280px]">
                          <div className="space-y-2">
                            <Select 
                              value={newRow.platform || 'Webflow'} 
                              onValueChange={(value) => handleNewRowUpdate(newRow.tempId!, 'platform', value)}
                            >
                              <SelectTrigger className="border-dashed border-2 border-blue-300 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-blue-500">
                                <Badge className={getPlatformColor(newRow.platform || 'Webflow')}>
                                  {newRow.platform || 'Webflow'}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Webflow">Webflow</SelectItem>
                                <SelectItem value="Shopify">Shopify</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={newRow.client_managed || false}
                                onCheckedChange={(checked) => handleNewRowUpdate(newRow.tempId!, 'client_managed', checked)}
                              />
                              <span className="text-xs text-gray-600">Client Managed</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[300px]">
                          <textarea
                            value={newRow.notes || ''}
                            onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'notes', e.target.value)}
                            className="border-dashed border-2 border-blue-300 p-2 h-20 w-full bg-white focus-visible:ring-1 focus-visible:ring-blue-500 text-sm resize-none"
                            placeholder="Add notes..."
                          />
                        </TableCell>
                        <TableCell className="w-[20px]">
                        <div className="flex gap-2">
                          <div title="Save domain">
                            <Check 
                              className="h-4 w-4 text-green-600 cursor-pointer hover:text-green-700" 
                              onClick={() => saveNewRow(newRow.tempId!)}
                            />
                          </div>
                          <div title="Cancel">
                            <X 
                              className="h-4 w-4 text-red-600 cursor-pointer hover:text-red-700" 
                              onClick={() => removeNewRow(newRow.tempId!)}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedDomains.map((domain) => (
                    <TableRow key={domain.id}>
                       <TableCell className="w-[280px]">
                        <Input
                          value={domain.name}
                          onChange={(e) => handleFieldUpdate(domain.id, 'name', e.target.value)}
                          className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary text-sm"
                          placeholder="Enter domain name..."
                        />
                      </TableCell>
                       <TableCell className="w-[280px]">
                        <Select 
                          value={domain.client_id} 
                          onValueChange={(value) => handleFieldUpdate(domain.id, 'client_id', value)}
                        >
                          <SelectTrigger className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary">
                            <SelectValue>
                              {domain.client_company}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                       <TableCell className="w-[200px]">
                        <Input
                          value={domain.registrar}
                          onChange={(e) => handleFieldUpdate(domain.id, 'registrar', e.target.value)}
                          className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary text-sm"
                          placeholder="Enter registrar..."
                        />
                      </TableCell>
                       <TableCell className="w-[300px]">
                         <div className="space-y-1">
                           <Input
                             type="date"
                             value={domain.renewal_date}
                             onChange={(e) => handleFieldUpdate(domain.id, 'renewal_date', e.target.value)}
                             className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary text-sm"
                           />
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-gray-500">$</span>
                             <Input
                               type="number"
                               step="0.01"
                               value={domain.renewal_cost}
                               onChange={(e) => handleFieldUpdate(domain.id, 'renewal_cost', e.target.value)}
                               className="border-none p-1 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary text-xs"
                               placeholder="0.00"
                             />
                           </div>
                         </div>
                       </TableCell>
                          <TableCell className="w-[280px]">
                          <div className="space-y-2">
                            <Select 
                              value={domain.platform} 
                              onValueChange={(value) => handleFieldUpdate(domain.id, 'platform', value)}
                            >
                              <SelectTrigger className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary">
                                <Badge className={getPlatformColor(domain.platform)}>
                                  {domain.platform}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Webflow">Webflow</SelectItem>
                                <SelectItem value="Shopify">Shopify</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={domain.client_managed}
                                onCheckedChange={(checked) => handleFieldUpdate(domain.id, 'client_managed', checked)}
                              />
                              <span className="text-xs text-gray-600">Client Managed</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[300px]">
                          <textarea
                            value={domain.notes || ''}
                            onChange={(e) => handleFieldUpdate(domain.id, 'notes', e.target.value)}
                            className="border-none p-2 h-20 w-full bg-transparent focus-visible:ring-1 focus-visible:ring-primary text-sm resize-none"
                            placeholder="Add notes..."
                          />
                        </TableCell>
                        <TableCell className="w-[20px]">
                        <div title="Delete domain">
                          <Trash2 
                            className="h-4 w-4 text-red-600 cursor-pointer hover:text-red-700" 
                            onClick={async () => {
                              if (!user) {
                                toast({
                                  title: "Error",
                                  description: "You must be signed in to delete domains.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              try {
                                await deleteDomainMutation({ userId: user.id, id: domain.id });
                                toast({
                                  title: "Success",
                                  description: "Domain deleted successfully",
                                });
                              } catch (error: any) {
                                toast({
                                  title: "Error",
                                  description: error?.message || "Failed to delete domain",
                                  variant: "destructive",
                                });
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {sortedDomains.length === 0 && newRows.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No domains found matching your search.' : 'No domains registered yet. Click "Add New Line" to get started.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Domains;
