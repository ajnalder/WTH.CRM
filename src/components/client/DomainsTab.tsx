
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { Domain } from '@/types/client';
import AddDomainDialog from './AddDomainDialog';

interface DomainsTabProps {
  domains: Domain[];
  showDomainDialog: boolean;
  setShowDomainDialog: (show: boolean) => void;
  newDomain: Omit<Domain, 'id'>;
  setNewDomain: (domain: Omit<Domain, 'id'>) => void;
  onAddDomain: () => void;
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
  onAddDomain
}: DomainsTabProps) => {
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
                    <p className="text-sm text-gray-600">Annual renewal: ${domain.renewalCost}</p>
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
  );
};

export default DomainsTab;
