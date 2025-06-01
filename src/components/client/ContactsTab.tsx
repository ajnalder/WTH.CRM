
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, User } from 'lucide-react';
import { Contact } from '@/types/client';
import AddContactDialog from './AddContactDialog';

interface ContactsTabProps {
  contacts: Contact[];
  showContactDialog: boolean;
  setShowContactDialog: (show: boolean) => void;
  newContact: Omit<Contact, 'id'>;
  setNewContact: (contact: Omit<Contact, 'id'>) => void;
  onAddContact: () => void;
}

const ContactsTab = ({
  contacts,
  showContactDialog,
  setShowContactDialog,
  newContact,
  setNewContact,
  onAddContact
}: ContactsTabProps) => {
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
                      {contact.isPrimary && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail size={12} />
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Phone size={12} />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContactsTab;
