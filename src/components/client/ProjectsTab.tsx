
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjects } from '@/hooks/useProjects';
import { useProjectTeamMembers } from '@/hooks/useProjectTeamMembers';
import { useTasks } from '@/hooks/useTasks';
import { transformProject } from '@/utils/projectUtils';
import { ProjectCompletionDialog } from '@/components/project/ProjectCompletionDialog';

interface Client {
  id: string;
  company: string;
}

interface ProjectsTabProps {
  client: Client;
}

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

const ProjectCard = ({ project, tasks }: { project: any; tasks: any[] }) => {
  const { projectTeamMembers } = useProjectTeamMembers(project.id);

  const daysUntilDue = project.dueDate
    ? Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null;

  const projectTasks = tasks.filter(task => task.project === project.name);
  const completedTasks = projectTasks.filter(task => task.status === 'Completed' || task.status === 'Done').length;

  const shouldShowBudget = project.budget !== null && 
                          project.budget !== undefined && 
                          Number(project.budget) > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <ProjectCompletionDialog
              projectId={project.id}
              projectName={project.name}
              currentStatus={project.status}
            />
            <Link to={`/projects/${project.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
          </div>
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
          {project.name}
        </CardTitle>
        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <CheckCircle size={16} />
            <span>{completedTasks}/{projectTasks.length} tasks</span>
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
              {projectTeamMembers?.slice(0, 3).map((member, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 bg-gradient-to-r ${member.user.gradient || 'from-blue-400 to-blue-600'} rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white`}
                >
                  {member.user.avatar || member.user.name?.charAt(0) || 'U'}
                </div>
              ))}
              {projectTeamMembers && projectTeamMembers.length > 3 && (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                  +{projectTeamMembers.length - 3}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Users size={14} />
              <span>{projectTeamMembers?.length || 0}</span>
            </div>
          </div>
        </div>

        {shouldShowBudget && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Budget</span>
              <span className="font-medium">${Number(project.budget).toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProjectsTab = ({ client }: ProjectsTabProps) => {
  const { projects, isLoading } = useProjects(client.id);
  const { tasks } = useTasks();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Transform projects for display
  const transformedProjects = projects.map(project => {
    const projectWithClients = {
      ...project,
      clients: { company: client.company, name: client.company }
    };
    
    return transformProject(projectWithClients);
  });

  // Separate active and completed projects
  const activeProjects = transformedProjects.filter(project => project.status !== 'Completed');
  const completedProjects = transformedProjects.filter(project => project.status === 'Completed');

  const renderProjectsSection = (projectsList: typeof transformedProjects, emptyMessage: string) => {
    if (projectsList.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectsList.map((project) => (
            <ProjectCard key={project.id} project={project} tasks={tasks} />
          ))}
        </div>
      );
    } else {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      );
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects for {client.company}</h2>
        <p className="text-gray-600">Manage and view all projects for this client</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="active">
            Active Projects ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Projects ({completedProjects.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {renderProjectsSection(
            activeProjects, 
            "No active projects found for this client."
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {renderProjectsSection(
            completedProjects, 
            "No completed projects for this client yet."
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectsTab;
