import React from 'react';
import { ClientOverview } from '@/components/ClientOverview';
import { AddClientDialog } from '@/components/AddClientDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Calendar } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';

const Clients = () => {
  const { clients, isLoading, createClient } = useClients();
  const { projects, isLoading: projectsLoading } = useProjects();

  const handleAddClient = (newClient: { company: string; phone: string; industry: string }) => {
    createClient(newClient);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeClients = clients.filter(client => client.status === 'active').length;
  
  // Calculate totals from actual projects data
  const totalProjects = projects.length;
  const totalProjectValue = projects.reduce((sum, project) => sum + (Number(project.budget) || 0), 0);
  
  // Also keep the client-level total_value for comparison
  const clientTotalValue = clients.reduce((sum, client) => sum + client.total_value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships and projects</p>
        </div>
        <AddClientDialog onAddClient={handleAddClient} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                Client Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOverview clients={clients} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
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
                <span className="font-semibold">{projectsLoading ? 'Loading...' : totalProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Project Value</span>
                <span className="font-semibold">
                  {projectsLoading ? 'Loading...' : `$${totalProjectValue.toLocaleString()}`}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full flex items-center justify-start gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Users size={16} className="text-blue-600" />
                View All Projects
              </button>
              <button className="w-full flex items-center justify-start gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <DollarSign size={16} className="text-green-600" />
                Generate Invoice
              </button>
              <button className="w-full flex items-center justify-start gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Calendar size={16} className="text-purple-600" />
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
