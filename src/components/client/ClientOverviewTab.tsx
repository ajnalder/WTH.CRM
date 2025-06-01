
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Client } from '@/types/client';
import { useContacts } from '@/hooks/useContacts';

interface ClientOverviewTabProps {
  client: Client;
}

const ClientOverviewTab = ({ client }: ClientOverviewTabProps) => {
  const { contacts, isLoading } = useContacts(client.id.toString());
  
  const primaryContact = contacts?.find(contact => contact.is_primary);

  return (
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-gray-500">Loading contact information...</p>
            ) : primaryContact ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-gray-900">{primaryContact.name}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="text-gray-900">{primaryContact.role || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-900">{primaryContact.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-gray-900">{primaryContact.phone || 'Not provided'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No primary contact assigned</p>
            )}
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
  );
};

export default ClientOverviewTab;
