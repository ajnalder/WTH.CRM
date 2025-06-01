
import React, { useState } from 'react';
import { TeamOverview } from '@/components/TeamOverview';
import { AddTeamMemberDialog } from '@/components/AddTeamMemberDialog';
import { TeamMemberDetails } from '@/components/TeamMemberDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Mail, Phone } from 'lucide-react';
import { useTeamMembers, type TeamMember } from '@/hooks/useTeamMembers';

const Team = () => {
  const { teamMembers, isLoading, createTeamMember, updateTeamMember } = useTeamMembers();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleAddMember = (newMember: { name: string; role: string; email: string }) => {
    createTeamMember(newMember);
  };

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDetailsOpen(true);
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    updateTeamMember(updatedMember);
    setSelectedMember(updatedMember);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const totalHours = teamMembers.reduce((sum, member) => sum + member.hours_this_week, 0);
  const onlineMembers = teamMembers.filter(member => member.status === 'online').length;

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
        </div>
        <AddTeamMemberDialog onAddMember={handleAddMember} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeamOverview members={teamMembers} onMemberClick={handleMemberClick} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Members</span>
                <span className="font-semibold">{teamMembers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Online Now</span>
                <span className="font-semibold text-green-600">{onlineMembers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Hours This Week</span>
                <span className="font-semibold">{totalHours}h</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mail size={16} />
                Send Team Email
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Phone size={16} />
                Schedule Team Call
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <TeamMemberDetails
        member={selectedMember}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUpdateMember={handleUpdateMember}
      />
    </div>
  );
};

export default Team;
