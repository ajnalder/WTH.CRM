
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
  
  // Update the task duration first
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
    // Task is getting longer - need to shift conflicting tasks down
    const slotsExpanded = newSlotsNeeded - oldSlotsNeeded;
    
    // Find all tasks that would conflict with the expanded task
    const conflictingTasks = updatedTasks
      .filter(task => {
        if (task.taskId === taskId) return false;
        const taskStartIndex = timeSlots.indexOf(task.startTime);
        const taskSlotsNeeded = Math.ceil(task.duration / 15);
        const taskEndIndex = taskStartIndex + taskSlotsNeeded;
        
        // Check if this task overlaps with the expanded area
        return (taskStartIndex < newEndIndex && taskEndIndex > oldEndIndex);
      })
      .sort((a, b) => timeSlots.indexOf(a.startTime) - timeSlots.indexOf(b.startTime));
    
    // Shift conflicting tasks down
    conflictingTasks.forEach(conflictingTask => {
      const conflictingTaskIndex = updatedTasks.findIndex(t => t.taskId === conflictingTask.taskId);
      if (conflictingTaskIndex !== -1) {
        // Move conflicting task to start after the expanded task
        if (newEndIndex < timeSlots.length) {
          updatedTasks[conflictingTaskIndex] = {
            ...updatedTasks[conflictingTaskIndex],
            startTime: timeSlots[newEndIndex]
          };
        }
      }
    });
    
    // Also shift any subsequent tasks that need to move
    const tasksToShift = updatedTasks
      .filter(task => {
        if (task.taskId === taskId) return false;
        if (conflictingTasks.some(ct => ct.taskId === task.taskId)) return false;
        const taskStartIndex = timeSlots.indexOf(task.startTime);
        return taskStartIndex >= oldEndIndex;
      })
      .sort((a, b) => timeSlots.indexOf(a.startTime) - timeSlots.indexOf(b.startTime));
    
    tasksToShift.forEach(taskToShift => {
      const currentStartIndex = timeSlots.indexOf(taskToShift.startTime);
      const newStartIndex = currentStartIndex + slotsExpanded;
      
      if (newStartIndex < timeSlots.length) {
        const taskToShiftIndex = updatedTasks.findIndex(t => t.taskId === taskToShift.taskId);
        if (taskToShiftIndex !== -1) {
          updatedTasks[taskToShiftIndex] = {
            ...updatedTasks[taskToShiftIndex],
            startTime: timeSlots[newStartIndex]
          };
        }
      }
    });
    
  } else if (newDuration < oldDuration) {
    // Task is getting shorter - move subsequent tasks up to fill the gap
    const slotsFreed = oldSlotsNeeded - newSlotsNeeded;
    
    // Find all tasks that start at or after the old end time
    const tasksToMoveUp = updatedTasks
      .filter(task => {
        if (task.taskId === taskId) return false;
        const taskStartIndex = timeSlots.indexOf(task.startTime);
        return taskStartIndex >= oldEndIndex;
      })
      .sort((a, b) => timeSlots.indexOf(a.startTime) - timeSlots.indexOf(b.startTime));
    
    // Move each subsequent task up to fill the gap, but only if there's no conflict
    tasksToMoveUp.forEach(taskToMove => {
      const currentStartIndex = timeSlots.indexOf(taskToMove.startTime);
      const potentialNewStartIndex = Math.max(newEndIndex, currentStartIndex - slotsFreed);
      
      // Check if this new position would be available
      if (potentialNewStartIndex !== currentStartIndex && 
          potentialNewStartIndex >= 0 && 
          potentialNewStartIndex < timeSlots.length) {
        
        // Verify the slot is actually available
        const wouldBeAvailable = isTimeSlotAvailable(
          timeSlots[potentialNewStartIndex], 
          taskToMove.duration, 
          timeSlots, 
          updatedTasks.filter(t => t.taskId !== taskToMove.taskId)
        );
        
        if (wouldBeAvailable) {
          const taskToMoveIndex = updatedTasks.findIndex(t => t.taskId === taskToMove.taskId);
          if (taskToMoveIndex !== -1) {
            updatedTasks[taskToMoveIndex] = {
              ...updatedTasks[taskToMoveIndex],
              startTime: timeSlots[potentialNewStartIndex]
            };
          }
        }
      }
    });
  }
  
  return updatedTasks;
};
