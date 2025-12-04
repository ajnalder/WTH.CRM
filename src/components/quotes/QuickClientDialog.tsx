import React, { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface QuickClientDialogProps {
  onClientCreated: (clientId: string, contactName: string, contactEmail: string) => void;
}

export function QuickClientDialog({ onClientCreated }: QuickClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company.trim()) {
      toast({ title: 'Error', description: 'Company name is required', variant: 'destructive' });
      return;
    }
    
    if (!formData.contactName.trim() || !formData.contactEmail.trim()) {
      toast({ title: 'Error', description: 'Contact name and email are required', variant: 'destructive' });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      
      // Create the client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          company: formData.company.trim(),
          user_id: user.user.id,
        })
        .select()
        .single();
        
      if (clientError) throw clientError;
      
      // Create the primary contact
      const { error: contactError } = await supabase
        .from('contacts')
        .insert({
          client_id: client.id,
          name: formData.contactName.trim(),
          email: formData.contactEmail.trim(),
          phone: formData.contactPhone.trim() || null,
          is_primary: true,
        });
        
      if (contactError) throw contactError;
      
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({ title: 'Success', description: 'Client and contact created' });
      
      onClientCreated(client.id, formData.contactName.trim(), formData.contactEmail.trim());
      setFormData({ company: '', contactName: '', contactEmail: '', contactPhone: '' });
      setOpen(false);
    } catch (error) {
      console.error('Error creating client:', error);
      toast({ title: 'Error', description: 'Failed to create client', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add Client</DialogTitle>
          <DialogDescription>
            Create a new client with their primary contact details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g., Acme Corporation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="e.g., John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="e.g., john@acme.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="e.g., 021 123 4567"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}