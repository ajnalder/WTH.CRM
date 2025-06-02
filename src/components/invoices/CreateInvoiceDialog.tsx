
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { Client } from '@/hooks/useClients';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import { InvoiceFormFields } from './InvoiceFormFields';

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
  const { projects } = useProjects();
  const { formData, handleInputChange, resetForm, submitForm, isSubmitting, isFormValid } = useInvoiceForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitForm();
    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <InvoiceFormFields
            formData={formData}
            onFieldChange={handleInputChange}
            clients={clients}
            projects={projects}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isFormValid}>
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
