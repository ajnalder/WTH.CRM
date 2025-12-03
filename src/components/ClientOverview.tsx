
import React from 'react';
import { Building2, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@/hooks/useClients';
import { useContacts } from '@/hooks/useContacts';
import { useProjects } from '@/hooks/useProjects';

interface ClientOverviewProps {
  clients: Client[];
  onClientClick?: (client: Client) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-400';
    case 'pending':
      return 'bg-yellow-400';
    case 'inactive':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'pending':
      return 'Pending';
    case 'inactive':
      return 'Inactive';
    default:
      return 'Unknown';
  }
};

const ClientCard = ({ client }: { client: Client }) => {
  const navigate = useNavigate();
  const { contacts } = useContacts(client.id);
  const { projects } = useProjects(client.id);
  
  const primaryContact = contacts.find(contact => contact.is_primary);
  const displayEmail = primaryContact?.email || 'No email';
  const displayPhone = primaryContact?.phone || client.phone || 'No phone';

  // Calculate project statistics for this client
  const activeProjects = projects?.filter(project => project.status !== 'Completed') || [];
  const completedProjects = projects?.filter(project => project.status === 'Completed') || [];
  const totalProjects = projects?.length || 0;
  const totalValue = projects?.reduce((sum, project) => sum + (Number(project.budget) || 0), 0) || 0;

  console.log('ClientCard - client:', client.company);
  console.log('ClientCard - projects:', projects);
  console.log('ClientCard - activeProjects:', activeProjects.length);
  console.log('ClientCard - completedProjects:', completedProjects.length);
  console.log('ClientCard - totalValue:', totalValue);

  const handleClientClick = () => {
    navigate(`/clients/${client.id}`);
  };

  // Use the stored avatar from the database
  const avatarText = client.avatar || client.company.substring(0, 2).toUpperCase();

  return (
    <div 
      className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClientClick}
    >
      <div className="relative">
        <div className={`w-12 h-12 bg-gradient-to-r ${client.gradient || 'from-blue-400 to-blue-600'} rounded-full flex items-center justify-center text-white font-medium`}>
          {avatarText}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(client.status)} rounded-full border-2 border-white`}></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">{client.company}</h4>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            client.status === 'active' ? 'bg-green-100 text-green-800' :
            client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {getStatusText(client.status)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{client.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Mail size={12} className="mr-1" />
            {displayEmail}
          </div>
          {displayPhone && (
            <div className="flex items-center">
              <Phone size={12} className="mr-1" />
              {displayPhone}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">
          {activeProjects.length} Active
        </div>
        <div className="text-xs text-gray-500">
          {completedProjects.length} Completed
        </div>
        <div className="text-sm text-gray-500">
          ${totalValue.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">Since {new Date(client.joined_date).toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export const ClientOverview = ({ clients, onClientClick }: ClientOverviewProps) => {
  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
      
      {clients.length === 0 && (
        <div className="text-center py-8">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
          <p className="text-gray-600">Add your first client to get started</p>
        </div>
      )}
    </div>
  );
};
