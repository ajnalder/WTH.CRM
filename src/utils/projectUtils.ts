
// Project data and utility functions
export const getProjectById = (id: string) => {
  const projects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      client: 'TechCorp Inc.',
      status: 'In Progress',
      progress: 65,
      dueDate: '2024-07-15',
      team: ['JD', 'SM', 'RJ'],
      priority: 'High',
      tasks: { completed: 12, total: 18 },
      description: 'A comprehensive e-commerce platform with modern UI/UX, payment integration, and inventory management.',
      budget: 75000,
      startDate: '2024-02-01',
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      client: 'StartupXYZ',
      status: 'In Progress',
      progress: 40,
      dueDate: '2024-08-01',
      team: ['AL', 'MK'],
      priority: 'Medium',
      tasks: { completed: 8, total: 15 },
      description: 'Complete redesign of mobile application with improved user experience and modern design patterns.',
      budget: 45000,
      startDate: '2024-03-15',
    },
    {
      id: 3,
      name: 'CRM Dashboard',
      client: 'BusinessFlow',
      status: 'Review',
      progress: 90,
      dueDate: '2024-06-20',
      team: ['PL', 'JD', 'TN'],
      priority: 'High',
      tasks: { completed: 14, total: 16 },
      description: 'Customer relationship management dashboard with analytics and reporting features.',
      budget: 60000,
      startDate: '2024-01-10',
    },
    {
      id: 4,
      name: 'Portfolio Website',
      client: 'Creative Agency',
      status: 'Completed',
      progress: 100,
      dueDate: '2024-06-01',
      team: ['SM', 'RJ'],
      priority: 'Low',
      tasks: { completed: 10, total: 10 },
      description: 'Professional portfolio website showcasing creative work with interactive galleries.',
      budget: 25000,
      startDate: '2024-04-01',
    },
    {
      id: 5,
      name: 'API Integration',
      client: 'DataFlow Systems',
      status: 'Planning',
      progress: 15,
      dueDate: '2024-09-15',
      team: ['MK', 'AL', 'PL'],
      priority: 'Medium',
      tasks: { completed: 2, total: 12 },
      description: 'Integration of multiple third-party APIs for data synchronization and workflow automation.',
      budget: 35000,
      startDate: '2024-05-20',
    },
    {
      id: 6,
      name: 'Marketing Landing Page',
      client: 'GrowthHackers',
      status: 'In Progress',
      progress: 75,
      dueDate: '2024-07-10',
      team: ['TN', 'JD'],
      priority: 'High',
      tasks: { completed: 9, total: 12 },
      description: 'High-converting landing page with A/B testing capabilities and analytics integration.',
      budget: 20000,
      startDate: '2024-05-01',
    },
    {
      id: 7,
      name: 'Inventory Management System',
      client: 'RetailCorp',
      status: 'Planning',
      progress: 5,
      dueDate: '2024-10-01',
      team: ['AL', 'SM'],
      priority: 'Medium',
      tasks: { completed: 1, total: 20 },
      description: 'Comprehensive inventory management system with real-time tracking and automated reordering.',
      budget: 80000,
      startDate: '2024-06-01',
    },
    {
      id: 8,
      name: 'Customer Support Portal',
      client: 'ServiceHub',
      status: 'In Progress',
      progress: 55,
      dueDate: '2024-08-15',
      team: ['RJ', 'PL', 'TN'],
      priority: 'High',
      tasks: { completed: 11, total: 16 },
      description: 'Self-service customer support portal with ticketing system and knowledge base.',
      budget: 50000,
      startDate: '2024-04-15',
    },
  ];
  
  return projects.find(p => p.id === parseInt(id));
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
  return Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
};

export const calculateProjectDuration = (startDate: string, dueDate: string) => {
  return Math.ceil((new Date(dueDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24));
};
