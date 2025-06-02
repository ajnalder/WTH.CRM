
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { Invoice } from '@/types/invoiceTypes';
import { Client } from '@/hooks/useClients';
import { useContacts } from '@/hooks/useContacts';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useEmailInvoice } from '@/hooks/useEmailInvoice';
import { EmailForm } from './EmailForm';

interface EmailInvoiceDialogProps {
  invoice: Invoice;
  client?: Client;
}

export const EmailInvoiceDialog: React.FC<EmailInvoiceDialogProps> = ({ invoice, client }) => {
  const [open, setOpen] = useState(false);
  const { contacts } = useContacts(client?.id || '');
  const { items } = useInvoiceItems(invoice.id);

  // Get primary contact or first contact
  const primaryContact = contacts?.find(contact => contact.is_primary) || contacts?.[0];

  const {
    email,
    setEmail,
    subject,
    setSubject,
    message,
    setMessage,
    sending,
    sendEmail
  } = useEmailInvoice(invoice, client, primaryContact, items);

  const handleSendEmail = async () => {
    const success = await sendEmail();
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail size={16} className="mr-2" />
          Email Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Email Invoice</DialogTitle>
          <DialogDescription>
            Send invoice {invoice.invoice_number} to {client?.company || 'your customer'}
          </DialogDescription>
        </DialogHeader>
        
        <EmailForm
          email={email}
          setEmail={setEmail}
          subject={subject}
          setSubject={setSubject}
          message={message}
          setMessage={setMessage}
          sending={sending}
          onSend={handleSendEmail}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
