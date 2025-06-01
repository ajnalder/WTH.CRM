
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useDomains } from '@/hooks/useDomains';
import { useHosting } from '@/hooks/useHosting';
import { useContacts } from '@/hooks/useContacts';
import ClientOverviewTab from '@/components/client/ClientOverviewTab';
import DomainsTab from '@/components/client/DomainsTab';
import HostingTab from '@/components/client/HostingTab';
import ContactsTab from '@/components/client/ContactsTab';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, isLoading: clientsLoading } = useClients();
  const [activeTab, setActiveTab] = useState('overview');

  // Find the client from the real data
  const client = clients.find(c => c.id === id);

  // Use the database hooks
  const { domains, createDomain, deleteDomain, isLoading: domainsLoading } = useDomains(id || '');
  const { hosting, createHosting, deleteHosting, isLoading: hostingLoading } = useHosting(id || '');
  const { contacts, createContact, deleteContact, isLoading: contactsLoading } = useContacts(id || '');

  // Form state for new items
  const [newDomain, setNewDomain] = useState({
    name: '',
    registrar: '',
    expiry_date: '',
    status: 'active' as const,
    renewal_cost: 0
  });

  const [newHosting, setNewHosting] = useState({
    provider: '',
    plan: '',
    server_location: '',
    renewal_date: '',
    login_url: '',
    notes: '',
    renewal_cost: 0
  });

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    is_primary: false
  });

  const [showDomainDialog, setShowDomainDialog] = useState(false);
  const [showHostingDialog, setShowHostingDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const addDomain = () => {
    if (newDomain.name && newDomain.registrar && id) {
      createDomain({
        client_id: id,
        ...newDomain
      });
      setNewDomain({ name: '', registrar: '', expiry_date: '', status: 'active', renewal_cost: 0 });
      setShowDomainDialog(false);
    }
  };

  const addHosting = () => {
    if (newHosting.provider && newHosting.plan && id) {
      createHosting({
        client_id: id,
        ...newHosting
      });
      setNewHosting({
        provider: '',
        plan: '',
        server_location: '',
        renewal_date: '',
        login_url: '',
        notes: '',
        renewal_cost: 0
      });
      setShowHostingDialog(false);
    }
  };

  const addContact = () => {
    if (newContact.name && newContact.email && id) {
      createContact({
        client_id: id,
        ...newContact
      });
      setNewContact({
        name: '',
        email: '',
        phone: '',
        role: '',
        is_primary: false
      });
      setShowContactDialog(false);
    }
  };

  if (clientsLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/clients')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Clients
          </Button>
        </div>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Client not found</h1>
          <p className="text-gray-600">The client you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  // Convert the Supabase client data to match the expected format for the overview tab
  const clientForOverview = {
    id: parseInt(client.id),
    name: client.name,
    email: client.email,
    phone: client.phone || '',
    company: client.company,
    industry: client.industry || '',
    status: client.status,
    projectsCount: client.projects_count,
    totalValue: Number(client.total_value),
    joinedDate: client.joined_date,
    avatar: client.avatar || client.company.substring(0, 2).toUpperCase(),
    gradient: client.gradient || 'from-blue-400 to-blue-600',
    domains: domains.map(d => ({
      id: parseInt(d.id),
      name: d.name,
      registrar: d.registrar,
      expiryDate: d.expiry_date,
      status: d.status,
      renewalCost: Number(d.renewal_cost)
    })),
    hosting: hosting.map(h => ({
      id: parseInt(h.id),
      provider: h.provider,
      plan: h.plan,
      serverLocation: h.server_location,
      renewalDate: h.renewal_date,
      loginUrl: h.login_url || '',
      notes: h.notes || '',
      renewalCost: Number(h.renewal_cost)
    })),
    contacts: contacts.map(c => ({
      id: parseInt(c.id),
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      role: c.role || '',
      isPrimary: c.is_primary
    }))
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ClientOverviewTab client={clientForOverview} />;
      case 'domains':
        return (
          <DomainsTab
            domains={domains}
            showDomainDialog={showDomainDialog}
            setShowDomainDialog={setShowDomainDialog}
            newDomain={newDomain}
            setNewDomain={setNewDomain}
            onAddDomain={addDomain}
            onDeleteDomain={deleteDomain}
            isLoading={domainsLoading}
          />
        );
      case 'hosting':
        return (
          <HostingTab
            hosting={hosting}
            showHostingDialog={showHostingDialog}
            setShowHostingDialog={setShowHostingDialog}
            newHosting={newHosting}
            setNewHosting={setNewHosting}
            onAddHosting={addHosting}
            onDeleteHosting={deleteHosting}
            isLoading={hostingLoading}
          />
        );
      case 'contacts':
        return (
          <ContactsTab
            contacts={contacts}
            showContactDialog={showContactDialog}
            setShowContactDialog={setShowContactDialog}
            newContact={newContact}
            setNewContact={setNewContact}
            onAddContact={addContact}
            onDeleteContact={deleteContact}
            isLoading={contactsLoading}
          />
        );
      default:
        return <ClientOverviewTab client={clientForOverview} />;
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/clients')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Clients
          </Button>
          <div className={`w-12 h-12 bg-gradient-to-r ${client.gradient || 'from-blue-400 to-blue-600'} rounded-full flex items-center justify-center text-white font-bold`}>
            {client.avatar || client.company.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.company}</h1>
            <p className="text-gray-600">{client.industry}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'domains', 'hosting', 'contacts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default ClientDetail;
