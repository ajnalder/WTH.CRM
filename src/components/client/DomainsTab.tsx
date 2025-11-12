
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Domain } from '@/hooks/useDomains';
import AddDomainDialog from './AddDomainDialog';

interface DomainsTabProps {
  domains: Domain[];
  showDomainDialog: boolean;
  setShowDomainDialog: (show: boolean) => void;
  newDomain: Omit<Domain, 'id' | 'client_id' | 'created_at' | 'updated_at'>;
  setNewDomain: (domain: Omit<Domain, 'id' | 'client_id' | 'created_at' | 'updated_at'>) => void;
  onAddDomain: () => void;
  onDeleteDomain?: (id: string) => void;
  isLoading?: boolean;
}

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

const DomainsTab = ({
  domains,
  showDomainDialog,
  setShowDomainDialog,
  newDomain,
  setNewDomain,
  onAddDomain,
  onDeleteDomain,
  isLoading
}: DomainsTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Domain Management</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Domain Management</h2>
        <AddDomainDialog
          isOpen={showDomainDialog}
          onOpenChange={setShowDomainDialog}
          newDomain={newDomain}
          setNewDomain={setNewDomain}
          onAddDomain={onAddDomain}
        />
      </div>

      <div className="grid gap-4">
        {domains.map((domain) => (
          <Card key={domain.id}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe size={20} className="text-blue-500" />
                  <div>
                    <h3 className="font-semibold">{domain.name}</h3>
                    <p className="text-sm text-gray-600">Registered with {domain.registrar}</p>
                    <p className="text-sm text-gray-600">Annual renewal: ${domain.renewal_cost}</p>
                    {domain.notes && (
                      <p className="text-sm text-gray-500 mt-1 italic">{domain.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(domain.status)}`}>
                      {domain.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">Expires: {new Date(domain.expiry_date).toLocaleDateString()}</p>
                    {domain.client_managed && (
                      <p className="text-sm text-blue-600 font-medium mt-1">Client Managed</p>
                    )}
                  </div>
                  {onDeleteDomain && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{domain.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteDomain(domain.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {domains.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Globe size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No domains registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainsTab;
