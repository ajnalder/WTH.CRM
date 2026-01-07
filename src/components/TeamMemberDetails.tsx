
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type TeamMember } from '@/hooks/useTeamMembers';

interface TeamMemberDetailsProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMember: (updatedMember: TeamMember) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export const TeamMemberDetails = ({ member, isOpen, onClose, onUpdateMember }: TeamMemberDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<TeamMember | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (member) {
      setEditedMember(member);
    }
  }, [member]);

  if (!member || !editedMember) return null;

  const handleSave = () => {
    onUpdateMember(editedMember);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Team member updated successfully",
    });
  };

  const handleCancel = () => {
    setEditedMember(member);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Team Member Details
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              {isEditing ? <X size={16} /> : <Edit2 size={16} />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback className={`bg-gradient-to-r ${member.gradient} text-white text-lg font-semibold`}>
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editedMember.name}
                      onChange={(e) => setEditedMember({ ...editedMember, name: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {member.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
          <div>
            <Label htmlFor="role">Title</Label>
            {isEditing ? (
              <Input
                id="role"
                value={editedMember.role}
                onChange={(e) => setEditedMember({ ...editedMember, role: e.target.value })}
                placeholder="Enter a title"
              />
            ) : (
              <p className="text-sm text-gray-600 mt-1">{member.role}</p>
            )}
          </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} />
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedMember.email}
                  onChange={(e) => setEditedMember({ ...editedMember, email: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{member.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select value={editedMember.status} onValueChange={(value) => setEditedMember({ ...editedMember, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600 mt-1 capitalize">{member.status}</p>
              )}
            </div>

            <div>
              <Label htmlFor="currentTask">Current Task</Label>
              {isEditing ? (
                <Input
                  id="currentTask"
                  value={editedMember.current_task || ''}
                  onChange={(e) => setEditedMember({ ...editedMember, current_task: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{member.current_task || 'No current task'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hours" className="flex items-center gap-2">
                <Clock size={16} />
                Hours This Week
              </Label>
              {isEditing ? (
                <Input
                  id="hours"
                  type="number"
                  value={editedMember.hours_this_week}
                  onChange={(e) => setEditedMember({ ...editedMember, hours_this_week: parseInt(e.target.value) || 0 })}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{member.hours_this_week} hours</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
