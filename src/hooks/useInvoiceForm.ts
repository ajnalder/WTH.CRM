
import { useState } from 'react';
import { useInvoices } from '@/hooks/useInvoices';

interface InvoiceFormData {
  client_id: string;
  project_id: string;
  invoice_number: string;
  title: string;
  gst_rate: number;
  due_date: string;
  issued_date?: string;
}

export const useInvoiceForm = (initialData?: Partial<InvoiceFormData>) => {
  const { createInvoice } = useInvoices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: '',
    project_id: '',
    invoice_number: '',
    title: '',
    gst_rate: 15,
    due_date: '',
    issued_date: new Date().toISOString().split('T')[0],
    ...initialData,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset project when client changes
    if (field === 'client_id') {
      setFormData(prev => ({
        ...prev,
        client_id: value,
        project_id: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      project_id: '',
      invoice_number: '',
      title: '',
      gst_rate: 15,
      due_date: '',
      issued_date: new Date().toISOString().split('T')[0],
      ...initialData,
    });
  };

  const submitForm = async () => {
    if (!formData.client_id || !formData.title) {
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Generate invoice number if not provided
      const invoiceNumber = formData.invoice_number || `INV-${Date.now()}`;
      
      await createInvoice({
        ...formData,
        invoice_number: invoiceNumber,
        project_id: formData.project_id || undefined,
        due_date: formData.due_date || undefined,
        issued_date: formData.issued_date || undefined,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating invoice:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.client_id && formData.title;

  return {
    formData,
    handleInputChange,
    resetForm,
    submitForm,
    isSubmitting,
    isFormValid,
  };
};
