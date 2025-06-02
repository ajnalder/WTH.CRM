
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const InvoiceNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
        <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate('/invoices')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Invoices
        </Button>
      </div>
    </div>
  );
};
