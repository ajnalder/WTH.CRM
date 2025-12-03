import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@/hooks/useClients';
import { useContacts } from '@/hooks/useContacts';
import { useProjects } from '@/hooks/useProjects';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ClientTableProps {
  clients: Client[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case 'inactive':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const ClientRow = ({ client }: { client: Client }) => {
  const navigate = useNavigate();
  const { contacts } = useContacts(client.id);
  const { projects } = useProjects(client.id);
  
  const primaryContact = contacts.find(contact => contact.is_primary);
  const activeProjects = projects?.filter(project => project.status !== 'Completed') || [];
  const totalValue = projects?.reduce((sum, project) => sum + (Number(project.budget) || 0), 0) || 0;

  const avatarText = client.avatar || client.company.substring(0, 2).toUpperCase();

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-r ${client.gradient || 'from-blue-400 to-blue-600'} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
              {avatarText}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
              client.status === 'active' ? 'bg-green-500' : 
              client.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <p className="font-medium">{client.company}</p>
            {client.description && (
              <p className="text-sm text-muted-foreground">{client.description}</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {primaryContact ? (
          <div>
            <p className="text-sm">{primaryContact.name}</p>
            <p className="text-sm text-muted-foreground">{primaryContact.email}</p>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No contact</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <span className="font-medium">{activeProjects.length}</span>
        <span className="text-muted-foreground text-sm"> / {projects.length}</span>
      </TableCell>
      <TableCell className="text-right font-medium">
        ${totalValue.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {getStatusBadge(client.status)}
      </TableCell>
    </TableRow>
  );
};

export const ClientTable = ({ clients }: ClientTableProps) => {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No clients found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Client</TableHead>
          <TableHead>Primary Contact</TableHead>
          <TableHead className="text-center">Projects</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <ClientRow key={client.id} client={client} />
        ))}
      </TableBody>
    </Table>
  );
};
