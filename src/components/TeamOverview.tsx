
import React from 'react';
import { Users, Clock } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  status: string;
  currentTask: string;
  hoursThisWeek: number;
  gradient: string;
}

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
              <p className="text-xs text-gray-400">{member.currentTask}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                {member.hoursThisWeek}h
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
        View All Team Members
      </button>
    </div>
  );
};
