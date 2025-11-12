
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
  updateContact: (id: string, data: any) => void;
  newDomain: {
    name: string;
    registrar: string;
    expiry_date: string;
    platform: 'Webflow' | 'Shopify';
    renewal_cost: number;
    client_managed: boolean;
    notes?: string;
  };
  setNewDomain: React.Dispatch<React.SetStateAction<{
    name: string;
    registrar: string;
    expiry_date: string;
    platform: 'Webflow' | 'Shopify';
    renewal_cost: number;
    client_managed: boolean;
    notes?: string;
  }>>;
  newHosting: {
    provider: string;
    plan: string;
    platform: string;
    renewal_date: string;
    login_url: string;
    notes: string;
    renewal_cost: number | null;
  };
  setNewHosting: React.Dispatch<React.SetStateAction<{
    provider: string;
    plan: string;
    platform: string;
    renewal_date: string;
    login_url: string;
    notes: string;
    renewal_cost: number | null;
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

export interface NewDomainForm {
  name: string;
  registrar: string;
  expiry_date: string;
  platform: 'Webflow' | 'Shopify';
  renewal_cost: number;
  client_managed: boolean;
  notes?: string;
}

export interface NewHostingForm {
  provider: string;
  plan: string;
  platform: string;
  renewal_date: string;
  login_url: string;
  notes: string;
  renewal_cost: number | null;
}

export interface NewContactForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  is_primary: boolean;
}
