
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const { teamMembers } = useTeamMembers();

  // Find the current team member by ID
  const currentTeamMember = teamMembers.find(member => member.id === currentAssignee);

  const handleAssigneeChange = (value: string) => {
    if (value === 'unassigned') {
      onAssigneeUpdate(null);
    } else if (value !== currentAssignee) {
      onAssigneeUpdate(value);
    }
  };

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2">Team Member</h3>
      <Select 
        value={currentAssignee || 'unassigned'} 
        onValueChange={handleAssigneeChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {currentTeamMember ? (
              <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                <div className={`w-4 h-4 bg-gradient-to-r ${currentTeamMember.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                  {currentTeamMember.avatar}
                </div>
                {currentTeamMember.name}
              </Badge>
            ) : (
              <span className="text-gray-500">No team member assigned</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          <SelectItem value="unassigned">
            <span className="text-gray-500">No team member assigned</span>
          </SelectItem>
          {teamMembers.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                  {member.avatar}
                </div>
                {member.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
