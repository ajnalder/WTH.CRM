
import React from 'react';
import { TaskStatsCards } from '@/components/tasks/TaskStatsCards';
import { TaskControls } from '@/components/tasks/TaskControls';
import { MobileTaskSection } from '@/components/tasks/MobileTaskSection';
import { TaskSection } from '@/components/tasks/TaskSection';
import { MobileContainer } from '@/components/ui/mobile-container';
import { useTasksPage } from '@/hooks/useTasksPage';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

const Tasks = () => {
  const {
    isLoading,
    error,
    filteredActiveTasks,
    filteredCompletedTasks,
    statusCounts,
    searchTerm,
    statusFilter,
    sortBy,
    viewMode,
    setSearchTerm,
    setStatusFilter,
    setSortBy,
    setViewMode,
    handleTaskCreated
  } = useTasksPage();

  const { isMobileDevice, isOnline } = useMobileOptimization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <MobileContainer>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Tasks</h1>
          <p className="text-gray-600 mb-4">There was an error loading the tasks.</p>
          {!isOnline && (
            <p className="text-red-600 text-sm">You appear to be offline. Please check your connection.</p>
          )}
        </div>
      </MobileContainer>
    );
  }

  const TaskSectionComponent = isMobileDevice ? MobileTaskSection : TaskSection;

  return (
    <div className="space-y-6">
      {/* Header */}
      <MobileContainer>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">Manage and track all project tasks</p>
          {!isOnline && (
            <p className="text-amber-600 text-sm mt-2">Offline mode - some features may be limited</p>
          )}
        </div>
      </MobileContainer>

      {/* Stats Cards */}
      <TaskStatsCards statusCounts={statusCounts} />

      {/* Controls */}
      <TaskControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onTaskCreated={handleTaskCreated}
      />

      {/* Active Tasks */}
      <TaskSectionComponent
        title="Active Tasks"
        tasks={filteredActiveTasks}
        viewMode={viewMode}
        onRefresh={isMobileDevice ? () => window.location.reload() : undefined}
      />

      {/* Completed Tasks */}
      {filteredCompletedTasks.length > 0 && (
        <TaskSectionComponent
          title="Finished Tasks"
          tasks={filteredCompletedTasks}
          viewMode={viewMode}
          isCompleted={true}
        />
      )}
    </div>
  );
};

export default Tasks;
