import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Flag, CheckCircle2, Clock, AlertCircle, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

// This would normally come from a data store or API
const getProjectById = (id: string) => {
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

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const project = getProjectById(id!);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(project?.description || '');
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }
  
  const daysUntilDue = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const projectDuration = Math.ceil((new Date(project.dueDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 3600 * 24));
  
  const handleSaveDescription = () => {
    // In a real app, this would update the project in your data store/API
    console.log('Saving description:', editedDescription);
    project.description = editedDescription;
    setIsEditingDescription(false);
  };

  const handleCancelEdit = () => {
    setEditedDescription(project.description);
    setIsEditingDescription(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/projects')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-lg text-gray-600">{project.client}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Flag className={`${getPriorityColor(project.priority)}`} size={20} />
            </div>
          </div>
        </div>

        {/* Project Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">{project.progress}%</div>
              <Progress value={project.progress} className="h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${project.budget.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Team Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{project.team.length}</div>
              <p className="text-sm text-gray-600">members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {daysUntilDue > 0 ? `${daysUntilDue}` : 'Overdue'}
              </div>
              <p className="text-sm text-gray-600">
                {daysUntilDue > 0 ? 'days left' : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Project Description</CardTitle>
                  {!isEditingDescription ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDescription(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveDescription}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingDescription ? (
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="min-h-[100px]"
                    placeholder="Enter project description..."
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-gray-500" size={16} />
                    <span className="text-sm font-medium">Start Date</span>
                  </div>
                  <span className="text-sm text-gray-900">{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-gray-500" size={16} />
                    <span className="text-sm font-medium">Due Date</span>
                  </div>
                  <span className="text-sm text-gray-900">{new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-gray-500" size={16} />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <span className="text-sm text-gray-900">{projectDuration} days</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Team Member {index + 1}</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Task Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-green-500" size={16} />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="text-sm font-medium">{project.tasks.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-blue-500" size={16} />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <span className="text-sm font-medium">{project.tasks.total - project.tasks.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="text-gray-500" size={16} />
                    <span className="text-sm">Total</span>
                  </div>
                  <span className="text-sm font-medium">{project.tasks.total}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((project.tasks.completed / project.tasks.total) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
