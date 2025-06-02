
import React from 'react';
import { TeamMemberSelector } from '@/components/TeamMemberSelector';

interface NewTaskTeamMemberSectionProps {
  selectedTeamMembers: string[];
  onMemberToggle: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export const NewTaskTeamMemberSection: React.FC<NewTaskTeamMemberSectionProps> = ({
  selectedTeamMembers,
  onMemberToggle,
  onRemoveMember
}) => {
  return (
    <div>
      <label className="text-sm font-medium">Assign Team Members</label>
      <div className="mt-2">
        <TeamMemberSelector
          selectedMembers={selectedTeamMembers}
          onMemberToggle={onMemberToggle}
          onRemoveMember={onRemoveMember}
        />
      </div>
    </div>
  );
};
