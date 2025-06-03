
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClients } from '@/hooks/useClients';
import { useProjectTeamMembers } from '@/hooks/useProjectTeamMembers';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  gradient: string;
}

interface Task {
  completed: number;
  total: number;
}

interface TransformedProject {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  dueDate: string;
  team: TeamMember[];
  priority: string;
  tasks: Task;
  description: string;
  budget: number;
  startDate: string;
  isRetainer: boolean;
}

interface ProjectCardProps {
  project: TransformedProject;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Planning':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { clients } = useClients();
  const { projectTeamMembers } = useProjectTeamMembers(project.id);

  const getClientInitials = (clientName: string) => {
    return clientName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getClientGradient = (clientName: string) => {
    const client = clients.find(c => c.company === clientName);
    return client?.gradient || 'from-blue-400 to-blue-600';
  };

  const daysUntilDue = project.dueDate
    ? Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null;

  const clientGradient = getClientGradient(project.client);

  // Extract the base color from the gradient for the card background with tint
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

  // Debug logging to see what budget values we're getting
  console.log('ProjectCard - project name:', project.name);
  console.log('ProjectCard - budget value:', project.budget);
  console.log('ProjectCard - budget type:', typeof project.budget);
  console.log('ProjectCard - is retainer:', project.isRetainer);

  // Check if we should show budget - more explicit condition
  const shouldShowBudget = project.budget !== null && 
                          project.budget !== undefined && 
                          Number(project.budget) > 0;

  console.log('ProjectCard - should show budget:', shouldShowBudget);

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${getCardBackgroundClass(clientGradient)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${clientGradient} flex items-center justify-center text-white text-sm font-semibold`}>
                {getClientInitials(project.client)}
              </div>
              <div>
                <div className="text-sm text-gray-600">{project.client}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                {project.status}
              </Badge>
              <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
            {project.name}
          </CardTitle>
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CheckCircle size={16} />
              <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={16} />
              <span>
                {daysUntilDue !== null 
                  ? (daysUntilDue > 0 ? `${daysUntilDue} days` : 'Overdue')
                  : 'No due date'
                }
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {projectTeamMembers?.slice(0, 3).map((member, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 bg-gradient-to-r ${member.user.gradient || 'from-blue-400 to-blue-600'} rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white`}
                  >
                    {member.user.avatar || member.user.name?.charAt(0) || 'U'}
                  </div>
                ))}
                {projectTeamMembers && projectTeamMembers.length > 3 && (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                    +{projectTeamMembers.length - 3}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Users size={14} />
                <span>{projectTeamMembers?.length || 0}</span>
              </div>
            </div>
          </div>

          {shouldShowBudget && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Budget</span>
                <span className="font-medium">${Number(project.budget).toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
