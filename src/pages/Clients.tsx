
import React from 'react';
import { ClientOverview } from '@/components/ClientOverview';
import { AddClientDialog } from '@/components/AddClientDialog';
import { ShadowBox } from '@/components/ui/shadow-box';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Calendar } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useClientMutations } from '@/hooks/useClientMutations';
import { useProjects } from '@/hooks/useProjects';

const Clients = () => {
  const { clients, isLoading } = useClients();
  const { createClient } = useClientMutations();
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
          <ShadowBox className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Client Overview</h2>
            </div>
            <ClientOverview clients={clients} />
          </ShadowBox>
        </div>

        <div className="space-y-6">
          <ShadowBox className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Client Stats</h2>
            <div className="space-y-4">
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
            </div>
          </ShadowBox>

          <ShadowBox className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
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
            </div>
          </ShadowBox>
        </div>
      </div>
    </div>
  );
};

export default Clients;
