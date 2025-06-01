import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  Globe, 
  Server, 
  Users, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  User
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Domain {
  id: number;
  name: string;
  registrar: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}

interface HostingInfo {
  id: number;
  provider: string;
  plan: string;
  serverLocation: string;
  renewalDate: string;
  loginUrl: string;
  notes: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

interface Client {
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
      status: 'active'
    },
    {
      id: 2,
      name: 'techcorp.app',
      registrar: 'Namecheap',
      expiryDate: '2024-08-20',
      status: 'active'
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
      notes: 'Main production environment'
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

  const [newDomain, setNewDomain] = useState({
    name: '',
    registrar: '',
    expiryDate: '',
    status: 'active' as 'active' | 'expired' | 'pending'
  });

  const [newHosting, setNewHosting] = useState({
    provider: '',
    plan: '',
    serverLocation: '',
    renewalDate: '',
    loginUrl: '',
    notes: ''
  });

  const [newContact, setNewContact] = useState({
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
      setNewDomain({ name: '', registrar: '', expiryDate: '', status: 'active' });
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
        notes: ''
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <p className="text-gray-900">{client.company}</p>
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <p className="text-gray-900">{client.industry}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-gray-900">{client.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-gray-900">{client.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects</span>
                  <span className="font-semibold">{client.projectsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-semibold">${client.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Domains</span>
                  <span className="font-semibold">{client.domains.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contacts</span>
                  <span className="font-semibold">{client.contacts.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Domain Management</h2>
            <Dialog open={showDomainDialog} onOpenChange={setShowDomainDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Domain
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Domain</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="domain-name">Domain Name</Label>
                    <Input
                      id="domain-name"
                      value={newDomain.name}
                      onChange={(e) => setNewDomain({...newDomain, name: e.target.value})}
                      placeholder="example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrar">Registrar</Label>
                    <Input
                      id="registrar"
                      value={newDomain.registrar}
                      onChange={(e) => setNewDomain({...newDomain, registrar: e.target.value})}
                      placeholder="GoDaddy, Namecheap, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="date"
                      value={newDomain.expiryDate}
                      onChange={(e) => setNewDomain({...newDomain, expiryDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={newDomain.status} onValueChange={(value) => setNewDomain({...newDomain, status: value as 'active' | 'expired' | 'pending'})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addDomain} className="w-full">Add Domain</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {client.domains.map((domain) => (
              <Card key={domain.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe size={20} className="text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{domain.name}</h3>
                        <p className="text-sm text-gray-600">Registered with {domain.registrar}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(domain.status)}`}>
                        {domain.status}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">Expires: {new Date(domain.expiryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'hosting' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Hosting Information</h2>
            <Dialog open={showHostingDialog} onOpenChange={setShowHostingDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Hosting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Hosting Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      value={newHosting.provider}
                      onChange={(e) => setNewHosting({...newHosting, provider: e.target.value})}
                      placeholder="AWS, DigitalOcean, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan">Plan/Instance</Label>
                    <Input
                      id="plan"
                      value={newHosting.plan}
                      onChange={(e) => setNewHosting({...newHosting, plan: e.target.value})}
                      placeholder="EC2 t3.medium, Droplet 2GB, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Server Location</Label>
                    <Input
                      id="location"
                      value={newHosting.serverLocation}
                      onChange={(e) => setNewHosting({...newHosting, serverLocation: e.target.value})}
                      placeholder="US East, Europe, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="renewal">Renewal Date</Label>
                    <Input
                      id="renewal"
                      type="date"
                      value={newHosting.renewalDate}
                      onChange={(e) => setNewHosting({...newHosting, renewalDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-url">Login URL</Label>
                    <Input
                      id="login-url"
                      value={newHosting.loginUrl}
                      onChange={(e) => setNewHosting({...newHosting, loginUrl: e.target.value})}
                      placeholder="https://console.aws.amazon.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newHosting.notes}
                      onChange={(e) => setNewHosting({...newHosting, notes: e.target.value})}
                      placeholder="Additional notes..."
                    />
                  </div>
                  <Button onClick={addHosting} className="w-full">Add Hosting</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {client.hosting.map((hosting) => (
              <Card key={hosting.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Server size={20} className="text-green-500" />
                      <div>
                        <h3 className="font-semibold">{hosting.provider}</h3>
                        <p className="text-sm text-gray-600">{hosting.plan}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={hosting.loginUrl} target="_blank" rel="noopener noreferrer">
                        Access Console
                      </a>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">{hosting.serverLocation}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Renewal:</span>
                      <p className="font-medium">{new Date(hosting.renewalDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {hosting.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{hosting.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Client Contacts</h2>
            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Phone</Label>
                    <Input
                      id="contact-phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-role">Role</Label>
                    <Input
                      id="contact-role"
                      value={newContact.role}
                      onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                      placeholder="CEO, CTO, Project Manager, etc."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-primary"
                      checked={newContact.isPrimary}
                      onChange={(e) => setNewContact({...newContact, isPrimary: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="is-primary">Primary Contact</Label>
                  </div>
                  <Button onClick={addContact} className="w-full">Add Contact</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {client.contacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          {contact.isPrimary && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{contact.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail size={12} />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Phone size={12} />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
