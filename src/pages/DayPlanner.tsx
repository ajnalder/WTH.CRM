
import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';
import { DayPlannerHeader } from '@/components/day-planner/DayPlannerHeader';
import { AddCustomEntryDialog } from '@/components/day-planner/AddCustomEntryDialog';
import { DailySchedule } from '@/components/day-planner/DailySchedule';
import { TaskPool } from '@/components/day-planner/TaskPool';
import { generateTimeSlots } from '@/utils/timeUtils';

interface ScheduledTask {
  id: string;
  taskId: string;
  startTime: string;
  duration: number;
  type: 'task' | 'custom';
  title?: string;
  color?: string;
}

const DayPlanner = () => {
  const { tasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const { clients } = useClients();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDuration, setCustomDuration] = useState('30');
  const [customColor, setCustomColor] = useState('blue');
  
  const timeSlots = generateTimeSlots('09:00', '17:00', 15);
  
  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const getClientByName = (clientName: string) => {
    return clients.find(client => client.company === clientName);
  };

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Unknown User';
  };

  // Helper function to check if a time slot range is available for scheduling
  const isTimeSlotAvailable = (startTime: string, duration: number, excludeTaskId?: string) => {
    const startIndex = timeSlots.indexOf(startTime);
    if (startIndex === -1) return false;
    
    const slotsNeeded = Math.ceil(duration / 15);
    const endIndex = startIndex + slotsNeeded;
    
    // Check if the range extends beyond available time slots
    if (endIndex > timeSlots.length) return false;
    
    // Check for conflicts with other scheduled tasks
    for (let i = startIndex; i < endIndex; i++) {
      const currentSlot = timeSlots[i];
      const conflictingTask = scheduledTasks.find(task => {
        if (excludeTaskId && task.taskId === excludeTaskId) return false;
        
        const taskStartIndex = timeSlots.indexOf(task.startTime);
        const taskSlotsNeeded = Math.ceil(task.duration / 15);
        const taskEndIndex = taskStartIndex + taskSlotsNeeded;
        
        return i >= taskStartIndex && i < taskEndIndex;
      });
      
      if (conflictingTask) return false;
    }
    
    return true;
  };

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Handle dropping task into a time slot
    if (destination.droppableId.startsWith('timeslot-')) {
      const targetTimeSlot = destination.droppableId.replace('timeslot-', '');
      const taskId = draggableId.replace('task-', '');
      
      // Find the task to get its duration
      const existingScheduledTask = scheduledTasks.find(st => st.taskId === taskId);
      const taskDuration = existingScheduledTask ? existingScheduledTask.duration : 60;
      
      // Check if the target time slot is available
      if (!isTimeSlotAvailable(targetTimeSlot, taskDuration, taskId)) {
        console.log('Target time slot is not available');
        return;
      }
      
      // Remove the task from its current position
      const updatedSchedule = scheduledTasks.filter(st => st.taskId !== taskId);
      
      // Add the task to the new position
      const newScheduledTask: ScheduledTask = existingScheduledTask ? {
        ...existingScheduledTask,
        startTime: targetTimeSlot
      } : {
        id: `${taskId}-${targetTimeSlot}`,
        taskId,
        startTime: targetTimeSlot,
        duration: taskDuration,
        type: 'task'
      };
      
      setScheduledTasks([...updatedSchedule, newScheduledTask]);
    }
    
    // Handle dropping task back to the pool
    if (destination.droppableId === 'task-pool') {
      const taskId = draggableId.replace('task-', '');
      setScheduledTasks(scheduledTasks.filter(st => st.taskId !== taskId));
    }
  };

  const getUnscheduledTasks = () => {
    const scheduledTaskIds = scheduledTasks.filter(st => st.type === 'task').map(st => st.taskId);
    return tasks.filter(task => !scheduledTaskIds.includes(task.id));
  };

  const updateTaskDuration = (taskId: string, newDuration: number) => {
    setScheduledTasks(prev => {
      const taskIndex = prev.findIndex(task => task.taskId === taskId);
      if (taskIndex === -1) return prev;
      
      const currentTask = prev[taskIndex];
      const currentStartTime = currentTask.startTime;
      
      // Check if the new duration fits in the available space
      if (!isTimeSlotAvailable(currentStartTime, newDuration, taskId)) {
        console.log('Cannot resize: not enough space available');
        return prev;
      }
      
      // Update the task duration
      const updatedTask = { ...currentTask, duration: newDuration };
      const updatedTasks = [...prev];
      updatedTasks[taskIndex] = updatedTask;
      
      // Find the time slot index for this task
      const taskTimeIndex = timeSlots.indexOf(currentStartTime);
      if (taskTimeIndex === -1) return updatedTasks;
      
      // Calculate how many slots this task now occupies
      const newSlotsNeeded = Math.ceil(newDuration / 15);
      const newEndIndex = taskTimeIndex + newSlotsNeeded;
      
      // Find tasks that start within the new range and need to be shifted
      const tasksToShift = updatedTasks.filter(task => {
        if (task.taskId === taskId) return false;
        const taskStartIndex = timeSlots.indexOf(task.startTime);
        return taskStartIndex >= taskTimeIndex && taskStartIndex < newEndIndex;
      });
      
      // Shift conflicting tasks to start after this task
      tasksToShift.forEach(taskToShift => {
        const shiftedStartIndex = newEndIndex;
        if (shiftedStartIndex < timeSlots.length) {
          const taskToShiftIndex = updatedTasks.findIndex(t => t.taskId === taskToShift.taskId);
          if (taskToShiftIndex !== -1) {
            updatedTasks[taskToShiftIndex] = {
              ...updatedTasks[taskToShiftIndex],
              startTime: timeSlots[shiftedStartIndex]
            };
          }
        }
      });
      
      return updatedTasks;
    });
  };

  const addCustomEntry = () => {
    if (!customTitle.trim()) return;
    
    const newCustomEntry: ScheduledTask = {
      id: `custom-${Date.now()}`,
      taskId: `custom-${Date.now()}`,
      startTime: '12:00',
      duration: parseInt(customDuration),
      type: 'custom',
      title: customTitle,
      color: customColor
    };
    
    setScheduledTasks([...scheduledTasks, newCustomEntry]);
    setCustomTitle('');
    setCustomDuration('30');
    setIsAddingCustom(false);
  };

  const removeScheduledTask = (taskId: string) => {
    setScheduledTasks(prev => prev.filter(task => task.taskId !== taskId));
  };

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
