import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoiceTypes';
import { Client } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { useAction } from 'convex/react';
import { api } from '@/integrations/convex/api';

export const useEmailInvoice = (
  invoice: Invoice,
  client?: Client,
  primaryContact?: any,
  items?: any[]
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const sendInvoiceEmail = useAction(api.invoices.sendInvoiceEmail);
  
  const recipientEmail = primaryContact?.email || '';
  const recipientName = primaryContact?.name || client?.company || '';
  const firstName = recipientName.split(' ')[0];

  const [email, setEmail] = useState(recipientEmail);
  const [subject, setSubject] = useState(`Invoice ${invoice.invoice_number} from What the Heck`);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const currentEmail = primaryContact?.email || '';
    const currentName = primaryContact?.name || client?.company || '';
    const currentFirstName = currentName.split(' ')[0];
    
    setEmail(currentEmail);
    setMessage(`Hi ${currentFirstName},

Please find attached your invoice ${invoice.invoice_number}.

Thank you for your business!

Best regards,
What the Heck Team`);
  }, [primaryContact, client, invoice.invoice_number]);

  const sendEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return false;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to send email",
        variant: "destructive",
      });
      return false;
    }

    setSending(true);
    
    try {
      await sendInvoiceEmail({
        userId: user.id,
        invoiceId: invoice.id,
        to: email.trim(),
        subject,
        message,
      });

      toast({
        title: "Success",
        description: `Email logged for ${email}`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to send email",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    email,
    setEmail,
    subject,
    setSubject,
    message,
    setMessage,
    sending,
    sendEmail
  };
};
