
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTask } from '@/hooks/useTask';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useTasks } from '@/hooks/useTasks';
import { TaskDetailsHeader } from '@/components/task-details/TaskDetailsHeader';
import { TaskDetailsMain } from '@/components/task-details/TaskDetailsMain';
import { TaskTimeSummary } from '@/components/task-details/TaskTimeSummary';
import { TaskTimeTracker } from '@/components/task-details/TaskTimeTracker';
import { TaskTimeLogger } from '@/components/task-details/TaskTimeLogger';
import { TaskTimeEntries } from '@/components/task-details/TaskTimeEntries';

const TaskDetails = () => {
  const { id } = useParams();
  const [timerHours, setTimerHours] = useState('');
  const { deleteTask, isDeleting } = useTasks();

  console.log('TaskDetails - Task ID:', id);

  const { 
    task, 
    isLoading: taskLoading, 
    error: taskError, 
    updateTaskDetails, 
    isUpdatingDetails
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
    dropbox_url: string | null 
  }) => {
    updateTaskDetails(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <TaskDetailsHeader 
          task={task} 
          onDelete={handleDeleteTask}
          isDeleting={isDeleting}
          onEdit={handleEditTask}
          isUpdatingDetails={isUpdatingDetails}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <TaskDetailsMain task={task} />

            <TaskTimeEntries timeEntries={timeEntries} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TaskTimeSummary totalHours={totalHours} />

            <TaskTimeTracker onTimerComplete={handleTimerComplete} />

            <TaskTimeLogger
              taskId={id!}
              createTimeEntry={createTimeEntry}
              isCreating={isCreating}
              initialHours={timerHours}
              onHoursChange={setTimerHours}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
