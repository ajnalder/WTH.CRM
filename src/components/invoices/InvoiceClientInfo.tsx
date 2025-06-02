
import React from 'react';
import { Client } from '@/hooks/useClients';

interface InvoiceClientInfoProps {
  client?: Client;
}

export const InvoiceClientInfo: React.FC<InvoiceClientInfoProps> = ({ client }) => {
  if (!client) return null;

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 mb-4">Bill To</h3>
      <div className="space-y-1 text-sm">
        <div className="font-medium">{client.company}</div>
        {client.name && <div>{client.name}</div>}
        {client.email && <div>{client.email}</div>}
        {client.phone && <div>{client.phone}</div>}
      </div>
    </div>
  );
};
