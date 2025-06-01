
import React from 'react';
import { ClientOverview } from '@/components/ClientOverview';
import { AddClientDialog } from '@/components/AddClientDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Calendar } from 'lucide-react';
import { useClients } from '@/hooks/useClients';

const Clients = () => {
  const { clients, isLoading, createClient } = useClients();

  const handleAddClient = (newClient: { name: string; email: string; phone: string; company: string; industry: string }) => {
    createClient(newClient);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const activeClients = clients.filter(client => client.status === 'active').length;
  const totalValue = clients.reduce((sum, client) => sum + client.total_value, 0);
  const totalProjects = clients.reduce((sum, client) => sum + client.projects_count, 0);

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
              <ClientOverview clients={clients} />
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
    </div>
  );
};

export default Clients;
