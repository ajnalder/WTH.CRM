
import React, { useState } from 'react';
import { ChecklistList } from '@/components/checklists/ChecklistList';
import { ChecklistForm } from '@/components/checklists/ChecklistForm';
import type { ChecklistTemplate, ClientChecklistWithClient } from '@/types/checklist';

const SiteLaunch = () => {
  const [selectedChecklist, setSelectedChecklist] = useState<ClientChecklistWithClient | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);

  const handleViewChecklist = (checklist: ClientChecklistWithClient, template: ChecklistTemplate) => {
    setSelectedChecklist(checklist);
    setSelectedTemplate(template);
  };

  const handleBackToList = () => {
    setSelectedChecklist(null);
    setSelectedTemplate(null);
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {selectedChecklist && selectedTemplate ? (
        <ChecklistForm
          checklist={selectedChecklist}
          template={selectedTemplate}
          clientName={selectedChecklist.client.company}
          onBack={handleBackToList}
        />
      ) : (
        <div className="p-6">
          <div className="mb-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Site Launch</h1>
            <p className="text-gray-600 mt-2">
              Manage site launch checklists for Shopify and Webflow clients
            </p>
          </div>
          <ChecklistList onViewChecklist={handleViewChecklist} />
        </div>
      )}
    </div>
  );
};

export default SiteLaunch;
