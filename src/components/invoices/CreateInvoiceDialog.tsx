
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInvoices } from '@/hooks/useInvoices';
import { useProjects } from '@/hooks/useProjects';
import { Client } from '@/hooks/useClients';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
}

export const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({
  open,
  onOpenChange,
  clients,
}) => {
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    invoice_number: '',
    title: '',
    description: '',
    deposit_percentage: 50,
    gst_rate: 15,
    due_date: '',
  });

  const { createInvoice } = useInvoices();
  const { projects } = useProjects();

  const selectedClientProjects = projects.filter(
    project => project.client_id === formData.client_id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate invoice number if not provided
    const invoiceNumber = formData.invoice_number || `INV-${Date.now()}`;
    
    createInvoice({
      ...formData,
      invoice_number: invoiceNumber,
      project_id: formData.project_id || undefined,
      due_date: formData.due_date || undefined,
    });
    
    // Reset form and close dialog
    setFormData({
      client_id: '',
      project_id: '',
      invoice_number: '',
      title: '',
      description: '',
      deposit_percentage: 50,
      gst_rate: 15,
      due_date: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value, project_id: '' })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                disabled={!formData.client_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClientProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Invoice Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Website Development Services"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional invoice details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deposit_percentage">Deposit Percentage (%)</Label>
              <Input
                id="deposit_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.deposit_percentage}
                onChange={(e) => setFormData({ ...formData, deposit_percentage: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst_rate">GST Rate (%)</Label>
              <Input
                id="gst_rate"
                type="number"
                min="0"
                max="30"
                value={formData.gst_rate}
                onChange={(e) => setFormData({ ...formData, gst_rate: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
