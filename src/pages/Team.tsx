
import React from 'react';
import { TeamOverview } from '@/components/TeamOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Mail, Phone } from 'lucide-react';

const Team = () => {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add Team Member
        </Button>
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
              <TeamOverview />
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
                <span className="font-semibold">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Online Now</span>
                <span className="font-semibold text-green-600">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Hours This Week</span>
                <span className="font-semibold">125h</span>
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
