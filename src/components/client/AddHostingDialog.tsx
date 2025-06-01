
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface AddHostingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newHosting: {
    provider: string;
    plan: string;
    platform: string;
    renewal_date: string;
    login_url: string;
    notes: string;
    renewal_cost: number;
  };
  setNewHosting: (hosting: {
    provider: string;
    plan: string;
    platform: string;
    renewal_date: string;
    login_url: string;
    notes: string;
    renewal_cost: number;
  }) => void;
  onAddHosting: () => void;
}

const platformOptions = [
  'Shopify',
  'Webflow',
  'WordPress',
  'Squarespace',
  'Wix',
  'Custom',
  'Other'
];

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
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={newHosting.platform}
              onValueChange={(value) => setNewHosting({...newHosting, platform: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="renewal">Renewal Date</Label>
            <Input
              id="renewal"
              type="date"
              value={newHosting.renewal_date}
              onChange={(e) => setNewHosting({...newHosting, renewal_date: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="hosting-renewal-cost">Monthly/Annual Cost ($)</Label>
            <Input
              id="hosting-renewal-cost"
              type="number"
              value={newHosting.renewal_cost}
              onChange={(e) => setNewHosting({...newHosting, renewal_cost: parseFloat(e.target.value) || 0})}
              placeholder="50.00"
            />
          </div>
          <div>
            <Label htmlFor="login-url">Login URL</Label>
            <Input
              id="login-url"
              value={newHosting.login_url}
              onChange={(e) => setNewHosting({...newHosting, login_url: e.target.value})}
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
