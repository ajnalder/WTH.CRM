
import React, { useState } from 'react';
import { TeamOverview } from '@/components/TeamOverview';
import { AddTeamMemberDialog } from '@/components/AddTeamMemberDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Mail, Phone } from 'lucide-react';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'John Doe',
      role: 'Full Stack Developer',
      email: 'john@example.com',
      avatar: 'JD',
      status: 'online',
      currentTask: 'E-commerce Platform',
      hoursThisWeek: 32,
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      id: 2,
      name: 'Sarah Miller',
      role: 'UI/UX Designer',
      email: 'sarah@example.com',
      avatar: 'SM',
      status: 'online',
      currentTask: 'Mobile App Redesign',
      hoursThisWeek: 28,
      gradient: 'from-pink-400 to-pink-600',
    },
    {
      id: 3,
      name: 'Alex Lee',
      role: 'Frontend Developer',
      email: 'alex@example.com',
      avatar: 'AL',
      status: 'away',
      currentTask: 'CRM Dashboard',
      hoursThisWeek: 35,
      gradient: 'from-green-400 to-green-600',
    },
    {
      id: 4,
      name: 'Mike Kim',
      role: 'Backend Developer',
      email: 'mike@example.com',
      avatar: 'MK',
      status: 'offline',
      currentTask: 'API Integration',
      hoursThisWeek: 30,
      gradient: 'from-purple-400 to-purple-600',
    },
  ]);

  const handleAddMember = (newMember: { name: string; role: string; email: string }) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
    ];

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const member = {
      id: teamMembers.length + 1,
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      avatar: getInitials(newMember.name),
      status: 'offline',
      currentTask: 'Getting Started',
      hoursThisWeek: 0,
      gradient: gradients[teamMembers.length % gradients.length],
    };

    setTeamMembers([...teamMembers, member]);
  };

  const totalHours = teamMembers.reduce((sum, member) => sum + member.hoursThisWeek, 0);
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
              <TeamOverview members={teamMembers} />
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
    </div>
  );
};

export default Team;
