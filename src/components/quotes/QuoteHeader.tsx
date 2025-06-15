
import React, { useState } from 'react';
import { Quote } from '@/types/quoteTypes';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useClients } from '@/hooks/useClients';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';

interface QuoteHeaderProps {
  quote: Quote;
}

export const QuoteHeader: React.FC<QuoteHeaderProps> = ({ quote }) => {
  const { settings } = useCompanySettings();
  const { clients } = useClients();
  const { user } = useAuth();
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  
  // Find the client for this quote
  const client = clients.find(c => c.id === quote.client_id);
  
  // Get contacts for the client
  const { contacts } = useContacts(quote.client_id || '');
  
  // Get primary contact or first contact
  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundImage(result);
        console.log('Background image loaded:', result.substring(0, 100) + '...');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => {
    setBackgroundImage('');
  };

  const triggerFileUpload = () => {
    const fileInput = document.getElementById('background-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const backgroundStyle = backgroundImage 
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};

  return (
    <div 
      className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-8 rounded-lg mb-6 min-h-[300px] relative"
      style={backgroundStyle}
    >
      {/* Background Image Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={triggerFileUpload}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Upload className="w-4 h-4 mr-2" />
          Background
        </Button>
        <Input
          id="background-upload"
          type="file"
          accept="image/*"
          onChange={handleBackgroundUpload}
          className="hidden"
        />
        {backgroundImage && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={removeBackgroundImage}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Top Row - Two Columns */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center">
          {settings?.logo_base64 && (
            <img 
              src={settings.logo_base64} 
              alt={settings.company_name} 
              className="h-16 w-auto filter brightness-0 invert"
            />
          )}
        </div>
        
        <h3 className="text-xl font-bold text-white">
          Prepared For {client?.company || "[Client Name]"}
        </h3>
      </div>

      {/* Middle Row - Centered Title */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white">{quote.title}</h1>
      </div>

      {/* Bottom Row - Two Columns */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-300 text-sm mb-1">By</p>
          <p className="font-medium text-white">
            {user?.email || "Team Member"} - Team Member
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-gray-300 text-sm mb-1">Contact</p>
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
  );
};
