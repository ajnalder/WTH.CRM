
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TeamMemberSelector } from '@/components/TeamMemberSelector';
import { Edit, X, Check } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface TaskAssigneeEditorProps {
  currentAssignee: string | null;
  onAssigneeUpdate: (assignee: string | null) => void;
  isUpdating: boolean;
}

export const TaskAssigneeEditor: React.FC<TaskAssigneeEditorProps> = ({
  currentAssignee,
  onAssigneeUpdate,
  isUpdating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    currentAssignee ? [currentAssignee] : []
  );
  const { teamMembers } = useTeamMembers();

  const currentTeamMember = teamMembers.find(member => member.id === currentAssignee);

  const handleToggleMember = (memberId: string) => {
    // For now, we only support single assignee, so replace the current selection
    setSelectedMembers([memberId]);
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers([]);
  };

  const handleSave = () => {
    const newAssignee = selectedMembers.length > 0 ? selectedMembers[0] : null;
    onAssigneeUpdate(newAssignee);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedMembers(currentAssignee ? [currentAssignee] : []);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Assign Team Member</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdating}
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <TeamMemberSelector
          selectedMembers={selectedMembers}
          onMemberToggle={handleToggleMember}
          onRemoveMember={handleRemoveMember}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">Assignee</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          disabled={isUpdating}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
      {currentTeamMember ? (
        <Badge variant="secondary" className="flex items-center gap-2 w-fit">
          <div className={`w-4 h-4 bg-gradient-to-r ${currentTeamMember.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
            {currentTeamMember.avatar}
          </div>
          {currentTeamMember.name}
        </Badge>
      ) : (
        <p className="text-gray-500">No assignee</p>
      )}
    </div>
  );
};
