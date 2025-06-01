
import React from 'react';
import { ProjectCard } from '@/components/ProjectCard';

const projects = [
  {
    id: "1",
    name: 'E-commerce Platform',
    client: 'TechCorp Inc.',
    status: 'In Progress',
    progress: 65,
    dueDate: '2024-07-15',
    team: ['JD', 'SM', 'RJ'],
    priority: 'High',
    tasks: { completed: 12, total: 18 },
    description: 'Building a modern e-commerce platform with React and Node.js',
    budget: 50000,
    startDate: '2024-05-01'
  },
  {
    id: "2",
    name: 'Mobile App Redesign',
    client: 'StartupXYZ',
    status: 'In Progress',
    progress: 40,
    dueDate: '2024-08-01',
    team: ['AL', 'MK'],
    priority: 'Medium',
    tasks: { completed: 8, total: 15 },
    description: 'Complete redesign of mobile application interface',
    budget: 25000,
    startDate: '2024-06-15'
  },
  {
    id: "3",
    name: 'CRM Dashboard',
    client: 'BusinessFlow',
    status: 'Review',
    progress: 90,
    dueDate: '2024-06-20',
    team: ['PL', 'JD', 'TN'],
    priority: 'High',
    tasks: { completed: 14, total: 16 },
    description: 'Custom CRM dashboard with analytics and reporting',
    budget: 35000,
    startDate: '2024-04-01'
  },
  {
    id: "4",
    name: 'Portfolio Website',
    client: 'Creative Agency',
    status: 'Completed',
    progress: 100,
    dueDate: '2024-06-01',
    team: ['SM', 'RJ'],
    priority: 'Low',
    tasks: { completed: 10, total: 10 },
    description: 'Modern portfolio website with interactive galleries',
    budget: 15000,
    startDate: '2024-05-15'
  },
  {
    id: "5",
    name: 'API Integration',
    client: 'DataFlow Systems',
    status: 'Planning',
    progress: 15,
    dueDate: '2024-09-15',
    team: ['MK', 'AL', 'PL'],
    priority: 'Medium',
    tasks: { completed: 2, total: 12 },
    description: 'Integration with third-party APIs and data synchronization',
    budget: 40000,
    startDate: '2024-07-01'
  },
  {
    id: "6",
    name: 'Marketing Landing Page',
    client: 'GrowthHackers',
    status: 'In Progress',
    progress: 75,
    dueDate: '2024-07-10',
    team: ['TN', 'JD'],
    priority: 'High',
    tasks: { completed: 9, total: 12 },
    description: 'High-converting landing page with A/B testing capabilities',
    budget: 20000,
    startDate: '2024-06-01'
  }
];

export const ProjectGrid = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Active Projects</h2>
        <button className="text-blue-600 hover:text-blue-800 font-medium">View All</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};
