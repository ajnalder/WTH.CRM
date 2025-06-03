
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Mail, Phone, Calendar, DollarSign, Users } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  status: string;
  projects_count: number;
  total_value: number;
  joined_date: string;
  avatar: string;
  gradient: string;
}

interface ClientDetailsProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateClient: (client: Client) => void;
  startInEditMode?: boolean;
}

export const ClientDetails = ({ client, isOpen, onClose, onUpdateClient, startInEditMode = false }: ClientDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    status: '',
  });

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'E-commerce',
    'Manufacturing',
    'Consulting',
    'Real Estate',
    'Non-profit',
    'Other'
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        industry: client.industry,
        status: client.status,
      });
    }
  }, [client]);

  useEffect(() => {
    // Set editing state when dialog opens if startInEditMode is true
    if (isOpen && startInEditMode) {
      setIsEditing(true);
    } else if (!isOpen) {
      // Only reset editing state when dialog closes
      setIsEditing(false);
    }
  }, [isOpen, startInEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client && formData.name && formData.email && formData.company) {
      const updatedClient = {
        ...client,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        industry: formData.industry,
        status: formData.status,
      };
      onUpdateClient(updatedClient);
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleCancel = () => {
    // Reset form data to original client data
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        industry: client.industry,
        status: client.status,
      });
    }
    setIsEditing(false);
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 size={20} />
            Client Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Header */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className={`w-16 h-16 bg-gradient-to-r ${client.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
              {client.avatar}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{client.company}</h3>
              <p className="text-gray-600">{client.industry}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar size={12} className="mr-1" />
                  Joined {new Date(client.joined_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Projects</p>
                  <p className="text-2xl font-bold text-blue-700">{client.projects_count || 0}</p>
                </div>
                <Users className="text-blue-400" size={24} />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-700">${(client.total_value || 0).toLocaleString()}</p>
                </div>
                <DollarSign className="text-green-400" size={24} />
              </div>
            </div>
          </div>

          {/* Client Information Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Contact Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => handleInputChange('industry', value)}
                disabled={!isEditing}
              >
                <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={!isEditing}
              >
                <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              {isEditing ? (
                <>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Client
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
