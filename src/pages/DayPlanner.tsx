
import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { TaskPlanningHeader } from '@/components/task-planning/TaskPlanningHeader';
import { TaskPlanningControls } from '@/components/task-planning/TaskPlanningControls';
import { TaskPool } from '@/components/task-planning/TaskPool';
import { ScheduledTasksList } from '@/components/task-planning/ScheduledTasksList';
import { useTaskPlanning } from '@/hooks/useTaskPlanning';

const DayPlanner = () => {
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
  } = useTaskPlanning();

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

  return (
    <div className="space-y-6">
      <TaskPlanningHeader
        totalAvailable={availableTasks.length}
        totalScheduled={scheduledTasks.length}
        totalAllocatedMinutes={getTotalAllocatedTime()}
      />

      <TaskPlanningControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
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

          {/* Today's Schedule */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Today's Schedule ({scheduledTasks.length})
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
        </div>
      </DragDropContext>
    </div>
  );
};

export default DayPlanner;
