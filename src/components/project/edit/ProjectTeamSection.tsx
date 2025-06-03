
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { TeamMemberSelector } from '@/components/TeamMemberSelector';

interface ProjectTeamSectionProps {
  selectedMembers: string[];
  onMemberToggle: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export const ProjectTeamSection: React.FC<ProjectTeamSectionProps> = ({
  selectedMembers,
  onMemberToggle,
  onRemoveMember,
}) => {
  return (
    <div className="space-y-4">
      <FormLabel>Assigned Team Members</FormLabel>
      <TeamMemberSelector
        selectedMembers={selectedMembers}
        onMemberToggle={onMemberToggle}
        onRemoveMember={onRemoveMember}
      />
    </div>
  );
};
