
import React, { useState } from 'react';
import { Search, Filter, Plus, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectTable } from '@/components/ProjectTable';

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
    tasks: { completed: 12, total: 18 }
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
    tasks: { completed: 8, total: 15 }
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
    tasks: { completed: 14, total: 16 }
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
    tasks: { completed: 10, total: 10 }
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
    tasks: { completed: 2, total: 12 }
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
    tasks: { completed: 9, total: 12 }
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
    tasks: { completed: 1, total: 20 }
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
    tasks: { completed: 11, total: 16 }
  }
];

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['All', 'Planning', 'In Progress', 'Review', 'Completed'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">Manage and track all your development projects</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search projects or clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List size={18} />
                </button>
              </div>
              
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus size={20} className="mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredProjects.length} Project{filteredProjects.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <ProjectTable projects={filteredProjects} />
          )}

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
