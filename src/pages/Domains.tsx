
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Building2, Plus, Check, X, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Domain {
  id: string;
  name: string;
  registrar: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'pending';
  renewal_cost: number;
  client_managed: boolean;
  client_id: string;
  clients?: {
    company: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Domains = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('expiry_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newRows, setNewRows] = useState<Array<Partial<Domain & { tempId: string }>>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['all-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domains')
        .select(`
          *,
          clients!inner (
            company
          )
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      return data as Domain[];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company')
        .order('company');

      if (error) throw error;
      return data;
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-domains'] });
      toast({
        title: "Success",
        description: "Domain deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete domain",
        variant: "destructive",
      });
    },
  });

  const updateDomainMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: any }) => {
      const { error } = await supabase
        .from('domains')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-domains'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update domain",
        variant: "destructive",
      });
    },
  });

  const createDomainMutation = useMutation({
    mutationFn: async (domainData: Omit<Domain, 'id' | 'clients'> & { client_id: string }) => {
      const { data, error } = await supabase
        .from('domains')
        .insert([domainData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-domains'] });
      toast({
        title: "Success",
        description: "Domain created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create domain",
        variant: "destructive",
      });
    },
  });

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.registrar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.clients?.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDomains = [...filteredDomains].sort((a, b) => {
    let aValue = a[sortBy as keyof Domain];
    let bValue = b[sortBy as keyof Domain];

    if (sortBy === 'clients.company') {
      aValue = a.clients?.company || '';
      bValue = b.clients?.company || '';
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const handleFieldUpdate = (id: string, field: string, value: any) => {
    let processedValue: any = value;
    if (field === 'renewal_cost') {
      processedValue = parseFloat(value) || 0;
    } else if (field === 'client_managed') {
      processedValue = Boolean(value);
    }

    updateDomainMutation.mutate({
      id,
      field,
      value: processedValue,
    });
  };

  const addNewRow = () => {
    const tempId = `temp-${Date.now()}`;
    setNewRows(prev => [...prev, {
      tempId,
      name: '',
      registrar: '',
      expiry_date: new Date().toISOString().split('T')[0],
      status: 'active' as const,
      renewal_cost: 0,
      client_managed: false,
      client_id: clients.length > 0 ? clients[0].id : '',
    }]);
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

    createDomainMutation.mutate({
      name: newRow.name,
      registrar: newRow.registrar,
      expiry_date: newRow.expiry_date || new Date().toISOString().split('T')[0],
      status: newRow.status || 'active',
      renewal_cost: newRow.renewal_cost || 0,
      client_managed: newRow.client_managed || false,
      client_id: newRow.client_id,
    });

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
                <SelectItem value="expiry_date">Expiry Date</SelectItem>
                <SelectItem value="clients.company">Client</SelectItem>
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
              <Table className="min-w-[1400px]">
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-[350px]">Domain</TableHead>
                     <TableHead className="w-[250px]">Client</TableHead>
                     <TableHead className="w-[200px]">Registrar</TableHead>
                     <TableHead className="w-[220px]">Expiry & Cost</TableHead>
                     <TableHead className="w-[200px]">Status</TableHead>
                     <TableHead className="w-[180px]">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {sortedDomains.map((domain) => (
                    <TableRow key={domain.id}>
                       <TableCell className="w-[350px]">
                        <Input
                          value={domain.name}
                          onChange={(e) => handleFieldUpdate(domain.id, 'name', e.target.value)}
                          className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary text-sm"
                          placeholder="Enter domain name..."
                        />
                      </TableCell>
                       <TableCell className="w-[250px]">
                        <div className="text-sm font-medium">{domain.clients?.company}</div>
                      </TableCell>
                       <TableCell className="w-[200px]">
                        <Input
                          value={domain.registrar}
                          onChange={(e) => handleFieldUpdate(domain.id, 'registrar', e.target.value)}
                          className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary text-sm"
                          placeholder="Enter registrar..."
                        />
                      </TableCell>
                       <TableCell className="w-[220px]">
                        <div className="space-y-1">
                          <Input
                            type="date"
                            value={domain.expiry_date}
                            onChange={(e) => handleFieldUpdate(domain.id, 'expiry_date', e.target.value)}
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
                       <TableCell className="w-[200px]">
                        <div className="space-y-2">
                          <Select 
                            value={domain.status} 
                            onValueChange={(value) => handleFieldUpdate(domain.id, 'status', value)}
                          >
                            <SelectTrigger className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary">
                              <Badge className={getStatusColor(domain.status)}>
                                {domain.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
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
                       <TableCell className="w-[180px]">
                        <div title="Delete domain">
                          <Trash2 
                            className="h-4 w-4 text-red-600 cursor-pointer hover:text-red-700" 
                            onClick={() => deleteDomainMutation.mutate(domain.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {newRows.map((newRow) => (
                    <TableRow key={newRow.tempId} className="bg-blue-50/50">
                      <TableCell className="w-[350px]">
                        <Input
                          value={newRow.name || ''}
                          onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'name', e.target.value)}
                          className="border-dashed border-2 border-blue-300 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-blue-500 text-sm"
                          placeholder="Enter domain name..."
                        />
                      </TableCell>
                       <TableCell className="w-[250px]">
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
                       <TableCell className="w-[220px]">
                        <div className="space-y-1">
                          <Input
                            type="date"
                            value={newRow.expiry_date || ''}
                            onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'expiry_date', e.target.value)}
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
                      <TableCell className="w-[200px]">
                        <div className="space-y-2">
                          <Select 
                            value={newRow.status || 'active'} 
                            onValueChange={(value) => handleNewRowUpdate(newRow.tempId!, 'status', value)}
                          >
                            <SelectTrigger className="border-dashed border-2 border-blue-300 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-blue-500">
                              <Badge className={getStatusColor(newRow.status || 'active')}>
                                {newRow.status || 'active'}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
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
                      <TableCell className="w-[180px]">
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
