
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { Domain, HostingInfo, Contact } from '@/types/client';
import ClientOverviewTab from '@/components/client/ClientOverviewTab';
import DomainsTab from '@/components/client/DomainsTab';
import HostingTab from '@/components/client/HostingTab';
import ContactsTab from '@/components/client/ContactsTab';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, isLoading } = useClients();
  const [activeTab, setActiveTab] = useState('overview');

  // Find the client from the real data
  const client = clients.find(c => c.id === id);

  // Mock data for domains, hosting, and contacts - these could be separate tables later
  const [domains, setDomains] = useState<Domain[]>([
    {
      id: 1,
      name: 'example.com',
      registrar: 'GoDaddy',
      expiryDate: '2024-12-15',
      status: 'active',
      renewalCost: 15
    }
  ]);

  const [hosting, setHosting] = useState<HostingInfo[]>([
    {
      id: 1,
      provider: 'AWS',
      plan: 'EC2 t3.medium',
      serverLocation: 'US East (Virginia)',
      renewalDate: '2024-07-01',
      loginUrl: 'https://console.aws.amazon.com',
      notes: 'Main production environment',
      renewalCost: 50
    }
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: client?.name || 'Primary Contact',
      email: client?.email || 'contact@example.com',
      phone: client?.phone || '+1 (555) 123-4567',
      role: 'Primary Contact',
      isPrimary: true
    }
  ]);

  const [newDomain, setNewDomain] = useState<Omit<Domain, 'id'>>({
    name: '',
    registrar: '',
    expiryDate: '',
    status: 'active',
    renewalCost: 0
  });

  const [newHosting, setNewHosting] = useState<Omit<HostingInfo, 'id'>>({
    provider: '',
    plan: '',
    serverLocation: '',
    renewalDate: '',
    loginUrl: '',
    notes: '',
    renewalCost: 0
  });

  const [newContact, setNewContact] = useState<Omit<Contact, 'id'>>({
    name: '',
    email: '',
    phone: '',
    role: '',
    isPrimary: false
  });

  const [showDomainDialog, setShowDomainDialog] = useState(false);
  const [showHostingDialog, setShowHostingDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const addDomain = () => {
    if (newDomain.name && newDomain.registrar) {
      const domain: Domain = {
        id: domains.length + 1,
        ...newDomain
      };
      setDomains([...domains, domain]);
      setNewDomain({ name: '', registrar: '', expiryDate: '', status: 'active', renewalCost: 0 });
      setShowDomainDialog(false);
    }
  };

  const addHosting = () => {
    if (newHosting.provider && newHosting.plan) {
      const newHost: HostingInfo = {
        id: hosting.length + 1,
        ...newHosting
      };
      setHosting([...hosting, newHost]);
      setNewHosting({
        provider: '',
        plan: '',
        serverLocation: '',
        renewalDate: '',
        loginUrl: '',
        notes: '',
        renewalCost: 0
      });
      setShowHostingDialog(false);
    }
  };

  const addContact = () => {
    if (newContact.name && newContact.email) {
      const contact: Contact = {
        id: contacts.length + 1,
        ...newContact
      };
      setContacts([...contacts, contact]);
      setNewContact({
        name: '',
        email: '',
        phone: '',
        role: '',
        isPrimary: false
      });
      setShowContactDialog(false);
    }
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

  // Convert the Supabase client data to match the expected format for the components
  const clientForTabs = {
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
    domains,
    hosting,
    contacts
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ClientOverviewTab client={clientForTabs} />;
      case 'domains':
        return (
          <DomainsTab
            domains={domains}
            showDomainDialog={showDomainDialog}
            setShowDomainDialog={setShowDomainDialog}
            newDomain={newDomain}
            setNewDomain={setNewDomain}
            onAddDomain={addDomain}
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
          />
        );
      default:
        return <ClientOverviewTab client={clientForTabs} />;
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
