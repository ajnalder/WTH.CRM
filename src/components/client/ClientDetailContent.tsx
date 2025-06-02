
import React from 'react';
import ClientOverviewTab from './ClientOverviewTab';
import DomainsTab from './DomainsTab';
import HostingTab from './HostingTab';
import ContactsTab from './ContactsTab';
import InvoicesTab from './InvoicesTab';
import { ClientDetailContextProps } from '@/types/clientDetail';

interface ClientDetailContentProps extends ClientDetailContextProps {
  activeTab: string;
}

const ClientDetailContent = ({ activeTab, ...props }: ClientDetailContentProps) => {
  const { client } = props;

  if (!client) {
    return null;
  }

  switch (activeTab) {
    case 'overview':
      return <ClientOverviewTab client={client} />;
    case 'domains':
      return <DomainsTab {...props} />;
    case 'hosting':
      return <HostingTab {...props} />;
    case 'contacts':
      return <ContactsTab {...props} />;
    case 'invoices':
      return <InvoicesTab client={client} />;
    default:
      return <ClientOverviewTab client={client} />;
  }
};

export default ClientDetailContent;
