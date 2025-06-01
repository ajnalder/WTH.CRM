
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus } from 'lucide-react';
import { Domain } from '@/types/client';

interface AddDomainDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newDomain: Omit<Domain, 'id'>;
  setNewDomain: (domain: Omit<Domain, 'id'>) => void;
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
              value={newDomain.expiryDate}
              onChange={(e) => setNewDomain({...newDomain, expiryDate: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="renewal-cost">Annual Renewal Cost ($)</Label>
            <Input
              id="renewal-cost"
              type="number"
              value={newDomain.renewalCost}
              onChange={(e) => setNewDomain({...newDomain, renewalCost: parseFloat(e.target.value) || 0})}
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
          <Button onClick={onAddDomain} className="w-full">Add Domain</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDomainDialog;
