
import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { TaskPlanningHeader } from '@/components/task-planning/TaskPlanningHeader';
import { TaskPlanningControls } from '@/components/task-planning/TaskPlanningControls';
import { TaskPool } from '@/components/task-planning/TaskPool';
import { ScheduledTasksList } from '@/components/task-planning/ScheduledTasksList';
import { VoiceCommandButton } from '@/components/voice/VoiceCommandButton';
import { VoiceDialogManager } from '@/components/voice/VoiceDialogManager';
import { useTaskPlanning } from '@/hooks/useTaskPlanning';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

const DayPlanner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { isMobileDevice } = useMobileOptimization();
  
  const {
    availableTasks,
    scheduledTasks,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    getTotalAllocatedTime,
    getAssigneeName,
    getClientName,
    getClientGradient,
    getClientInitials,
    scheduleTask,
    unscheduleTask,
    updateTaskOrder,
    updateTaskAllocation,
    markTaskComplete,
    isUpdating,
  } = useTaskPlanning(selectedDate);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Moving from task pool to scheduled tasks
    if (source.droppableId === 'task-pool' && destination.droppableId === 'scheduled-tasks') {
      scheduleTask(draggableId);
    }
    // Moving from scheduled tasks back to task pool
    else if (source.droppableId === 'scheduled-tasks' && destination.droppableId === 'task-pool') {
      unscheduleTask(draggableId);
    }
    // Reordering within scheduled tasks
    else if (source.droppableId === 'scheduled-tasks' && destination.droppableId === 'scheduled-tasks') {
      if (source.index !== destination.index) {
        updateTaskOrder(draggableId, destination.index);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className={isMobileDevice ? "px-4 py-3 space-y-3" : "space-y-6"}>
      <TaskPlanningHeader
        totalAvailable={availableTasks.length}
        totalScheduled={scheduledTasks.length}
        totalAllocatedMinutes={getTotalAllocatedTime()}
      />

      {/* Date Navigation */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </h2>
            {!isToday && (
              <span className="text-sm text-gray-500">
                (Planning for future date)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              Previous Day
            </Button>
            {!isToday && (
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              Next Day
            </Button>
          </div>
        </div>
      </div>

      <TaskPlanningControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        {isMobileDevice ? (
          // Mobile Layout: Scheduled tasks first, then available tasks
          <div className="space-y-4">
            {/* Schedule Section */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                {isToday ? "Today's Schedule" : "Scheduled Tasks"} ({scheduledTasks.length})
              </h2>
              <ScheduledTasksList
                tasks={scheduledTasks}
                onTimeAllocationChange={updateTaskAllocation}
                onMarkComplete={markTaskComplete}
                onUnscheduleTask={unscheduleTask}
                getAssigneeName={getAssigneeName}
                getClientName={getClientName}
                getClientGradient={getClientGradient}
                getClientInitials={getClientInitials}
                isUpdating={isUpdating}
              />
            </div>

            {/* Available Tasks Section */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Available Tasks ({availableTasks.length})
              </h2>
              <TaskPool
                tasks={availableTasks}
                onTimeAllocationChange={updateTaskAllocation}
                onMarkComplete={markTaskComplete}
                onScheduleTask={scheduleTask}
                getAssigneeName={getAssigneeName}
                getClientName={getClientName}
                getClientGradient={getClientGradient}
                getClientInitials={getClientInitials}
                isUpdating={isUpdating}
              />
            </div>
          </div>
        ) : (
          // Desktop Layout: Side by side
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Tasks Pool */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Available Tasks ({availableTasks.length})
              </h2>
              <TaskPool
                tasks={availableTasks}
                onTimeAllocationChange={updateTaskAllocation}
                onMarkComplete={markTaskComplete}
                onScheduleTask={scheduleTask}
                getAssigneeName={getAssigneeName}
                getClientName={getClientName}
                getClientGradient={getClientGradient}
                getClientInitials={getClientInitials}
                isUpdating={isUpdating}
              />
            </div>

            {/* Schedule - Now Sticky */}
            <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                {isToday ? "Today's Schedule" : "Scheduled Tasks"} ({scheduledTasks.length})
              </h2>
              <div className="lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
                <ScheduledTasksList
                  tasks={scheduledTasks}
                  onTimeAllocationChange={updateTaskAllocation}
                  onMarkComplete={markTaskComplete}
                  onUnscheduleTask={unscheduleTask}
                  getAssigneeName={getAssigneeName}
                  getClientName={getClientName}
                  getClientGradient={getClientGradient}
                  getClientInitials={getClientInitials}
                  isUpdating={isUpdating}
                />
              </div>
            </div>
          </div>
        )}
      </DragDropContext>
    </div>
  );
};

export default DayPlanner;
