
import React from 'react';
import { CompanySettings } from '@/components/CompanySettings';
import { TeamManagement } from '@/components/TeamManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your company and team settings</p>
      </div>
      
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <CompanySettings />
        </TabsContent>
        
        <TabsContent value="team">
          <TeamManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
