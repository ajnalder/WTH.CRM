
import React from 'react';
import ClientOverviewTab from './ClientOverviewTab';
import ProjectsTab from './ProjectsTab';
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
    case 'projects':
      return <ProjectsTab client={client} />;
    case 'domains':
      return <DomainsTab {...props} onAddDomain={props.addDomain} />;
    case 'hosting':
      return <HostingTab {...props} onAddHosting={props.addHosting} />;
    case 'contacts':
      return <ContactsTab {...props} onAddContact={props.addContact} onUpdateContact={props.updateContact} onDeleteContact={props.deleteContact} />;
    case 'invoices':
      return <InvoicesTab client={client} />;
    default:
      return <ClientOverviewTab client={client} />;
  }
};

export default ClientDetailContent;
