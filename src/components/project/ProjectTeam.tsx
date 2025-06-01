
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Project {
  team: string[];
}

interface ProjectTeamProps {
  project: Project;
}

export const ProjectTeam: React.FC<ProjectTeamProps> = ({ project }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        {project.team.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-600 text-sm">Team members will be added to this project soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.team.map((member, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {member}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Team Member {index + 1}</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
