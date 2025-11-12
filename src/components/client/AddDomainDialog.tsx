
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

interface AddDomainDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newDomain: {
    name: string;
    registrar: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'pending';
    renewal_cost: number;
    client_managed: boolean;
    notes?: string;
  };
  setNewDomain: (domain: {
    name: string;
    registrar: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'pending';
    renewal_cost: number;
    client_managed: boolean;
    notes?: string;
  }) => void;
  onAddDomain: () => void;
}

const AddDomainDialog = ({
  isOpen,
  onOpenChange,
  newDomain,
  setNewDomain,
  onAddDomain
}: AddDomainDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Domain</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="domain-name">Domain Name</Label>
            <Input
              id="domain-name"
              value={newDomain.name}
              onChange={(e) => setNewDomain({...newDomain, name: e.target.value})}
              placeholder="example.com"
            />
          </div>
          <div>
            <Label htmlFor="registrar">Registrar</Label>
            <Input
              id="registrar"
              value={newDomain.registrar}
              onChange={(e) => setNewDomain({...newDomain, registrar: e.target.value})}
              placeholder="GoDaddy, Namecheap, etc."
            />
          </div>
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              type="date"
              value={newDomain.expiry_date}
              onChange={(e) => setNewDomain({...newDomain, expiry_date: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="renewal-cost">Annual Renewal Cost ($)</Label>
            <Input
              id="renewal-cost"
              type="number"
              value={newDomain.renewal_cost}
              onChange={(e) => setNewDomain({...newDomain, renewal_cost: parseFloat(e.target.value) || 0})}
              placeholder="15.99"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={newDomain.status} onValueChange={(value: 'active' | 'expired' | 'pending') => setNewDomain({...newDomain, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="client_managed"
              checked={newDomain.client_managed}
              onCheckedChange={(checked) =>
                setNewDomain({
                  ...newDomain,
                  client_managed: checked as boolean,
                })
              }
            />
            <Label htmlFor="client_managed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Client manages this domain (I'm not responsible for renewal)
            </Label>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newDomain.notes || ''}
              onChange={(e) => setNewDomain({...newDomain, notes: e.target.value})}
              placeholder="Add any additional notes about this domain..."
              rows={3}
            />
          </div>
          <Button onClick={onAddDomain} className="w-full">Add Domain</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDomainDialog;
