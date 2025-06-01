
import React, { useState, ReactNode } from 'react';
import { useClients } from '@/hooks/useClients';
import { useDomains } from '@/hooks/useDomains';
import { useHosting } from '@/hooks/useHosting';
import { useContacts } from '@/hooks/useContacts';

interface ClientDetailProviderProps {
  clientId: string;
  children: (props: ClientDetailContextProps) => ReactNode;
}

export interface ClientDetailContextProps {
  client: any;
  clientsLoading: boolean;
  domains: any[];
  hosting: any[];
  contacts: any[];
  domainsLoading: boolean;
  hostingLoading: boolean;
  contactsLoading: boolean;
  createDomain: (data: any) => void;
  createHosting: (data: any) => void;
  createContact: (data: any) => void;
  deleteDomain: (id: string) => void;
  deleteHosting: (id: string) => void;
  deleteContact: (id: string) => void;
  newDomain: {
    name: string;
    registrar: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'pending';
    renewal_cost: number;
  };
  setNewDomain: React.Dispatch<React.SetStateAction<{
    name: string;
    registrar: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'pending';
    renewal_cost: number;
  }>>;
  newHosting: {
    provider: string;
    plan: string;
    platform: string;
    renewal_date: string;
    login_url: string;
    notes: string;
    renewal_cost: number;
  };
  setNewHosting: React.Dispatch<React.SetStateAction<{
    provider: string;
    plan: string;
    platform: string;
    renewal_date: string;
    login_url: string;
    notes: string;
    renewal_cost: number;
  }>>;
  newContact: {
    name: string;
    email: string;
    phone: string;
    role: string;
    is_primary: boolean;
  };
  setNewContact: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    phone: string;
    role: string;
    is_primary: boolean;
  }>>;
  showDomainDialog: boolean;
  setShowDomainDialog: (show: boolean) => void;
  showHostingDialog: boolean;
  setShowHostingDialog: (show: boolean) => void;
  showContactDialog: boolean;
  setShowContactDialog: (show: boolean) => void;
  addDomain: () => void;
  addHosting: () => void;
  addContact: () => void;
}

const ClientDetailProvider = ({ clientId, children }: ClientDetailProviderProps) => {
  const { clients, isLoading: clientsLoading } = useClients();
  const { domains, createDomain, deleteDomain, isLoading: domainsLoading } = useDomains(clientId);
  const { hosting, createHosting, deleteHosting, isLoading: hostingLoading } = useHosting(clientId);
  const { contacts, createContact, deleteContact, isLoading: contactsLoading } = useContacts(clientId);

  const client = clients.find(c => c.id === clientId);

  // Form state for new items
  const [newDomain, setNewDomain] = useState<{
    name: string;
    registrar: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'pending';
    renewal_cost: number;
  }>({
    name: '',
    registrar: '',
    expiry_date: '',
    status: 'active',
    renewal_cost: 0
  });

  const [newHosting, setNewHosting] = useState({
    provider: '',
    plan: '',
    platform: 'Other',
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
    if (newDomain.name && newDomain.registrar && clientId) {
      createDomain({
        client_id: clientId,
        ...newDomain
      });
      setNewDomain({ name: '', registrar: '', expiry_date: '', status: 'active', renewal_cost: 0 });
      setShowDomainDialog(false);
    }
  };

  const addHosting = () => {
    if (newHosting.provider && newHosting.plan && clientId) {
      createHosting({
        client_id: clientId,
        ...newHosting
      });
      setNewHosting({
        provider: '',
        plan: '',
        platform: 'Other',
        renewal_date: '',
        login_url: '',
        notes: '',
        renewal_cost: 0
      });
      setShowHostingDialog(false);
    }
  };

  const addContact = () => {
    if (newContact.name && newContact.email && clientId) {
      createContact({
        client_id: clientId,
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
    newDomain,
    setNewDomain,
    newHosting,
    setNewHosting,
    newContact,
    setNewContact,
    showDomainDialog,
    setShowDomainDialog,
    showHostingDialog,
    setShowHostingDialog,
    showContactDialog,
    setShowContactDialog,
    addDomain,
    addHosting,
    addContact
  });
};

export default ClientDetailProvider;
