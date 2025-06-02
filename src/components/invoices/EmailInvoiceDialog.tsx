
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoiceTypes';
import { Client } from '@/hooks/useClients';
import { useContacts } from '@/hooks/useContacts';
import { supabase } from '@/integrations/supabase/client';

interface EmailInvoiceDialogProps {
  invoice: Invoice;
  client?: Client;
}

export const EmailInvoiceDialog: React.FC<EmailInvoiceDialogProps> = ({ invoice, client }) => {
  const [open, setOpen] = useState(false);
  const { contacts } = useContacts(client?.id || '');
  const { toast } = useToast();

  // Get primary contact or first contact, fallback to client email
  const primaryContact = contacts?.find(contact => contact.is_primary) || contacts?.[0];
  const recipientEmail = primaryContact?.email || client?.email || '';
  const recipientName = primaryContact?.name || client?.name || client?.company || '';
  
  // Extract first name from the full name
  const firstName = recipientName.split(' ')[0];

  const [email, setEmail] = useState(recipientEmail);
  const [subject, setSubject] = useState(`Invoice ${invoice.invoice_number} from What the Heck`);
  const [message, setMessage] = useState(`Hi ${firstName},

Please find attached your invoice ${invoice.invoice_number}.

Thank you for your business!

Best regards,
What the Heck Team`);
  const [sending, setSending] = useState(false);

  // Update email and message when dialog opens
  React.useEffect(() => {
    if (open) {
      const currentEmail = primaryContact?.email || client?.email || '';
      const currentName = primaryContact?.name || client?.name || client?.company || '';
      const currentFirstName = currentName.split(' ')[0];
      
      setEmail(currentEmail);
      setMessage(`Hi ${currentFirstName},

Please find attached your invoice ${invoice.invoice_number}.

Thank you for your business!

Best regards,
What the Heck Team`);
    }
  }, [open, primaryContact, client, invoice.invoice_number]);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    try {
      console.log('Sending invoice email via Supabase Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          to: email.trim(),
          subject: subject,
          message: message,
          invoiceNumber: invoice.invoice_number,
          clientName: client?.company || client?.name || 'Customer'
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Success",
          description: `Invoice emailed successfully to ${email}`,
        });
        
        setOpen(false);
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
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
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Invoice subject"
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={6}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={sending}>
              <Send size={16} className="mr-2" />
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
