import React from 'react';
import { Calendar, Users, Flag } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Project {
  id: string; // Changed from number to string to match UUID
  name: string;
  client: string;
  status: string;
  progress: number;
  dueDate: string;
  team: string[];
  priority: string;
  tasks: { completed: number; total: number };
}

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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'text-red-600';
    case 'Medium':
      return 'text-yellow-600';
    case 'Low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export const ProjectTable: React.FC<ProjectTableProps> = ({ projects }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Tasks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => {
          const daysUntilDue = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          
          return (
            <TableRow key={project.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">{project.client}</div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress value={project.progress} className="h-2 w-20" />
                  <span className="text-sm text-gray-600">{project.progress}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{daysUntilDue > 0 ? `${daysUntilDue} days` : 'Overdue'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      >
                        {member}
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Users size={14} />
                    <span>{project.team.length}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Flag className={`${getPriorityColor(project.priority)}`} size={16} />
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">
                  {project.tasks.completed}/{project.tasks.total}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
