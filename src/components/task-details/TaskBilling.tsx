import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useInvoices } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';

interface TaskBillingProps {
  taskId: string;
  clientId: string;
  clientName?: string;
  taskTitle: string;
  taskDescription?: string | null;
  billableAmount?: number | null;
  billingDescription?: string | null;
  onBillableAmountChange: (amount: number | null) => void;
  onBillingDescriptionChange: (description: string | null) => void;
}

export const TaskBilling = ({
  taskId,
  clientId,
  clientName,
  taskTitle,
  taskDescription,
  billableAmount,
  billingDescription,
  onBillableAmountChange,
  onBillingDescriptionChange,
}: TaskBillingProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createInvoice, invoices } = useInvoices();
  const [amount, setAmount] = useState(billableAmount?.toString() || '');
  const [description, setDescription] = useState(billingDescription || taskDescription || taskTitle);
  const [isCreating, setIsCreating] = useState(false);

  // Use the mutation directly to avoid hook dependency on invoice ID
  const addItemMutation = useConvexMutation(api.invoiceItems.create);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value);
    onBillableAmountChange(isNaN(numValue) ? null : numValue);
  };

  const generateNextInvoiceNumber = () => {
    let nextNumber = 5057;
    invoices
      .filter((inv) => inv.invoice_number?.startsWith('INV-'))
      .forEach((inv) => {
        const current = parseInt(inv.invoice_number.replace('INV-', ''));
        if (!isNaN(current) && current >= nextNumber) {
          nextNumber = current + 1;
        }
      });
    return `INV-${nextNumber}`;
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
      const invoiceNumber = generateNextInvoiceNumber();

      // Calculate totals with GST
      const subtotal = numAmount;
      const gstRate = 15;
      const gstAmount = subtotal * (gstRate / 100);
      const subtotalInclGst = subtotal + gstAmount;
      const totalAmount = subtotalInclGst;

      // Create the invoice with calculated totals
      const invoice = await createInvoice({
        client_id: clientId,
        invoice_number: invoiceNumber,
        title: `Task: ${taskTitle}`,
        description: `Invoice for task: ${taskTitle}`,
        subtotal: subtotal,
        gst_rate: gstRate,
        gst_amount: gstAmount,
        subtotal_incl_gst: subtotalInclGst,
        total_amount: totalAmount,
        balance_due: totalAmount,
        issued_date: new Date().toISOString().split('T')[0],
      });

      if (invoice) {
        const invoiceId = (invoice as { id: string }).id;

        // Add the line item to the invoice
        await addItemMutation({
          invoiceId: invoiceId,
          userId: user?.id,
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
            onBlur={() => onBillingDescriptionChange(description || null)}
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
