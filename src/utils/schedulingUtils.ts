
import type { ScheduledTask } from '@/types/dayPlanner';

export const isTimeSlotAvailable = (
  startTime: string, 
  duration: number, 
  timeSlots: string[], 
  scheduledTasks: ScheduledTask[], 
  excludeTaskId?: string
): boolean => {
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

export const updateTaskDurationWithShifting = (
  taskId: string, 
  newDuration: number, 
  scheduledTasks: ScheduledTask[], 
  timeSlots: string[]
): ScheduledTask[] => {
  const taskIndex = scheduledTasks.findIndex(task => task.taskId === taskId);
  if (taskIndex === -1) return scheduledTasks;
  
  const currentTask = scheduledTasks[taskIndex];
  const currentStartTime = currentTask.startTime;
  const oldDuration = currentTask.duration;
  
  // Check if the new duration fits in the available space
  if (!isTimeSlotAvailable(currentStartTime, newDuration, timeSlots, scheduledTasks, taskId)) {
    console.log('Cannot resize: not enough space available');
    return scheduledTasks;
  }
  
  // Update the task duration
  const updatedTask = { ...currentTask, duration: newDuration };
  const updatedTasks = [...scheduledTasks];
  updatedTasks[taskIndex] = updatedTask;
  
  // Find the time slot index for this task
  const taskTimeIndex = timeSlots.indexOf(currentStartTime);
  if (taskTimeIndex === -1) return updatedTasks;
  
  // Calculate the old and new end positions
  const oldSlotsNeeded = Math.ceil(oldDuration / 15);
  const newSlotsNeeded = Math.ceil(newDuration / 15);
  const oldEndIndex = taskTimeIndex + oldSlotsNeeded;
  const newEndIndex = taskTimeIndex + newSlotsNeeded;
  
  if (newDuration > oldDuration) {
    // Task is getting longer - shift conflicting tasks down
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
  } else if (newDuration < oldDuration) {
    // Task is getting shorter - move subsequent tasks up to fill the gap
    const tasksToMoveUp = updatedTasks
      .filter(task => {
        if (task.taskId === taskId) return false;
        const taskStartIndex = timeSlots.indexOf(task.startTime);
        return taskStartIndex >= oldEndIndex; // Tasks that start after the old end
      })
      .sort((a, b) => timeSlots.indexOf(a.startTime) - timeSlots.indexOf(b.startTime)); // Sort by start time
    
    // Move each subsequent task up to fill the gap
    const slotsFreed = oldSlotsNeeded - newSlotsNeeded;
    tasksToMoveUp.forEach(taskToMove => {
      const currentStartIndex = timeSlots.indexOf(taskToMove.startTime);
      const newStartIndex = Math.max(newEndIndex, currentStartIndex - slotsFreed);
      
      if (newStartIndex !== currentStartIndex && newStartIndex < timeSlots.length) {
        const taskToMoveIndex = updatedTasks.findIndex(t => t.taskId === taskToMove.taskId);
        if (taskToMoveIndex !== -1) {
          updatedTasks[taskToMoveIndex] = {
            ...updatedTasks[taskToMoveIndex],
            startTime: timeSlots[newStartIndex]
          };
        }
      }
    });
  }
  
  return updatedTasks;
};
