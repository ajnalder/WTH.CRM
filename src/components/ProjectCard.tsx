
import React from 'react';
import { Calendar, Users, Flag } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

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

interface ProjectCardProps {
  project: Project;
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

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const daysUntilDue = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  
  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };
  
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
          <p className="text-sm text-gray-600">{project.client}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <Flag className={`${getPriorityColor(project.priority)}`} size={16} />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2" />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{daysUntilDue > 0 ? `${daysUntilDue} days` : 'Overdue'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>{project.team.length} members</span>
          </div>
        </div>
        <div className="text-xs">
          {project.tasks.completed}/{project.tasks.total} tasks
        </div>
      </div>
      
      <div className="flex -space-x-2 mt-3">
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
    </div>
  );
};
