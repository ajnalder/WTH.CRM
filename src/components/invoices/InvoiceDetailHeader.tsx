
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const InvoiceDetailHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate('/invoices')} className="mb-4">
        <ArrowLeft size={16} className="mr-2" />
        Back to Invoices
      </Button>
    </div>
  );
};
