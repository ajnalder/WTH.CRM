
import { Project } from '@/hooks/useProjects';

// Transform database project to match the existing interface used in components
export const transformProject = (project: Project & { clients?: { company: string; name: string } }) => {
  return {
    id: project.id, // Keep as string UUID instead of converting to number
    name: project.name,
    client: project.clients?.company || 'Unknown Client',
    status: project.status,
    progress: project.progress || 0,
    dueDate: project.due_date || '',
    team: [], // We'll implement team members later when we add that feature
    priority: project.priority,
    tasks: { completed: 0, total: 1 }, // Placeholder until we implement tasks
    description: project.description || '',
    budget: project.budget || 0,
    startDate: project.start_date || '',
  };
};

export const getProjectById = (id: string, projects: Project[]) => {
  const project = projects.find(p => p.id === id);
  if (!project) return null;
  return transformProject(project);
};

export const getStatusColor = (status: string) => {
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

export const getPriorityColor = (priority: string) => {
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

export const calculateDaysUntilDue = (dueDate: string) => {
  if (!dueDate) return 0;
  return Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
};

export const calculateProjectDuration = (startDate: string, dueDate: string) => {
  if (!startDate || !dueDate) return 0;
  return Math.ceil((new Date(dueDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24));
};
