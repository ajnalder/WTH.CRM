
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Client, Domain, HostingInfo, Contact } from '@/types/client';
import ClientOverviewTab from '@/components/client/ClientOverviewTab';
import DomainsTab from '@/components/client/DomainsTab';
import HostingTab from '@/components/client/HostingTab';
import ContactsTab from '@/components/client/ContactsTab';

// Mock data - in a real app this would come from your backend
const mockClient: Client = {
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
  domains: [
    {
      id: 1,
      name: 'techcorp.com',
      registrar: 'GoDaddy',
      expiryDate: '2024-12-15',
      status: 'active',
      renewalCost: 15
    },
    {
      id: 2,
      name: 'techcorp.app',
      registrar: 'Namecheap',
      expiryDate: '2024-08-20',
      status: 'active',
      renewalCost: 12
    }
  ],
  hosting: [
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
  ],
  contacts: [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@techcorp.com',
      phone: '+1 (555) 123-4567',
      role: 'CEO',
      isPrimary: true
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@techcorp.com',
      phone: '+1 (555) 123-4568',
      role: 'CTO',
      isPrimary: false
    }
  ]
};

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client>(mockClient);
  const [activeTab, setActiveTab] = useState('overview');

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
        id: client.domains.length + 1,
        ...newDomain
      };
      setClient({
        ...client,
        domains: [...client.domains, domain]
      });
      setNewDomain({ name: '', registrar: '', expiryDate: '', status: 'active', renewalCost: 0 });
      setShowDomainDialog(false);
    }
  };

  const addHosting = () => {
    if (newHosting.provider && newHosting.plan) {
      const hosting: HostingInfo = {
        id: client.hosting.length + 1,
        ...newHosting
      };
      setClient({
        ...client,
        hosting: [...client.hosting, hosting]
      });
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
        id: client.contacts.length + 1,
        ...newContact
      };
      setClient({
        ...client,
        contacts: [...client.contacts, contact]
      });
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ClientOverviewTab client={client} />;
      case 'domains':
        return (
          <DomainsTab
            domains={client.domains}
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
            hosting={client.hosting}
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
            contacts={client.contacts}
            showContactDialog={showContactDialog}
            setShowContactDialog={setShowContactDialog}
            newContact={newContact}
            setNewContact={setNewContact}
            onAddContact={addContact}
          />
        );
      default:
        return <ClientOverviewTab client={client} />;
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
          <div className={`w-12 h-12 bg-gradient-to-r ${client.gradient} rounded-full flex items-center justify-center text-white font-bold`}>
            {client.avatar}
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
