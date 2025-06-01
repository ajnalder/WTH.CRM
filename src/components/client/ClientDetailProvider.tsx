
import React, { ReactNode } from 'react';
import { useClients } from '@/hooks/useClients';
import { useDomains } from '@/hooks/useDomains';
import { useHosting } from '@/hooks/useHosting';
import { useContacts } from '@/hooks/useContacts';
import { useClientDetailActions } from '@/hooks/useClientDetailActions';
import { ClientDetailContextProps } from '@/types/clientDetail';

interface ClientDetailProviderProps {
  clientId: string;
  children: (props: ClientDetailContextProps) => ReactNode;
}

const ClientDetailProvider = ({ clientId, children }: ClientDetailProviderProps) => {
  const { clients, isLoading: clientsLoading } = useClients();
  const { domains, createDomain, deleteDomain, isLoading: domainsLoading } = useDomains(clientId);
  const { hosting, createHosting, deleteHosting, isLoading: hostingLoading } = useHosting(clientId);
  const { contacts, createContact, deleteContact, updateContact, isLoading: contactsLoading } = useContacts(clientId);

  const client = clients.find(c => c.id === clientId);

  const actions = useClientDetailActions({
    clientId,
    createDomain,
    createHosting,
    createContact
  });

  return children({
    client,
    clientsLoading,
    domains,
    hosting,
    contacts,
    domainsLoading,
    hostingLoading,
    contactsLoading,
    createDomain,
    createHosting,
    createContact,
    deleteDomain,
    deleteHosting,
    deleteContact,
    updateContact,
    ...actions
  });
};

export default ClientDetailProvider;
