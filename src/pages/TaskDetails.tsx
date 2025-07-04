
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, User, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTask } from '@/hooks/useTask';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { TaskEditDialog } from '@/components/task-details/TaskEditDialog';
import { TaskStatusDropdown } from '@/components/task-details/TaskStatusDropdown';
import { TaskTimeManagement } from '@/components/task-details/TaskTimeManagement';
import { TaskTimeEntries } from '@/components/task-details/TaskTimeEntries';
import { TaskFiles } from '@/components/task-details/TaskFiles';
import { TaskNotes } from '@/components/task-details/TaskNotes';

const TaskDetails = () => {
  const { id } = useParams();
  const [timerHours, setTimerHours] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteTask, isDeleting } = useTasks();
  const { teamMembers } = useTeamMembers();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  console.log('TaskDetails - Task ID:', id);

  const { 
    task, 
    isLoading: taskLoading, 
    error: taskError, 
    updateTaskDetails, 
    isUpdatingDetails,
    updateTaskStatus,
    isUpdatingStatus,
    updateTaskNotes,
    isUpdatingNotes
  } = useTask(id || '');
  const { timeEntries, totalHours, createTimeEntry, isCreating } = useTimeEntries(id || '');

  console.log('TaskDetails - Task data:', task);
  console.log('TaskDetails - Loading:', taskLoading);
  console.log('TaskDetails - Error:', taskError);

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (taskError || !task) {
    console.error('TaskDetails - Error or no task:', taskError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h1>
          <p className="text-gray-600 mb-4">
            {taskError?.message || 'The task could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  const handleTimerComplete = (hours: string) => {
    setTimerHours(hours);
  };

  const handleDeleteTask = () => {
    if (id) {
      deleteTask(id);
    }
  };

  const handleEditTask = (data: { 
    title: string; 
    description: string; 
    assignee: string | null; 
    status: string; 
    due_date: string | null; 
    dropbox_url: string | null;
    client_id: string | null;
    project: string | null;
  }) => {
    updateTaskDetails(data);
  };

  const handleStatusUpdate = (status: string) => {
    updateTaskStatus(status);
  };

  const handleNotesUpdate = (notes: string) => {
    updateTaskNotes(notes);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between bg-card border rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Link
              to="/tasks"
              className="inline-flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Tasks
            </Link>
            
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
              {task.client_name && (
                <span className="text-sm text-muted-foreground">
                  {task.client_name}
                </span>
              )}
              {task.project && (
                <span className="text-sm text-muted-foreground">
                  • {task.project}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowEditDialog(true)}
              disabled={isUpdatingDetails}
            >
              <Edit2 size={16} className="mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Task Title */}
        <div className="bg-card border rounded-lg p-4">
          <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
          {task.description && (
            <p className="text-muted-foreground">{task.description}</p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Task Details & Notes */}
          <div className="lg:col-span-2 space-y-4">
            {/* Task Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Team Member */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <User className="w-4 h-4" />
                  Team Member
                </div>
                {(() => {
                  const currentTeamMember = teamMembers.find(member => member.id === task.assignee);
                  return currentTeamMember ? (
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 bg-gradient-to-r ${currentTeamMember.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                        {currentTeamMember.avatar}
                      </div>
                      <span className="text-sm font-medium">{currentTeamMember.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  );
                })()}
              </div>

              {/* Status */}
              <div className="bg-card border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">Status</div>
                <TaskStatusDropdown
                  currentStatus={task.status}
                  onStatusUpdate={handleStatusUpdate}
                  isUpdating={isUpdatingStatus}
                />
              </div>

              {/* Due Date */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </div>
                <p className="text-sm font-medium">
                  {task.due_date ? format(new Date(task.due_date), 'PPP') : 'No due date'}
                </p>
              </div>
            </div>

            {/* Dropbox Files */}
            {task.dropbox_url && (
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <ExternalLink className="w-4 h-4" />
                  Dropbox Files
                </div>
                <a
                  href={task.dropbox_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
                >
                  View Files <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Task Notes */}
            <div className="bg-card border rounded-lg">
              <TaskNotes
                taskId={id!}
                initialNotes={task.notes}
                onSave={handleNotesUpdate}
                isSaving={isUpdatingNotes}
              />
            </div>

            {/* Time Entries */}
            <div className="bg-card border rounded-lg">
              <TaskTimeEntries timeEntries={timeEntries} />
            </div>
          </div>

          {/* Right Column - Time Management & Files */}
          <div className="space-y-4">
            <div className="bg-card border rounded-lg">
              <TaskTimeManagement
                totalHours={totalHours}
                taskId={id!}
                createTimeEntry={createTimeEntry}
                isCreating={isCreating}
                onTimerComplete={handleTimerComplete}
                initialHours={timerHours}
                onHoursChange={setTimerHours}
              />
            </div>

            <div className="bg-card border rounded-lg">
              <TaskFiles taskId={id!} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <TaskEditDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleEditTask}
        isUpdating={isUpdatingDetails}
      />

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskDetails;
