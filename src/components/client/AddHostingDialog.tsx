
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { HostingInfo } from '@/types/client';

interface AddHostingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newHosting: Omit<HostingInfo, 'id'>;
  setNewHosting: (hosting: Omit<HostingInfo, 'id'>) => void;
  onAddHosting: () => void;
}

const AddHostingDialog = ({
  isOpen,
  onOpenChange,
  newHosting,
  setNewHosting,
  onAddHosting
}: AddHostingDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Label htmlFor="hosting-renewal-cost">Monthly/Annual Cost ($)</Label>
            <Input
              id="hosting-renewal-cost"
              type="number"
              value={newHosting.renewalCost}
              onChange={(e) => setNewHosting({...newHosting, renewalCost: parseFloat(e.target.value) || 0})}
              placeholder="50.00"
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
          <Button onClick={onAddHosting} className="w-full">Add Hosting</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddHostingDialog;
