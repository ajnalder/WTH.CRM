
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types/invoiceTypes';
import { Client } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';
import { useQueryClient } from '@tanstack/react-query';

export const useEmailInvoice = (
  invoice: Invoice,
  client?: Client,
  primaryContact?: any,
  items?: any[]
) => {
  const { toast } = useToast();
  const { updateInvoice } = useInvoices();
  const queryClient = useQueryClient();
  
  const recipientEmail = primaryContact?.email || '';
  const recipientName = primaryContact?.name || client?.company || '';
  const firstName = recipientName.split(' ')[0];

  const [email, setEmail] = useState(recipientEmail);
  const [subject, setSubject] = useState(`Invoice ${invoice.invoice_number} from What the Heck`);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Update email and message when data changes
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

    setSending(true);
    
    try {
      console.log('Sending invoice email with PDF via Supabase Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          to: email.trim(),
          subject: subject,
          message: message,
          invoiceNumber: invoice.invoice_number,
          clientName: client?.company || 'Customer',
          invoiceData: {
            invoice: invoice,
            client: client,
            items: items
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        // Update the invoice to record when it was last emailed
        try {
          await updateInvoice({
            id: invoice.id,
            updates: {
              last_emailed_at: new Date().toISOString(),
              status: invoice.status === 'draft' ? 'sent' : invoice.status
            }
          });
        } catch (updateError) {
          console.warn('Warning: Could not update invoice status, but email was sent successfully:', updateError);
          // Don't throw here - the email was sent successfully
        }

        // Invalidate email logs query to refresh the logs
        queryClient.invalidateQueries({ queryKey: ['email-logs', invoice.id] });

        toast({
          title: "Success",
          description: `Invoice with PDF attachment emailed successfully to ${email}`,
        });
        
        return true;
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Invalidate email logs query even on error to show failed attempts
      queryClient.invalidateQueries({ queryKey: ['email-logs', invoice.id] });
      
      toast({
        title: "Error",
        description: error.message || "Failed to send email. Please try again.",
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
