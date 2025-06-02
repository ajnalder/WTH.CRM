
import React from 'react';
import { Calendar, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClients } from '@/hooks/useClients';
import { Project } from '@/hooks/useProjects';

interface ProjectTableProps {
  projects: Project[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Review':
      return 'bg-yellow-100 text-yellow-800';
    case 'Planning':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const ProjectTable: React.FC<ProjectTableProps> = ({ projects }) => {
  const { clients } = useClients();

  const getClientInitials = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return 'UK';
    return client.company
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.company || 'Unknown Client';
  };

  const getClientGradient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.gradient || 'from-blue-400 to-blue-600';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => {
          const daysUntilDue = project.due_date 
            ? Math.ceil((new Date(project.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
            : null;
          const clientGradient = getClientGradient(project.client_id);
          
          return (
            <TableRow key={project.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                  {project.description && (
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {project.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${clientGradient} flex items-center justify-center text-white text-xs font-semibold`}>
                    {getClientInitials(project.client_id)}
                  </div>
                  <span className="text-sm text-gray-600">{getClientName(project.client_id)}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>
                    {daysUntilDue !== null 
                      ? (daysUntilDue > 0 ? `${daysUntilDue} days` : 'Overdue')
                      : 'No due date'
                    }
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {project.team_members?.slice(0, 3).map((member, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white`}
                      >
                        {member.avatar}
                      </div>
                    ))}
                    {project.team_members && project.team_members.length > 3 && (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                        +{project.team_members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Users size={14} />
                    <span>{project.team_members?.length || 0}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">
                  {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'No budget'}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
