
import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClients } from '@/hooks/useClients';

// Use the transformed project interface that matches what we're passing
interface TransformedProject {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  dueDate: string;
  team: any[];
  priority: string;
  tasks: { completed: number; total: number };
  description: string;
  budget: number;
  startDate: string;
  client_id?: string; // Optional for backward compatibility
}

interface ProjectTableProps {
  projects: TransformedProject[];
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

  const getClientInitials = (clientName: string) => {
    return clientName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getClientGradient = (clientName: string) => {
    // Find client by name to get their gradient
    const client = clients.find(c => c.company === clientName);
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
          const daysUntilDue = project.dueDate 
            ? Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
            : null;
          const clientGradient = getClientGradient(project.client);
          
          return (
            <TableRow key={project.id} className="hover:bg-gray-50">
              <TableCell>
                <Link to={`/projects/${project.id}`} className="block hover:text-blue-600 transition-colors">
                  <div className="font-medium text-gray-900">{project.name}</div>
                  {project.description && (
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {project.description}
                    </div>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${clientGradient} flex items-center justify-center text-white text-xs font-semibold`}>
                    {getClientInitials(project.client)}
                  </div>
                  <span className="text-sm text-gray-600">{project.client}</span>
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
