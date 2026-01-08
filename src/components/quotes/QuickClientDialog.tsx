import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const createClientMutation = useConvexMutation(api.clients.create);
  const createContactMutation = useConvexMutation(api.contacts.create);

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

    if (!user) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return;
    }

    setIsCreating(true);

    try {
      // Create the client
      const client = await createClientMutation({
        userId: user.id,
        company: formData.company.trim(),
      });

      // Create the primary contact
      await createContactMutation({
        userId: user.id,
        client_id: client.id,
        name: formData.contactName.trim(),
        email: formData.contactEmail.trim(),
        phone: formData.contactPhone.trim() || undefined,
        is_primary: true,
        email_subscribed: true,
      });

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
