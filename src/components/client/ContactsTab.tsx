
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, User, Trash2, Edit } from 'lucide-react';
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
import { Contact } from '@/hooks/useContacts';
import AddContactDialog from './AddContactDialog';
import EditContactDialog from './EditContactDialog';

interface ContactsTabProps {
  contacts: Contact[];
  showContactDialog: boolean;
  setShowContactDialog: (show: boolean) => void;
  newContact: Omit<Contact, 'id' | 'client_id' | 'created_at' | 'updated_at'>;
  setNewContact: (contact: Omit<Contact, 'id' | 'client_id' | 'created_at' | 'updated_at'>) => void;
  onAddContact: () => void;
  onUpdateContact?: (id: string, data: Omit<Contact, 'id' | 'client_id' | 'created_at' | 'updated_at'>) => void;
  onDeleteContact?: (id: string) => void;
  isLoading?: boolean;
}

const ContactsTab = ({
  contacts,
  showContactDialog,
  setShowContactDialog,
  newContact,
  setNewContact,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  isLoading
}: ContactsTabProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editContactData, setEditContactData] = useState<Omit<Contact, 'id' | 'client_id' | 'created_at' | 'updated_at'>>({
    name: '',
    email: '',
    phone: '',
    role: '',
    is_primary: false
  });

  const handleEditClick = (contact: Contact) => {
    setEditingContact(contact);
    setEditContactData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      role: contact.role || '',
      is_primary: contact.is_primary
    });
    setShowEditDialog(true);
  };

  const handleUpdateContact = () => {
    if (editingContact && onUpdateContact) {
      onUpdateContact(editingContact.id, editContactData);
      setShowEditDialog(false);
      setEditingContact(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Client Contacts</h2>
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
        <h2 className="text-xl font-semibold">Client Contacts</h2>
        <AddContactDialog
          isOpen={showContactDialog}
          onOpenChange={setShowContactDialog}
          newContact={newContact}
          setNewContact={setNewContact}
          onAddContact={onAddContact}
        />
      </div>

      <div className="grid gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{contact.name}</h3>
                      {contact.is_primary && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail size={12} />
                      <span>{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Phone size={12} />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(contact)}>
                      <Edit size={16} className="text-blue-500" />
                    </Button>
                    {onDeleteContact && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{contact.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteContact(contact.id)}
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
              </div>
            </CardContent>
          </Card>
        ))}
        {contacts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No contacts added yet.</p>
          </div>
        )}
      </div>

      <EditContactDialog
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        contact={editingContact}
        editingContact={editContactData}
        setEditingContact={setEditContactData}
        onUpdateContact={handleUpdateContact}
      />
    </div>
  );
};

export default ContactsTab;
