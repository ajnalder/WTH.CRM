import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import { InvoiceFormFields } from '@/components/invoices/InvoiceFormFields';

const NewInvoice = () => {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { formData, handleInputChange, submitForm, isSubmitting, isFormValid } = useInvoiceForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await submitForm();
    if (result && typeof result === 'object' && 'id' in result) {
      // Navigate to the invoice detail page in edit mode to add items
      navigate(`/invoices/${result.id}/edit`);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/invoices')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
            <p className="text-gray-600 mt-1">Set up your invoice details and client information</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <InvoiceFormFields
                formData={formData}
                onFieldChange={handleInputChange}
                clients={clients}
                projects={projects}
                showIssuedDate={true}
              />

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/invoices')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !isFormValid}
                >
                  <Save size={16} className="mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewInvoice;
