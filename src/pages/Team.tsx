
import React, { useState } from 'react';
import { TeamOverview } from '@/components/TeamOverview';
import { AddTeamMemberDialog } from '@/components/AddTeamMemberDialog';
import { TeamMemberDetails } from '@/components/TeamMemberDetails';
import { ShadowBox } from '@/components/ui/shadow-box';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Mail, Phone } from 'lucide-react';
import { useTeamMembers, type TeamMember } from '@/hooks/useTeamMembers';

const Team = () => {
  const { teamMembers, isLoading, updateTeamMember, refetch } = useTeamMembers();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleAddMember = () => {
    // Refresh the team members list after adding a new member
    refetch();
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalHours = teamMembers.reduce((sum, member) => sum + member.hours_this_week, 0);
  const onlineMembers = teamMembers.filter(member => member.status === 'online').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their accounts</p>
        </div>
        <AddTeamMemberDialog onAddMember={handleAddMember} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ShadowBox className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users size={20} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
            </div>
            <TeamOverview members={teamMembers} onMemberClick={handleMemberClick} />
          </ShadowBox>
        </div>

        <div className="space-y-6">
          <ShadowBox className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Team Stats</h2>
            <div className="space-y-4">
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
            </div>
          </ShadowBox>

          <ShadowBox className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-white/80">
                <Mail size={16} className="text-blue-600" />
                Send Team Email
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-white/80">
                <Phone size={16} className="text-green-600" />
                Schedule Team Call
              </Button>
            </div>
          </ShadowBox>
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
