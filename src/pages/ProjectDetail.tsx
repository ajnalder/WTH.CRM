import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MobileContainer } from '@/components/ui/mobile-container';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { ProjectTimeline } from '@/components/project/ProjectTimeline';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { ProjectTasksList } from '@/components/project/ProjectTasksList';
import { ProjectNotesPanel } from '@/components/project/ProjectNotesPanel';
import { ProjectRemindersPanel } from '@/components/project/ProjectRemindersPanel';
import { TaskCreateDialog } from '@/components/task/TaskCreateDialog';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';
import { transformProject, calculateDaysUntilDue, calculateProjectDuration } from '@/utils/projectUtils';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, isLoading, error, updateProject } = useProjects();
  const { tasks } = useTasks();
  const { clients } = useClients();
  const { invoices } = useInvoices();
  const { isMobileDevice, isOnline } = useMobileOptimization();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <MobileContainer>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </MobileContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <MobileContainer>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Project</h1>
            <p className="text-gray-600 mb-4">There was an error loading the project details.</p>
            {!isOnline && (
              <p className="text-red-600 text-sm mb-4">You appear to be offline. Please check your connection.</p>
            )}
            <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
          </div>
        </MobileContainer>
      </div>
    );
  }
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <MobileContainer>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
          </div>
        </MobileContainer>
      </div>
    );
  }

  const transformedProject = transformProject(project);
  
  // Calculate real task counts for this project
  const projectTasks = tasks.filter(task => task.project === transformedProject.name);
  const completedTasks = projectTasks.filter(task => task.status === 'Completed' || task.status === 'Done').length;
  
  const projectWithRealTasks = {
    ...transformedProject,
    tasks: {
      completed: completedTasks,
      total: projectTasks.length
    }
  };

  // Find the client to get the client_id
  const projectClient = clients.find(c => c.company === transformedProject.client);
  
  // Enhanced project data for the header with all required fields
  const enhancedProject = {
    ...projectWithRealTasks,
    client_id: projectClient?.id || project.client_id,
    is_billable: project.is_billable
  };

  
  const daysUntilDue = transformedProject.dueDate 
    ? calculateDaysUntilDue(transformedProject.dueDate, transformedProject.isRetainer) 
    : 0;
  const projectDuration = transformedProject.startDate && transformedProject.dueDate 
    ? calculateProjectDuration(transformedProject.startDate, transformedProject.dueDate, transformedProject.isRetainer) 
    : 0;

  const handleDueDateUpdate = (dueDate: string | null) => {
    updateProject({
      projectId: transformedProject.id,
      projectData: { due_date: dueDate }
    });
  };


  const handleProjectTypeToggle = (checked: boolean) => {
    updateProject({
      projectId: transformedProject.id,
      projectData: {
        is_retainer: checked,
        is_billable: !checked,
      },
    });
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const projectInvoices = invoices
    .filter((invoice) => invoice.project_id === project.id)
    .sort((a, b) => (b.issued_date || '').localeCompare(a.issued_date || ''));
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className={isMobileDevice ? 'space-y-3' : 'p-6'}>
        <MobileContainer padding="md">
          <ProjectHeader project={enhancedProject} />
        </MobileContainer>
        
        <MobileContainer padding="md">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Badge variant="secondary" className="text-xs">
                      {transformedProject.isRetainer ? 'Retainer' : 'Billable'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Billable</span>
                    <Switch
                      checked={transformedProject.isRetainer}
                      onCheckedChange={handleProjectTypeToggle}
                      className="data-[state=checked]:bg-green-600"
                    />
                    <span className="text-xs text-muted-foreground">Retainer</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Completion</Label>
                  <div className="text-lg font-semibold text-gray-900">
                    {projectWithRealTasks.tasks.completed}/{projectWithRealTasks.tasks.total}
                  </div>
                  <span className="text-xs text-muted-foreground">tasks completed</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {transformedProject.isRetainer ? 'Monthly Retainer Charge' : 'Project Value'}
                  </Label>
                  <div className="text-lg font-semibold text-gray-900">
                    {transformedProject.budget ? `$${Number(transformedProject.budget).toLocaleString()}` : 'Not set'}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {transformedProject.isRetainer ? 'Project Type' : 'Due Date'}
                  </Label>
                  {transformedProject.isRetainer ? (
                    <div className="text-sm text-muted-foreground">Ongoing project</div>
                  ) : (
                    <div className="text-sm text-gray-900">
                      {transformedProject.dueDate
                        ? `${Math.max(daysUntilDue, 0)} days`
                        : 'No due date'}
                    </div>
                  )}
                  {!transformedProject.isRetainer && transformedProject.dueDate && (
                    <button
                      className="text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => handleDueDateUpdate(null)}
                      type="button"
                    >
                      Clear due date
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileContainer>

        <div className={isMobileDevice 
          ? 'space-y-3' 
          : 'grid grid-cols-1 lg:grid-cols-3 gap-6 px-6'
        }>
          <div className={isMobileDevice 
            ? 'space-y-3' 
            : 'lg:col-span-2 space-y-6'
          }>
            <MobileContainer padding="md">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm text-gray-700">
                      {transformedProject.description || 'No description provided.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </MobileContainer>

            <MobileContainer padding="md">
              <ProjectNotesPanel projectId={project.id} />
            </MobileContainer>
            
            <MobileContainer padding="md">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Project Tasks</CardTitle>
                  <TaskCreateDialog 
                    prefilledProject={transformedProject.name}
                    triggerText="Add task"
                    triggerVariant="default"
                  />
                </CardHeader>
                <CardContent>
                  <ProjectTasksList projectName={transformedProject.name} />
                </CardContent>
              </Card>
            </MobileContainer>
            
            {!transformedProject.isRetainer && transformedProject.startDate && transformedProject.dueDate && (
              <MobileContainer padding="md">
                <ProjectTimeline project={transformedProject} projectDuration={projectDuration} />
              </MobileContainer>
            )}
          </div>

          <div className={isMobileDevice ? 'space-y-3' : 'space-y-6'}>
            <MobileContainer padding="md">
              <ProjectTeam projectId={transformedProject.id} />
            </MobileContainer>
            <MobileContainer padding="md">
              <ProjectRemindersPanel projectId={project.id} />
            </MobileContainer>
            <MobileContainer padding="md">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Invoices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projectInvoices.length > 0 ? (
                    projectInvoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between text-sm">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {invoice.invoice_number}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.title}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge className={getInvoiceStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                          <div className="text-xs text-gray-600">
                            ${Number(invoice.total_amount || 0).toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No invoices yet.</p>
                  )}
                  {projectInvoices.length > 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate('/invoices')}
                    >
                      View all invoices
                    </Button>
                  )}
                </CardContent>
              </Card>
            </MobileContainer>
          </div>
        </div>

        {!isOnline && (
          <MobileContainer padding="md">
            <div className="text-center py-4">
              <p className="text-amber-600 text-sm">Offline mode - some features may be limited</p>
            </div>
          </MobileContainer>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
