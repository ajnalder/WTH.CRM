
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useClients } from '@/hooks/useClients';

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

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/80 backdrop-blur-sm cursor-pointer">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${clientGradient} flex items-center justify-center text-white text-xs font-semibold`}>
                  {getClientInitials(project.client)}
                </div>
                <span className="text-sm text-gray-600">{project.client}</span>
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
        </CardHeader>

        <CardContent className="space-y-4">
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

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
                {project.team?.slice(0, 3).map((member, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 bg-gradient-to-r ${member.gradient || 'from-blue-400 to-blue-600'} rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white`}
                  >
                    {member.avatar || member.name?.charAt(0) || 'U'}
                  </div>
                ))}
                {project.team && project.team.length > 3 && (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                    +{project.team.length - 3}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Users size={14} />
                <span>{project.team?.length || 0}</span>
              </div>
            </div>
          </div>

          {project.budget && (
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
