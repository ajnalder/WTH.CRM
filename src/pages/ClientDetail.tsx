
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientDetailHeader from '@/components/client/ClientDetailHeader';
import ClientDetailTabs from '@/components/client/ClientDetailTabs';
import ClientDetailProvider from '@/components/client/ClientDetailProvider';
import ClientDetailContent from '@/components/client/ClientDetailContent';
import { useClients } from '@/hooks/useClients';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { deleteClient } = useClients();

  const handleDeleteClient = () => {
    if (id) {
      deleteClient(id);
      navigate('/clients');
    }
  };

  if (!id) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid client ID</h1>
          <p className="text-gray-600">Please select a valid client.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <ClientDetailProvider clientId={id}>
        {(contextProps) => {
          const { client, clientsLoading } = contextProps;

          if (clientsLoading) {
            return (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            );
          }

          if (!client) {
            return (
              <>
                <ClientDetailHeader
                  onBackClick={() => navigate('/clients')}
                  clientCompany="Client not found"
                  clientIndustry=""
                />
                <div className="text-center py-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Client not found</h1>
                  <p className="text-gray-600">The client you're looking for doesn't exist or you don't have access to it.</p>
                </div>
              </>
            );
          }

          return (
            <>
              <ClientDetailHeader
                onBackClick={() => navigate('/clients')}
                clientCompany={client.company}
                clientIndustry={client.industry}
                clientAvatar={client.avatar}
                clientGradient={client.gradient}
                onDeleteClient={handleDeleteClient}
              />
              <ClientDetailTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              <ClientDetailContent
                activeTab={activeTab}
                {...contextProps}
              />
            </>
          );
        }}
      </ClientDetailProvider>
    </div>
  );
};

export default ClientDetail;
