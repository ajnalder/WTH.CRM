
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Users, X } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface TeamMemberSelectorProps {
  selectedMembers: string[];
  onMemberToggle: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export const TeamMemberSelector: React.FC<TeamMemberSelectorProps> = ({
  selectedMembers,
  onMemberToggle,
  onRemoveMember,
}) => {
  const { teamMembers } = useTeamMembers();

  const selectedTeamMembers = teamMembers.filter(member => 
    selectedMembers.includes(member.id)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Add Team Members
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Select Team Members</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.id}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => onMemberToggle(member.id)}
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      <div className={`w-6 h-6 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <label htmlFor={member.id} className="text-sm font-medium cursor-pointer">
                          {member.name}
                        </label>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {selectedTeamMembers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTeamMembers.map((member) => (
            <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
              <div className={`w-4 h-4 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                {member.avatar}
              </div>
              {member.name}
              <button
                onClick={() => onRemoveMember(member.id)}
                className="ml-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
