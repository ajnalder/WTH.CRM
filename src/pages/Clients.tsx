
import React, { useState } from 'react';
import { ClientOverview } from '@/components/ClientOverview';
import { AddClientDialog } from '@/components/AddClientDialog';
import { ClientDetails } from '@/components/ClientDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Calendar } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  status: string;
  projectsCount: number;
  totalValue: number;
  joinedDate: string;
  avatar: string;
  gradient: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: 'TechCorp Inc.',
      email: 'contact@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      industry: 'Technology',
      status: 'active',
      projectsCount: 3,
      totalValue: 125000,
      joinedDate: '2024-01-15',
      avatar: 'TC',
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      id: 2,
      name: 'Global Solutions Ltd.',
      email: 'info@globalsolutions.com',
      phone: '+1 (555) 987-6543',
      company: 'Global Solutions Ltd.',
      industry: 'Consulting',
      status: 'active',
      projectsCount: 2,
      totalValue: 85000,
      joinedDate: '2024-02-20',
      avatar: 'GS',
      gradient: 'from-green-400 to-green-600',
    },
    {
      id: 3,
      name: 'StartupXYZ',
      email: 'hello@startupxyz.com',
      phone: '+1 (555) 456-7890',
      company: 'StartupXYZ',
      industry: 'E-commerce',
      status: 'pending',
      projectsCount: 1,
      totalValue: 45000,
      joinedDate: '2024-03-10',
      avatar: 'SX',
      gradient: 'from-purple-400 to-purple-600',
    },
    {
      id: 4,
      name: 'MegaCorp Enterprises',
      email: 'partnerships@megacorp.com',
      phone: '+1 (555) 321-0987',
      company: 'MegaCorp Enterprises',
      industry: 'Manufacturing',
      status: 'inactive',
      projectsCount: 0,
      totalValue: 0,
      joinedDate: '2023-11-05',
      avatar: 'MC',
      gradient: 'from-red-400 to-red-600',
    },
  ]);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleAddClient = (newClient: { name: string; email: string; phone: string; company: string; industry: string }) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-red-400 to-red-600',
      'from-yellow-400 to-yellow-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
    ];

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const client = {
      id: clients.length + 1,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      company: newClient.company,
      industry: newClient.industry,
      status: 'pending',
      projectsCount: 0,
      totalValue: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: getInitials(newClient.company || newClient.name),
      gradient: gradients[clients.length % gradients.length],
    };

    setClients([...clients, client]);
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
    setSelectedClient(updatedClient);
  };

  const activeClients = clients.filter(client => client.status === 'active').length;
  const totalValue = clients.reduce((sum, client) => sum + client.totalValue, 0);
  const totalProjects = clients.reduce((sum, client) => sum + client.projectsCount, 0);

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships and projects</p>
        </div>
        <AddClientDialog onAddClient={handleAddClient} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 size={20} />
                Client Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOverview clients={clients} onClientClick={handleClientClick} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Clients</span>
                <span className="font-semibold">{clients.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Clients</span>
                <span className="font-semibold text-green-600">{activeClients}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Projects</span>
                <span className="font-semibold">{totalProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Value</span>
                <span className="font-semibold">${totalValue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full flex items-center justify-start gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Users size={16} />
                View All Projects
              </button>
              <button className="w-full flex items-center justify-start gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <DollarSign size={16} />
                Generate Invoice
              </button>
              <button className="w-full flex items-center justify-start gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Calendar size={16} />
                Schedule Meeting
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ClientDetails
        client={selectedClient}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUpdateClient={handleUpdateClient}
      />
    </div>
  );
};

export default Clients;
