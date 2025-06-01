
import React from 'react';
import { Users, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProjectTeamMembers } from '@/hooks/useProjectTeamMembers';
import { TeamMemberSelector } from '@/components/TeamMemberSelector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProjectTeamProps {
  projectId: string;
}

export const ProjectTeam: React.FC<ProjectTeamProps> = ({ projectId }) => {
  const [isManaging, setIsManaging] = React.useState(false);
  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);
  const { 
    projectTeamMembers, 
    isLoading, 
    assignTeamMember, 
    removeTeamMember,
    isAssigning,
    isRemoving 
  } = useProjectTeamMembers(projectId);

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleRemoveTeamMember = (memberId: string) => {
    setSelectedMembers(prev => prev.filter(id => id !== memberId));
  };

  const handleAssignSelected = () => {
    selectedMembers.forEach(memberId => {
      const isAlreadyAssigned = projectTeamMembers.some(ptm => ptm.user_id === memberId);
      if (!isAlreadyAssigned) {
        assignTeamMember({ projectId, teamMemberId: memberId });
      }
    });
    setSelectedMembers([]);
    setIsManaging(false);
  };

  const handleRemoveFromProject = (memberId: string) => {
    removeTeamMember({ projectId, teamMemberId: memberId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Dialog open={isManaging} onOpenChange={setIsManaging}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Team Members</DialogTitle>
                <DialogDescription>
                  Select team members to assign to this project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <TeamMemberSelector
                  selectedMembers={selectedMembers}
                  onMemberToggle={handleTeamMemberToggle}
                  onRemoveMember={handleRemoveTeamMember}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsManaging(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAssignSelected}
                    disabled={selectedMembers.length === 0 || isAssigning}
                  >
                    {isAssigning ? 'Assigning...' : 'Assign Selected'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {projectTeamMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members assigned</h3>
            <p className="text-gray-600 text-sm">Assign team members to collaborate on this project.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectTeamMembers.map((ptm) => (
              <div key={ptm.id} className="flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${ptm.user.gradient} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                    {ptm.user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{ptm.user.name}</div>
                    <div className="text-xs text-gray-500">{ptm.user.role}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromProject(ptm.user_id)}
                  disabled={isRemoving}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
