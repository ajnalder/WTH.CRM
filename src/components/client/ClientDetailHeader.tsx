
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ClientDetailHeaderProps {
  onBackClick: () => void;
  clientCompany: string;
  clientIndustry?: string;
  clientAvatar?: string;
  clientGradient?: string;
}

const ClientDetailHeader = ({
  onBackClick,
  clientCompany,
  clientIndustry,
  clientAvatar,
  clientGradient
}: ClientDetailHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBackClick}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Clients
        </Button>
        <div className={`w-12 h-12 bg-gradient-to-r ${clientGradient || 'from-blue-400 to-blue-600'} rounded-full flex items-center justify-center text-white font-bold`}>
          {clientAvatar || clientCompany.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{clientCompany}</h1>
          <p className="text-gray-600">{clientIndustry}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailHeader;
