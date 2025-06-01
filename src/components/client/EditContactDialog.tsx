
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Contact } from '@/hooks/useContacts';

interface EditContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  editingContact: Omit<Contact, 'id' | 'client_id' | 'created_at' | 'updated_at'>;
  setEditingContact: (contact: Omit<Contact, 'id' | 'client_id' | 'created_at' | 'updated_at'>) => void;
  onUpdateContact: () => void;
}

const EditContactDialog = ({
  isOpen,
  onOpenChange,
  contact,
  editingContact,
  setEditingContact,
  onUpdateContact
}: EditContactDialogProps) => {
  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-contact-name">Name</Label>
            <Input
              id="edit-contact-name"
              value={editingContact.name}
              onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
              placeholder="John Smith"
            />
          </div>
          <div>
            <Label htmlFor="edit-contact-email">Email</Label>
            <Input
              id="edit-contact-email"
              type="email"
              value={editingContact.email}
              onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
              placeholder="john@company.com"
            />
          </div>
          <div>
            <Label htmlFor="edit-contact-phone">Phone</Label>
            <Input
              id="edit-contact-phone"
              value={editingContact.phone || ''}
              onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="edit-contact-role">Role</Label>
            <Input
              id="edit-contact-role"
              value={editingContact.role || ''}
              onChange={(e) => setEditingContact({...editingContact, role: e.target.value})}
              placeholder="CEO, CTO, Project Manager, etc."
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-is-primary"
              checked={editingContact.is_primary}
              onChange={(e) => setEditingContact({...editingContact, is_primary: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="edit-is-primary">Primary Contact</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onUpdateContact}>Update Contact</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditContactDialog;
