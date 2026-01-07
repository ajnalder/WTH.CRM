
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';
import { type TeamMember } from '@/hooks/useTeamMembers';

interface TeamOverviewProps {
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-400';
    case 'away':
      return 'bg-yellow-400';
    case 'offline':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

export const TeamOverview = ({ members, onMemberClick }: TeamOverviewProps) => {
  const navigate = useNavigate();

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Overview</h3>
          <Users className="text-gray-400" size={20} />
        </div>
        
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-600 text-sm">Add your first team member to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Team Overview</h3>
        <Users className="text-gray-400" size={20} />
      </div>
      
      <div className="space-y-4">
        {members.map((member) => (
          <div 
            key={member.id} 
            className={`flex items-center space-x-3 ${onMemberClick ? 'cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors' : ''}`}
            onClick={() => onMemberClick?.(member)}
          >
            <div className="relative">
              <div className={`w-10 h-10 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                {member.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.role}</p>
              <p className="text-xs text-gray-400">{member.current_task || 'No current task'}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                {member.hours_this_week}h
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        Manage Team in Settings
      </button>
    </div>
  );
};
