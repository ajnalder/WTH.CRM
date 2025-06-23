
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanySettings } from '@/components/CompanySettings';
import { TeamManagement } from '@/components/TeamManagement';
import { XeroIntegrationCard } from '@/components/invoices/XeroIntegrationCard';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CompanySettings />
          <XeroIntegrationCard />
        </div>
        
        <div>
          <TeamManagement />
        </div>
      </div>
    </div>
  );
};

export default Settings;
