
import React from 'react';
import { Client } from '@/hooks/useClients';
import { useContacts } from '@/hooks/useContacts';

interface InvoiceClientInfoProps {
  client?: Client;
}

export const InvoiceClientInfo: React.FC<InvoiceClientInfoProps> = ({ client }) => {
  const { contacts } = useContacts(client?.id || '');
  const primaryContact = contacts?.find(contact => contact.is_primary);

  if (!client) return null;

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 mb-4">Bill To</h3>
      <div className="space-y-1 text-sm">
        <div className="font-medium">{client.company}</div>
        {primaryContact?.name && <div>{primaryContact.name}</div>}
        {primaryContact?.email && <div>{primaryContact.email}</div>}
        {primaryContact?.phone && <div>{primaryContact.phone}</div>}
        {!primaryContact?.phone && client.phone && <div>{client.phone}</div>}
      </div>
    </div>
  );
};
