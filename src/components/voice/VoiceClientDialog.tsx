
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useClientMutations } from '@/hooks/useClientMutations';
import { toProperCase } from '@/utils/textFormatting';

interface ClientFormData {
  company: string;
  phone: string;
  industry: string;
}

interface VoiceClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledData: Record<string, any>;
}

export const VoiceClientDialog: React.FC<VoiceClientDialogProps> = ({
  open,
  onOpenChange,
  prefilledData
}) => {
  const { createClient, isCreating } = useClientMutations();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ClientFormData>({
    defaultValues: {
      company: '',
      phone: '',
      industry: ''
    }
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

  // Pre-fill form with voice command data and format it properly
  useEffect(() => {
    if (open && prefilledData) {
      if (prefilledData.company) setValue('company', toProperCase(prefilledData.company));
      if (prefilledData.phone) setValue('phone', prefilledData.phone);
      if (prefilledData.industry) setValue('industry', prefilledData.industry);
    }
  }, [open, prefilledData, setValue]);

  const onSubmit = async (data: ClientFormData) => {
    createClient({
      company: data.company.trim(),
      phone: data.phone.trim(),
      industry: data.industry || 'Other'
    });
    
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Client from Voice Command</DialogTitle>
          <DialogDescription>
            I've filled in what I understood from your voice command. Complete any missing information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              placeholder="Enter company name"
              {...register('company', { required: 'Company name is required' })}
            />
            {errors.company && (
              <p className="text-sm text-red-600">{errors.company.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              {...register('phone')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select onValueChange={(value) => setValue('industry', value)} value={watch('industry')}>
              <SelectTrigger>
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
