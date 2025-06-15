
import React from 'react';
import { Quote } from '@/types/quoteTypes';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useClients } from '@/hooks/useClients';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/contexts/AuthContext';

interface QuoteHeaderProps {
  quote: Quote;
}

export const QuoteHeader: React.FC<QuoteHeaderProps> = ({ quote }) => {
  const { settings } = useCompanySettings();
  const { clients } = useClients();
  const { user } = useAuth();
  
  // Find the client for this quote
  const client = clients.find(c => c.id === quote.client_id);
  
  // Get contacts for the client
  const { contacts } = useContacts(quote.client_id || '');
  
  // Get primary contact or first contact
  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-8 rounded-lg mb-6">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-6">
          {/* Company Logo */}
          {settings?.logo_base64 && (
            <div className="flex-shrink-0">
              <img 
                src={settings.logo_base64} 
                alt={settings.company_name} 
                className="h-12 w-auto filter brightness-0 invert"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-lg font-medium text-white">
                {settings?.company_name || "Your Agency"}
              </h2>
              <h1 className="text-4xl font-bold text-white">{quote.title}</h1>
            </div>
            
            <div className="space-y-1">
              <p className="text-gray-300 text-sm">By</p>
              <p className="font-medium text-white">
                {user?.email || "Team Member"} - Team Member
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <h3 className="text-2xl font-bold mb-4 text-white">
            Prepared For {client?.company || "[Client Name]"}
          </h3>
          <div className="space-y-1">
            <p className="text-gray-300 text-sm">Contact</p>
            <p className="font-medium text-white text-lg">
              {primaryContact?.email || "contact@clientcompany.com"}
            </p>
            {primaryContact?.name && (
              <p className="text-gray-300 text-sm">
                {primaryContact.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
