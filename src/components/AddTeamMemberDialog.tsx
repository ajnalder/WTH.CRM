
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AddTeamMemberDialogProps {
  onAddMember?: () => void;
}

export const AddTeamMemberDialog = ({ onAddMember }: AddTeamMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoToSettings = () => {
    setOpen(false);
    navigate('/settings');
    toast({
      title: "Redirected to Settings",
      description: "Use the Team Management tab to create new team member accounts.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setOpen(true)}
        >
          <Plus size={16} />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center">
            <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Team Management</h3>
            <p className="text-gray-600 mb-4">
              Team member accounts are now created through the Settings page for better security and control.
            </p>
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGoToSettings}>
              Go to Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
