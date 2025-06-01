
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';
import { HostingInfo } from '@/types/client';
import AddHostingDialog from './AddHostingDialog';

interface HostingTabProps {
  hosting: HostingInfo[];
  showHostingDialog: boolean;
  setShowHostingDialog: (show: boolean) => void;
  newHosting: Omit<HostingInfo, 'id'>;
  setNewHosting: (hosting: Omit<HostingInfo, 'id'>) => void;
  onAddHosting: () => void;
}

const HostingTab = ({
  hosting,
  showHostingDialog,
  setShowHostingDialog,
  newHosting,
  setNewHosting,
  onAddHosting
}: HostingTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Hosting Information</h2>
        <AddHostingDialog
          isOpen={showHostingDialog}
          onOpenChange={setShowHostingDialog}
          newHosting={newHosting}
          setNewHosting={setNewHosting}
          onAddHosting={onAddHosting}
        />
      </div>

      <div className="grid gap-4">
        {hosting.map((hostingInfo) => (
          <Card key={hostingInfo.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Server size={20} className="text-green-500" />
                  <div>
                    <h3 className="font-semibold">{hostingInfo.provider}</h3>
                    <p className="text-sm text-gray-600">{hostingInfo.plan}</p>
                    <p className="text-sm text-gray-600">Cost: ${hostingInfo.renewalCost}/month</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={hostingInfo.loginUrl} target="_blank" rel="noopener noreferrer">
                    Access Console
                  </a>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="font-medium">{hostingInfo.serverLocation}</p>
                </div>
                <div>
                  <span className="text-gray-600">Renewal:</span>
                  <p className="font-medium">{new Date(hostingInfo.renewalDate).toLocaleDateString()}</p>
                </div>
              </div>
              {hostingInfo.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{hostingInfo.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HostingTab;
