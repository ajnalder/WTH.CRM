
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddTeamMemberDialogProps {
  onAddMember?: () => void;
}

export const AddTeamMemberDialog = ({ onAddMember }: AddTeamMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Generate a simple invite link (in a real app, you'd store this in the database)
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/auth?email=${encodeURIComponent(email)}`;
    setInviteLink(inviteUrl);

    toast({
      title: "Invitation created!",
      description: "Share the invitation link with your team member so they can sign up.",
      duration: 8000,
    });

    // Notify parent component
    onAddMember?.();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied!",
      description: "Invitation link copied to clipboard",
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setInviteLink('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        
        {!inviteLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter team member's email"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Invitation
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  onClick={copyToClipboard}
                  variant="outline"
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Share this link with your team member so they can sign up with the suggested email address.
              </p>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
