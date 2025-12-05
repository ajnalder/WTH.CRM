import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useInvoices } from '@/hooks/useInvoices';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TaskBillingProps {
  taskId: string;
  clientId: string;
  clientName?: string;
  taskTitle: string;
  taskDescription?: string | null;
  billableAmount?: number | null;
  onBillableAmountChange: (amount: number | null) => void;
}

export const TaskBilling = ({
  taskId,
  clientId,
  clientName,
  taskTitle,
  taskDescription,
  billableAmount,
  onBillableAmountChange,
}: TaskBillingProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createInvoice } = useInvoices();
  const [amount, setAmount] = useState(billableAmount?.toString() || '');
  const [description, setDescription] = useState(taskDescription || taskTitle);
  const [isCreating, setIsCreating] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  
  // Hook for adding items - only called when we have an invoice ID
  const { addItem } = useInvoiceItems(createdInvoiceId || '');

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value);
    onBillableAmountChange(isNaN(numValue) ? null : numValue);
  };

  const generateNextInvoiceNumber = async () => {
    try {
      const { data: latestInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .like('invoice_number', 'INV-%')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let nextNumber = 5057;

      if (latestInvoice?.invoice_number) {
        const currentNumber = parseInt(latestInvoice.invoice_number.replace('INV-', ''));
        if (!isNaN(currentNumber) && currentNumber >= 5057) {
          nextNumber = currentNumber + 1;
        }
      }

      return `INV-${nextNumber}`;
    } catch (error) {
      return 'INV-5057';
    }
  };

  const handleCreateInvoice = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid billable amount",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Generate sequential invoice number
      const invoiceNumber = await generateNextInvoiceNumber();
      
      // Create the invoice
      const invoice = await createInvoice({
        client_id: clientId,
        invoice_number: invoiceNumber,
        title: `Task: ${taskTitle}`,
        description: `Invoice for task: ${taskTitle}`,
        gst_rate: 15,
        due_date: null,
        issued_date: new Date().toISOString().split('T')[0],
      });

      if (invoice) {
        const invoiceId = (invoice as { id: string }).id;
        
        // Add the line item to the invoice
        await addItem({
          invoice_id: invoiceId,
          description: description,
          quantity: 1,
          rate: numAmount,
          amount: numAmount,
        });

        toast({
          title: "Invoice Created",
          description: "Draft invoice created with line item. Review and send when ready.",
        });
        navigate(`/invoices/${invoiceId}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Receipt className="w-4 h-4" />
        Create Invoice
      </div>
      
      <p className="text-xs text-muted-foreground">
        Bill this task to {clientName || 'client'}
      </p>

      <div className="space-y-3">
        <div>
          <Label htmlFor="billable-amount" className="text-xs">Amount (NZD)</Label>
          <Input
            id="billable-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="mt-1"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <Label htmlFor="billing-description" className="text-xs">Description</Label>
          <Textarea
            id="billing-description"
            placeholder="Invoice line item description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 min-h-[60px]"
            rows={2}
          />
        </div>

        <Button
          onClick={handleCreateInvoice}
          disabled={!amount || parseFloat(amount) <= 0 || isCreating}
          className="w-full"
          size="sm"
        >
          <FileText className="w-4 h-4 mr-2" />
          {isCreating ? 'Creating...' : 'Create Draft Invoice'}
        </Button>
      </div>
    </div>
  );
};
