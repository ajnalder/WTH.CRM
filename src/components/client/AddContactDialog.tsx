
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { sanitizeString } from '@/utils/validation';

interface AddContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newContact: {
    name: string;
    email: string;
    phone: string;
    role: string;
    is_primary: boolean;
  };
  setNewContact: (contact: {
    name: string;
    email: string;
    phone: string;
    role: string;
    is_primary: boolean;
  }) => void;
  onAddContact: () => void;
}

const AddContactDialog = ({
  isOpen,
  onOpenChange,
  newContact,
  setNewContact,
  onAddContact
}: AddContactDialogProps) => {
  const { errors, validateForm, clearErrors } = useFormValidation();

  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      type: 'text' as const
    },
    email: {
      required: true,
      type: 'email' as const,
      maxLength: 254
    },
    phone: {
      required: false,
      type: 'phone' as const,
      maxLength: 20
    },
    role: {
      required: false,
      maxLength: 100,
      type: 'text' as const
    }
  };

  const handleAddContact = () => {
    const sanitizedContact = {
      name: sanitizeString(newContact.name, 100),
      email: sanitizeString(newContact.email, 254),
      phone: sanitizeString(newContact.phone, 20),
      role: sanitizeString(newContact.role, 100),
      is_primary: newContact.is_primary
    };

    const isValid = validateForm(sanitizedContact, validationRules);
    
    if (isValid) {
      onAddContact();
      clearErrors();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewContact({
      ...newContact,
      [field]: value
    });
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      clearErrors();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
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
            <Label htmlFor="contact-name">Name *</Label>
            <Input
              id="contact-name"
              value={newContact.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Smith"
              maxLength={100}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="contact-email">Email *</Label>
            <Input
              id="contact-email"
              type="email"
              value={newContact.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@company.com"
              maxLength={254}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={newContact.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              maxLength={20}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="contact-role">Role</Label>
            <Input
              id="contact-role"
              value={newContact.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder="CEO, CTO, Project Manager, etc."
              maxLength={100}
              className={errors.role ? 'border-red-500' : ''}
            />
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role[0]}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-primary"
              checked={newContact.is_primary}
              onCheckedChange={(checked) => setNewContact({...newContact, is_primary: checked === true})}
            />
            <Label htmlFor="is-primary">Primary Contact</Label>
          </div>
          <Button onClick={handleAddContact} className="w-full">Add Contact</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactDialog;
