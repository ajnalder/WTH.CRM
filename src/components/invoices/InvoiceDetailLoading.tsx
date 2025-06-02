
import React from 'react';

export const InvoiceDetailLoading = () => {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
};
