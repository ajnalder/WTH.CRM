
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeamMembers, type TeamMember } from '@/hooks/useTeamMembers';
import { CreateTeamMemberDialog } from '@/components/CreateTeamMemberDialog';
import { TeamMemberDetails } from '@/components/TeamMemberDetails';
import { Users, User } from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const { teamMembers, isLoading, updateTeamMember } = useTeamMembers();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleManageMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedMember(null);
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    updateTeamMember(updatedMember);
    setSelectedMember(updatedMember);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Team Members</h3>
            <p className="text-sm text-gray-600">
              Manage user accounts and access to the system
            </p>
          </div>
          <CreateTeamMemberDialog />
        </div>

        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${member.gradient} flex items-center justify-center text-white font-medium`}>
                  {member.avatar}
                </div>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-600">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  {member.role}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleManageMember(member)}
                >
                  Manage
                </Button>
              </div>
            </div>
          ))}
          
          {teamMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No team members found. Create the first team member to get started.
            </div>
          )}
        </div>
        <TeamMemberDetails
          member={selectedMember}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onUpdateMember={handleUpdateMember}
        />
      </CardContent>
    </Card>
  );
};
