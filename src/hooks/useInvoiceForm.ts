import { useState, useEffect } from 'react';
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
  const { createInvoice, invoices } = useInvoices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
  
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

  // Compute next invoice number from existing invoices
  useEffect(() => {
    let nextNumber = 5057;
    invoices
      .filter((inv) => inv.invoice_number?.startsWith('INV-'))
      .forEach((inv) => {
        const current = parseInt(inv.invoice_number.replace('INV-', ''));
        if (!isNaN(current) && current >= nextNumber) {
          nextNumber = current + 1;
        }
      });

    const numberString = `INV-${nextNumber}`;
    setNextInvoiceNumber(numberString);
    if (!formData.invoice_number && !initialData?.invoice_number) {
      setFormData(prev => ({
        ...prev,
        invoice_number: numberString
      }));
    }
  }, [invoices, initialData?.invoice_number, formData.invoice_number]);

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
      invoice_number: nextInvoiceNumber,
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
      // Use the form's invoice number or generate a new one if empty
      const invoiceNumber = formData.invoice_number || nextInvoiceNumber;
      
      const result = await new Promise((resolve, reject) => {
        createInvoice({
          ...formData,
          invoice_number: invoiceNumber,
          project_id: formData.project_id || undefined,
          due_date: formData.due_date || undefined,
          issued_date: formData.issued_date || undefined,
        }, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error)
        });
      });
      
      return result;
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
    nextInvoiceNumber,
  };
};
