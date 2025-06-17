
import { useState } from 'react';
import { TaskPlanningHeader } from "@/components/task-planning/TaskPlanningHeader";
import { TaskPlanningControls } from "@/components/task-planning/TaskPlanningControls";
import { TaskPool } from "@/components/task-planning/TaskPool";
import { ScheduledTasksList } from "@/components/task-planning/ScheduledTasksList";
import { useTaskPlanning } from "@/hooks/useTaskPlanning";

const ProjectPlanning = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMoveTaskUp = (taskId: string) => {
    const task = scheduledTasks.find(t => t.id === taskId);
    if (task && task.order_index > 0) {
      updateTaskOrder(taskId, task.order_index - 1);
    }
  };

  const handleMoveTaskDown = (taskId: string) => {
    const task = scheduledTasks.find(t => t.id === taskId);
    if (task && task.order_index < scheduledTasks.length - 1) {
      updateTaskOrder(taskId, task.order_index + 1);
    }
  };

  return (
    <div className="p-6 space-y-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  );
};

export default ProjectPlanning;
