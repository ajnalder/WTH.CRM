
import React from 'react';
import { Calendar, Users, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { getStatusColor } from '@/utils/projectUtils';
import { useClients } from '@/hooks/useClients';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  gradient: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  dueDate: string;
  team: string[];
  priority: string;
  tasks: { completed: number; total: number };
  description: string;
  budget: number;
  startDate: string;
  team_members?: TeamMember[];
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { clients } = useClients();
  
  // Find the client by name to get their gradient color and avatar
  const client = clients.find(c => c.company === project.client);
  const clientGradient = client?.gradient || 'from-blue-400 to-blue-600';
  
  // Extract the base color from the gradient for the card background with more prominent tint
  const getCardBackgroundClass = (gradient: string) => {
    if (gradient.includes('blue')) return 'bg-blue-50/80 border-blue-200/80';
    if (gradient.includes('green')) return 'bg-green-50/80 border-green-200/80';
    if (gradient.includes('purple')) return 'bg-purple-50/80 border-purple-200/80';
    if (gradient.includes('red')) return 'bg-red-50/80 border-red-200/80';
    if (gradient.includes('yellow')) return 'bg-yellow-50/80 border-yellow-200/80';
    if (gradient.includes('pink')) return 'bg-pink-50/80 border-pink-200/80';
    if (gradient.includes('indigo')) return 'bg-indigo-50/80 border-indigo-200/80';
    if (gradient.includes('teal')) return 'bg-teal-50/80 border-teal-200/80';
    if (gradient.includes('orange')) return 'bg-orange-50/80 border-orange-200/80';
    if (gradient.includes('cyan')) return 'bg-cyan-50/80 border-cyan-200/80';
    if (gradient.includes('lime')) return 'bg-lime-50/80 border-lime-200/80';
    if (gradient.includes('rose')) return 'bg-rose-50/80 border-rose-200/80';
    if (gradient.includes('emerald')) return 'bg-emerald-50/80 border-emerald-200/80';
    if (gradient.includes('amber')) return 'bg-amber-50/80 border-amber-200/80';
    if (gradient.includes('violet')) return 'bg-violet-50/80 border-violet-200/80';
    if (gradient.includes('sky')) return 'bg-sky-50/80 border-sky-200/80';
    if (gradient.includes('fuchsia')) return 'bg-fuchsia-50/80 border-fuchsia-200/80';
    return 'bg-blue-50/80 border-blue-200/80'; // default
  };

  const getTimeRemaining = (dueDate: string) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', urgent: true };
    if (diffDays === 0) return { text: 'Due today', urgent: true };
    if (diffDays === 1) return { text: '1 day left', urgent: true };
    if (diffDays <= 7) return { text: `${diffDays} days left`, urgent: false };
    return { text: `${diffDays} days left`, urgent: false };
  };

  const timeRemaining = getTimeRemaining(project.dueDate);

  // Use real team_members data if available, fallback to legacy team data
  const teamMembers = project.team_members || [];
  const displayTeam = teamMembers.length > 0 ? teamMembers : project.team;

  // Use the stored avatar from the client database, fallback to generated initials
  const getClientAvatar = () => {
    if (client?.avatar) {
      return client.avatar;
    }
    // Fallback: generate from client name
    const companyName = project.client.trim();
    const words = companyName.split(/\s+/);
    
    if (words.length === 1) {
      // Single word: use first 2 letters
      return companyName.substring(0, 2).toUpperCase();
    } else {
      // Multiple words: use first letter of each word (up to 2)
      return words
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase();
    }
  };

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${getCardBackgroundClass(clientGradient)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${clientGradient} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
                {getClientAvatar()}
              </div>
              <div>
                <div className="text-sm text-gray-600">{project.client}</div>
              </div>
            </div>
            <Badge variant="secondary" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
            {project.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <CheckCircle2 size={16} className="text-green-500" />
              <span className="text-gray-600">
                {project.tasks.completed}/{project.tasks.total} tasks
              </span>
            </div>
          </div>

          {timeRemaining && (
            <div className={`flex items-center space-x-1 text-sm ${
              timeRemaining.urgent ? 'text-red-600' : 'text-gray-600'
            }`}>
              <Clock size={16} />
              <span className={timeRemaining.urgent ? 'font-medium' : ''}>{timeRemaining.text}</span>
            </div>
          )}

          {displayTeam && displayTeam.length > 0 && (
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-gray-400" />
              <div className="flex -space-x-1">
                {teamMembers.length > 0 ? (
                  // Show real team member avatars
                  teamMembers.slice(0, 3).map((member, index) => (
                    <div
                      key={member.id}
                      className={`w-6 h-6 bg-gradient-to-r ${member.gradient} rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium`}
                    >
                      {member.avatar}
                    </div>
                  ))
                ) : (
                  // Fallback to legacy string-based team data
                  project.team.slice(0, 3).map((member, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                    >
                      {member}
                    </div>
                  ))
                )}
                {displayTeam.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs text-white font-medium">
                    +{displayTeam.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
