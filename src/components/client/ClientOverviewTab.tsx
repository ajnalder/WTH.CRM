
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { Client } from '@/hooks/useClients';
import { useContacts } from '@/hooks/useContacts';
import { useProjects } from '@/hooks/useProjects';
import { useDomains } from '@/hooks/useDomains';
import { useClientTimeEntries } from '@/hooks/useClientTimeEntries';

interface ClientOverviewTabProps {
  client: Client;
}

const ClientOverviewTab = ({ client }: ClientOverviewTabProps) => {
  const { contacts, isLoading } = useContacts(client.id);
  const { projects } = useProjects(client.id);
  const { domains } = useDomains(client.id);
  const { data: timeData, isLoading: timeLoading } = useClientTimeEntries(client.id);
  
  // Use the contacts directly from the hook (Supabase format with is_primary)
  const primaryContact = contacts?.find(contact => contact.is_primary);

  // Calculate actual totals from projects
  const actualProjectCount = projects.length;
  const actualTotalValue = projects.reduce((sum, project) => sum + (Number(project.budget) || 0), 0);

  console.log('ClientOverviewTab - client.id:', client.id);
  console.log('ClientOverviewTab - contacts:', contacts);
  console.log('ClientOverviewTab - primaryContact:', primaryContact);
  console.log('ClientOverviewTab - isLoading:', isLoading);

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
                <Label>Description</Label>
                <p className="text-gray-900">{client.description || 'No description'}</p>
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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Time Tracking</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {timeLoading ? (
              <p className="text-gray-500">Loading time tracking data...</p>
            ) : timeData && timeData.tasks.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  {timeData.totalEntries} entries across {timeData.tasks.length} tasks
                </div>
                <div className="space-y-3">
                  {timeData.tasks.map((task) => (
                    <div key={task.task_id} className="border-l-2 border-blue-200 pl-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{task.task_title}</p>
                          <p className="text-sm text-gray-500">{task.entry_count} entries</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{task.total_hours.toFixed(1)}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Hours</span>
                    <span className="font-bold text-lg text-blue-600">{timeData.totalHours.toFixed(1)}h</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No time entries logged for this client yet</p>
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
              <span className="font-semibold">{actualProjectCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Value</span>
              <span className="font-semibold">${actualTotalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Hours</span>
              <span className="font-semibold">{timeData?.totalHours.toFixed(1) || '0.0'}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Domains</span>
              <span className="font-semibold">{domains?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contacts</span>
              <span className="font-semibold">{contacts?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOverviewTab;
