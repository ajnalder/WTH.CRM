
import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { DayPlannerHeader } from '@/components/day-planner/DayPlannerHeader';
import { AddCustomEntryDialog } from '@/components/day-planner/AddCustomEntryDialog';
import { DailySchedule } from '@/components/day-planner/DailySchedule';
import { TaskPool } from '@/components/day-planner/TaskPool';
import { useDayPlanner } from '@/hooks/useDayPlanner';

const DayPlanner = () => {
  const {
    selectedDate,
    setSelectedDate,
    scheduledTasks,
    isAddingCustom,
    setIsAddingCustom,
    customTitle,
    setCustomTitle,
    customDuration,
    setCustomDuration,
    customColor,
    setCustomColor,
    timeSlots,
    getTaskById,
    getClientByName,
    getAssigneeName,
    getUnscheduledTasks,
    handleDragEnd,
    updateTaskDuration,
    addCustomEntry,
    removeScheduledTask
  } = useDayPlanner();

  return (
    <div className="flex-1 p-6">
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
              timeSlots={timeSlots}
              scheduledTasks={scheduledTasks}
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
