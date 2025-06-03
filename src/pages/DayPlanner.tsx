
import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { DayPlannerHeader } from '@/components/day-planner/DayPlannerHeader';
import { AddCustomEntryDialog } from '@/components/day-planner/AddCustomEntryDialog';
import { TimelineContainer } from '@/components/day-planner/TimelineContainer';
import { TaskPool } from '@/components/day-planner/TaskPool';
import { useDayPlanner } from '@/hooks/useDayPlanner';
import { Skeleton } from '@/components/ui/skeleton';

const DayPlanner = () => {
  const {
    selectedDate,
    setSelectedDate,
    scheduledTasks,
    isLoading,
    isAddingCustom,
    setIsAddingCustom,
    customTitle,
    setCustomTitle,
    customDuration,
    setCustomDuration,
    customColor,
    setCustomColor,
    getTaskById,
    getClientByName,
    getAssigneeName,
    getUnscheduledTasks,
    handleDragEnd,
    updateTaskDuration,
    updateTaskStartTime,
    addCustomEntry,
    removeScheduledTask
  } = useDayPlanner();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DayPlannerHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isAddingCustom={isAddingCustom}
        setIsAddingCustom={setIsAddingCustom}
      >
        <AddCustomEntryDialog
          customTitle={customTitle}
          setCustomTitle={setCustomTitle}
          customDuration={customDuration}
          setCustomDuration={setCustomDuration}
          customColor={customColor}
          setCustomColor={setCustomColor}
          onAddCustomEntry={addCustomEntry}
        />
      </DayPlannerHeader>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TimelineContainer
              scheduledTasks={scheduledTasks}
              getTaskById={getTaskById}
              getClientByName={getClientByName}
              getAssigneeName={getAssigneeName}
              updateTaskDuration={updateTaskDuration}
              updateTaskStartTime={updateTaskStartTime}
              removeScheduledTask={removeScheduledTask}
            />
          </div>

          <div>
            <TaskPool
              tasks={getUnscheduledTasks()}
              getAssigneeName={getAssigneeName}
              getClientByName={getClientByName}
            />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default DayPlanner;
