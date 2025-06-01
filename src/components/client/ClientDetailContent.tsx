
import React from 'react';
import ClientOverviewTab from '@/components/client/ClientOverviewTab';
import DomainsTab from '@/components/client/DomainsTab';
import HostingTab from '@/components/client/HostingTab';
import ContactsTab from '@/components/client/ContactsTab';
import { ClientDetailContextProps } from '@/types/clientDetail';

interface ClientDetailContentProps extends ClientDetailContextProps {
  activeTab: string;
}

const ClientDetailContent = ({ activeTab, ...props }: ClientDetailContentProps) => {
  const {
    client,
    domains,
    hosting,
    contacts,
    domainsLoading,
    hostingLoading,
    contactsLoading,
    showDomainDialog,
    setShowDomainDialog,
    newDomain,
    setNewDomain,
    addDomain,
    deleteDomain,
    showHostingDialog,
    setShowHostingDialog,
    newHosting,
    setNewHosting,
    addHosting,
    deleteHosting,
    showContactDialog,
    setShowContactDialog,
    newContact,
    setNewContact,
    addContact,
    deleteContact
  } = props;

  if (!client) return null;

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
      serverLocation: h.platform,
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
      isPrimary: c.is_primary  // Fixed: using the correct field name from Supabase
    }))
  };

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

export default ClientDetailContent;
