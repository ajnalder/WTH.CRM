
import React, { useState } from 'react';
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

  const handleMoveTaskUp = (taskId: string) => {
    const taskIndex = scheduledTasks.findIndex(t => t.id === taskId);
    if (taskIndex > 0) {
      updateTaskOrder(taskId, taskIndex - 1);
    }
  };

  const handleMoveTaskDown = (taskId: string) => {
    const taskIndex = scheduledTasks.findIndex(t => t.id === taskId);
    if (taskIndex < scheduledTasks.length - 1) {
      updateTaskOrder(taskId, taskIndex + 1);
    }
  };

  return (
    <div className={isMobileDevice ? "px-2 py-1 space-y-2 overflow-x-hidden" : "space-y-6"}>
      <TaskPlanningHeader
        totalAvailable={availableTasks.length}
        totalScheduled={scheduledTasks.length}
        totalAllocatedMinutes={getTotalAllocatedTime()}
      />

      {/* Date Navigation */}
      <div className="bg-white rounded-lg border p-4">
        <div className={isMobileDevice ? "space-y-3" : "flex items-center justify-between"}>
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
          <div className={isMobileDevice ? "flex flex-wrap gap-1" : "flex items-center gap-2"}>
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              {isMobileDevice ? "Previous" : "Previous Day"}
            </Button>
            {!isToday && (
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              {isMobileDevice ? "Next" : "Next Day"}
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

      {isMobileDevice ? (
        // Mobile Layout: Scheduled tasks first, then available tasks
        <div className="space-y-3 min-w-0">
          {/* Schedule Section */}
          <div className="space-y-2 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              {isToday ? "Today's Schedule" : "Scheduled Tasks"} ({scheduledTasks.length})
            </h2>
            <ScheduledTasksList
              tasks={scheduledTasks}
              onTimeAllocationChange={updateTaskAllocation}
              onMarkComplete={markTaskComplete}
              onUnscheduleTask={unscheduleTask}
              onMoveTaskUp={handleMoveTaskUp}
              onMoveTaskDown={handleMoveTaskDown}
              getAssigneeName={getAssigneeName}
              getClientName={getClientName}
              getClientGradient={getClientGradient}
              getClientInitials={getClientInitials}
              isUpdating={isUpdating}
            />
          </div>

          {/* Available Tasks Section */}
          <div className="space-y-2 min-w-0">
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
                onMoveTaskUp={handleMoveTaskUp}
                onMoveTaskDown={handleMoveTaskDown}
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
    </div>
  );
};

export default DayPlanner;
