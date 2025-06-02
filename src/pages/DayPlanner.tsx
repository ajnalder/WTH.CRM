import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { DayPlannerHeader } from '@/components/day-planner/DayPlannerHeader';
import { AddCustomEntryDialog } from '@/components/day-planner/AddCustomEntryDialog';
import { DailySchedule } from '@/components/day-planner/DailySchedule';
import { TaskPool } from '@/components/day-planner/TaskPool';
import { useDayPlanner } from '@/hooks/useDayPlanner';
import { Skeleton } from '@/components/ui/skeleton';

const DayPlanner = () => {
  const {
    selectedDate,
    setSelectedDate,
    timeSlots: dbTimeSlots,
    isLoading,
    isAddingCustom,
    setIsAddingCustom,
    customTitle,
    setCustomTitle,
    customDuration,
    setCustomDuration,
    customColor,
    setCustomColor,
    timeSlotStrings,
    getTaskById,
    getClientByName,
    getAssigneeName,
    getUnscheduledTasks,
    getScheduledTasks,
    isSlotOccupied,
    handleDragEnd,
    updateTaskDuration,
    addCustomEntry,
    removeScheduledTask
  } = useDayPlanner();

  // Get the occupied slots for rendering
  const occupiedSlots = new Set<string>();
  dbTimeSlots.forEach(slot => {
    if (slot.task_id) {
      occupiedSlots.add(slot.time_slot);
    }
  });

  // Get the scheduled tasks
  const scheduledTasks = getScheduledTasks();

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-full" />
        </div>
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
    <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
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
            <DailySchedule
              timeSlots={timeSlotStrings}
              scheduledTasks={scheduledTasks}
              occupiedSlots={occupiedSlots}
              getTaskById={getTaskById}
              getClientByName={getClientByName}
              getAssigneeName={getAssigneeName}
              updateTaskDuration={updateTaskDuration}
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
