
import React from 'react';
import { TaskPlanningHeader } from '@/components/task-planning/TaskPlanningHeader';
import { TaskPlanningControls } from '@/components/task-planning/TaskPlanningControls';
import { TaskPlanningList } from '@/components/task-planning/TaskPlanningList';
import { useTaskPlanning } from '@/hooks/useTaskPlanning';

const DayPlanner = () => {
  const {
    tasks,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    getTotalAllocatedTime,
    getAssigneeName,
    updateTaskOrder,
    updateTaskAllocation,
    markTaskComplete,
    isUpdating,
  } = useTaskPlanning();

  return (
    <div className="space-y-6">
      <TaskPlanningHeader
        totalTasks={tasks.length}
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

      <TaskPlanningList
        tasks={tasks}
        onTaskOrderChange={updateTaskOrder}
        onTimeAllocationChange={updateTaskAllocation}
        onMarkComplete={markTaskComplete}
        getAssigneeName={getAssigneeName}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default DayPlanner;
