import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Eye, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useChecklists } from '@/hooks/useChecklists';
import { useClients } from '@/hooks/useClients';
import { UpdateTemplateButton } from './UpdateTemplateButton';
import type { ChecklistTemplate, ClientChecklistWithClient } from '@/types/checklist';
import { format } from 'date-fns';

interface ChecklistListProps {
  onViewChecklist: (checklist: ClientChecklistWithClient, template: ChecklistTemplate) => void;
}

export const ChecklistList: React.FC<ChecklistListProps> = ({ onViewChecklist }) => {
  const { templates, templatesLoading, clientChecklists, checklistsLoading, createChecklist, deleteChecklist } = useChecklists();
  const { clients } = useClients();
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleCreateChecklist = () => {
    if (!selectedClient || !selectedTemplate) return;
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    createChecklist({
      clientId: selectedClient,
      templateId: selectedTemplate,
      templateName: template.name
    });

    setSelectedClient('');
    setSelectedTemplate('');
  };

  const getProgress = (checklist: ClientChecklistWithClient) => {
    const template = templates.find(t => t.id === checklist.template_id);
    if (!template) return 0;
    return (checklist.completed_items.length / template.items.length) * 100;
  };

  const getTemplate = (templateId: string) => {
    return templates.find(t => t.id === templateId);
  };

  if (templatesLoading || checklistsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Checklist</CardTitle>
              <CardDescription>
                Start a new site launch checklist for a client
              </CardDescription>
            </div>
            <UpdateTemplateButton />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Client</label>
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
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Template</label>
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
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Checklist
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client Checklists</CardTitle>
          <CardDescription>
            Manage site launch checklists for your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientChecklists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No checklists created yet. Create your first checklist above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientChecklists.map((checklist) => {
                  const progress = getProgress(checklist);
                  const template = getTemplate(checklist.template_id);
                  
                  return (
                    <TableRow key={checklist.id}>
                      <TableCell className="font-medium">
                        {checklist.client.company}
                      </TableCell>
                      <TableCell>{checklist.template_name}</TableCell>
                      <TableCell>
                        <Badge variant={checklist.status === 'completed' ? 'default' : 'secondary'}>
                          {checklist.status === 'completed' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              In Progress
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-20" />
                          <span className="text-sm text-muted-foreground">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(checklist.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => template && onViewChecklist(checklist, template)}
                            disabled={!template}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {checklist.status === 'completed' ? 'View' : 'Continue'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteChecklist(checklist.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
