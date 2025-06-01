
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
import { Plus } from 'lucide-react';
import { Contact } from '@/types/client';

interface AddContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newContact: Omit<Contact, 'id'>;
  setNewContact: (contact: Omit<Contact, 'id'>) => void;
  onAddContact: () => void;
}

const AddContactDialog = ({
  isOpen,
  onOpenChange,
  newContact,
  setNewContact,
  onAddContact
}: AddContactDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              value={newContact.name}
              onChange={(e) => setNewContact({...newContact, name: e.target.value})}
              placeholder="John Smith"
            />
          </div>
          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({...newContact, email: e.target.value})}
              placeholder="john@company.com"
            />
          </div>
          <div>
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="contact-role">Role</Label>
            <Input
              id="contact-role"
              value={newContact.role}
              onChange={(e) => setNewContact({...newContact, role: e.target.value})}
              placeholder="CEO, CTO, Project Manager, etc."
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-primary"
              checked={newContact.isPrimary}
              onChange={(e) => setNewContact({...newContact, isPrimary: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="is-primary">Primary Contact</Label>
          </div>
          <Button onClick={onAddContact} className="w-full">Add Contact</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactDialog;
