import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Building2, Plus, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
    }]);
  };

  const handleNewRowUpdate = (tempId: string, field: string, value: any) => {
    setNewRows(prev => prev.map(row => 
      row.tempId === tempId 
        ? { ...row, [field]: value }
        : row
    ));
  };

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
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create domain",
        variant: "destructive",
      });
    },
  });

  const saveNewRow = async (tempId: string) => {
    const newRow = newRows.find(row => row.tempId === tempId);
    if (!newRow || !newRow.name || !newRow.registrar) {
      toast({
        title: "Error",
        description: "Please fill in domain name and registrar",
        variant: "destructive",
      });
      return;
    }

    // For now, we'll need a way to select client - let's use the first available client
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (!clients?.length) {
      toast({
        title: "Error",
        description: "No clients available. Please create a client first.",
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
      client_id: clients[0].id,
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
    <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 space-y-6 max-w-none">
      <div className="flex items-center justify-between max-w-none">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Domain Management</h1>
          <p className="text-gray-600 mt-2">Manage all your client domains in one place</p>
        </div>
      </div>

      <Card className="max-w-none">
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Domain</TableHead>
                  <TableHead className="min-w-[200px]">Client</TableHead>
                  <TableHead className="min-w-[150px]">Registrar</TableHead>
                  <TableHead className="min-w-[140px]">Expiry Date</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Renewal Cost</TableHead>
                  <TableHead className="min-w-[130px]">Client Managed</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDomains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">
                      <Input
                        value={domain.name}
                        onChange={(e) => handleFieldUpdate(domain.id, 'name', e.target.value)}
                        className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary min-w-[240px] text-sm"
                        placeholder="Enter domain name..."
                      />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[190px] text-sm font-medium">{domain.clients?.company}</div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={domain.registrar}
                        onChange={(e) => handleFieldUpdate(domain.id, 'registrar', e.target.value)}
                        className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary min-w-[140px] text-sm"
                        placeholder="Enter registrar..."
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={domain.expiry_date}
                        onChange={(e) => handleFieldUpdate(domain.id, 'expiry_date', e.target.value)}
                        className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary min-w-[130px] text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={domain.status} 
                        onValueChange={(value) => handleFieldUpdate(domain.id, 'status', value)}
                      >
                        <SelectTrigger className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary min-w-[90px]">
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
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={domain.renewal_cost}
                        onChange={(e) => handleFieldUpdate(domain.id, 'renewal_cost', e.target.value)}
                        className="border-none p-2 h-auto bg-transparent focus-visible:ring-1 focus-visible:ring-primary min-w-[110px] text-sm"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={domain.client_managed}
                        onCheckedChange={(checked) => handleFieldUpdate(domain.id, 'client_managed', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {domain.client_managed && (
                          <Badge variant="secondary" className="text-xs">
                            Client Managed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {newRows.map((newRow) => (
                  <TableRow key={newRow.tempId} className="bg-blue-50/50">
                    <TableCell className="font-medium">
                      <Input
                        value={newRow.name || ''}
                        onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'name', e.target.value)}
                        className="border-dashed border-2 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-primary min-w-[240px] text-sm"
                        placeholder="Enter domain name..."
                      />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[190px] text-sm text-gray-500 italic">Auto-assigned</div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newRow.registrar || ''}
                        onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'registrar', e.target.value)}
                        className="border-dashed border-2 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-primary min-w-[140px] text-sm"
                        placeholder="Enter registrar..."
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={newRow.expiry_date || ''}
                        onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'expiry_date', e.target.value)}
                        className="border-dashed border-2 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-primary min-w-[130px] text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={newRow.status || 'active'} 
                        onValueChange={(value) => handleNewRowUpdate(newRow.tempId!, 'status', value)}
                      >
                        <SelectTrigger className="border-dashed border-2 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-primary min-w-[90px]">
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
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={newRow.renewal_cost || ''}
                        onChange={(e) => handleNewRowUpdate(newRow.tempId!, 'renewal_cost', e.target.value)}
                        className="border-dashed border-2 p-2 h-auto bg-white focus-visible:ring-1 focus-visible:ring-primary min-w-[110px] text-sm"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={newRow.client_managed || false}
                        onCheckedChange={(checked) => handleNewRowUpdate(newRow.tempId!, 'client_managed', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => saveNewRow(newRow.tempId!)}
                          disabled={!newRow.name || !newRow.registrar}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeNewRow(newRow.tempId!)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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