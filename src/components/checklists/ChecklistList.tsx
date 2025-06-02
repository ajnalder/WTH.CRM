import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useChecklists } from '@/hooks/useChecklists';
import { useClients } from '@/hooks/useClients';
import type { ChecklistTemplate, ClientChecklistWithClient } from '@/types/checklist';

interface ChecklistListProps {
  onViewChecklist: (checklist: ClientChecklistWithClient, template: ChecklistTemplate) => void;
}

export const ChecklistList: React.FC<ChecklistListProps> = ({ onViewChecklist }) => {
  const { clientChecklists, templates, createChecklist, templatesLoading, checklistsLoading } = useChecklists();
  const { clients } = useClients();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleCreateChecklist = async () => {
    if (!selectedClient || !selectedTemplate) return;
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    createChecklist({
      clientId: selectedClient,
      templateId: selectedTemplate,
      templateName: template.name
    });
    
    // Reset selections
    setSelectedClient('');
    setSelectedTemplate('');
  };

  const getCompletionStats = (checklist: ClientChecklistWithClient) => {
    const completedItems = checklist.completed_items || [];
    const template = templates.find(t => t.id === checklist.template_id);
    const totalItems = template?.items?.length || 0;
    const completed = completedItems.length;
    const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
    
    return { completed, total: totalItems, percentage };
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage === 100) return <CheckCircle className="text-green-600" size={20} />;
    if (percentage > 0) return <Clock className="text-orange-600" size={20} />;
    return <AlertCircle className="text-gray-400" size={20} />;
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage === 100) return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
    if (percentage > 0) return <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>;
    return <Badge variant="secondary">Not Started</Badge>;
  };

  const isLoading = templatesLoading || checklistsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Create New Checklist */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="text-blue-600" size={20} />
            Create New Checklist
          </CardTitle>
          <p className="text-gray-600 text-sm">Start a new site launch checklist for a client</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCreateChecklist}
              disabled={!selectedClient || !selectedTemplate}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus size={16} className="mr-2" />
              Create Checklist
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Checklists */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Existing Checklists</CardTitle>
          <p className="text-gray-600 text-sm">Manage and view site launch checklists</p>
        </CardHeader>
        <CardContent>
          {clientChecklists.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No checklists yet</h3>
              <p className="text-gray-600">Create your first checklist to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientChecklists.map((checklist) => {
                const template = templates.find(t => t.id === checklist.template_id);
                const stats = getCompletionStats(checklist);
                
                return (
                  <Card key={checklist.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{checklist.client.company}</h3>
                          <p className="text-sm text-gray-600">{template?.name}</p>
                        </div>
                        {getStatusIcon(stats.percentage)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{stats.completed}/{stats.total} items</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                        <div className="text-center text-sm font-medium text-gray-700">
                          {stats.percentage}% Complete
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {getStatusBadge(stats.percentage)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewChecklist(checklist, template!)}
                          className="hover:bg-blue-50"
                        >
                          <Eye size={16} className="mr-2 text-blue-600" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
