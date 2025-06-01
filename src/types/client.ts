
export interface Domain {
  id: number;
  name: string;
  registrar: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  renewalCost: number;
}

export interface HostingInfo {
  id: number;
  provider: string;
  plan: string;
  serverLocation: string;
  renewalDate: string;
  loginUrl: string;
  notes: string;
  renewalCost: number;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  status: string;
  projectsCount: number;
  totalValue: number;
  joinedDate: string;
  avatar: string;
  gradient: string;
  domains: Domain[];
  hosting: HostingInfo[];
  contacts: Contact[];
}
