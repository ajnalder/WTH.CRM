
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/hooks/useClients';
import { Project } from '@/hooks/useProjects';

interface InvoiceFormFieldsProps {
  formData: {
    client_id: string;
    project_id: string;
    invoice_number: string;
    title: string;
    gst_rate: number;
    due_date: string;
    issued_date?: string;
  };
  onFieldChange: (field: string, value: any) => void;
  clients: Client[];
  projects: Project[];
  showIssuedDate?: boolean;
}

export const InvoiceFormFields: React.FC<InvoiceFormFieldsProps> = ({
  formData,
  onFieldChange,
  clients,
  projects,
  showIssuedDate = false,
}) => {
  const selectedClientProjects = projects.filter(
    project => project.client_id === formData.client_id
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="client">Client *</Label>
          <Select
            value={formData.client_id}
            onValueChange={(value) => onFieldChange('client_id', value)}
            required
          >
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
          <Label htmlFor="project">Project (Optional)</Label>
          <Select
            value={formData.project_id}
            onValueChange={(value) => onFieldChange('project_id', value)}
            disabled={!formData.client_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {selectedClientProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            value={formData.invoice_number}
            onChange={(e) => onFieldChange('invoice_number', e.target.value)}
            placeholder="Auto-generated if empty"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Invoice Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            placeholder="e.g., Website Development Services"
            required
          />
        </div>
      </div>

      <div className={`grid grid-cols-1 ${showIssuedDate ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        {showIssuedDate && (
          <div className="space-y-2">
            <Label htmlFor="issued_date">Issue Date</Label>
            <Input
              id="issued_date"
              type="date"
              value={formData.issued_date}
              onChange={(e) => onFieldChange('issued_date', e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => onFieldChange('due_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gst_rate">GST Rate (%)</Label>
          <Input
            id="gst_rate"
            type="number"
            min="0"
            max="30"
            step="0.01"
            value={formData.gst_rate}
            onChange={(e) => onFieldChange('gst_rate', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
};
