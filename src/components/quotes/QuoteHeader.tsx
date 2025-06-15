
import React from 'react';
import { Quote } from '@/types/quoteTypes';

interface QuoteHeaderProps {
  quote: Quote;
  companyName?: string;
  contactEmail?: string;
  teamMember?: string;
}

export const QuoteHeader: React.FC<QuoteHeaderProps> = ({
  quote,
  companyName = "Your Agency",
  contactEmail = "contact@youragency.com",
  teamMember = "Your Name - Team Member"
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-8 rounded-lg mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-medium text-gray-300 mb-1">{companyName}</h2>
          <h1 className="text-3xl font-bold mb-4">{quote.title}</h1>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">By</p>
            <p className="font-medium">{teamMember}</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-semibold mb-2">Prepared For [Client Name]</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">Contact</p>
            <p className="font-medium">{contactEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
