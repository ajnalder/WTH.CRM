
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';
import { generateTimeSlots } from '@/utils/timeUtils';
import { isTimeSlotAvailable, updateTaskDurationWithShifting } from '@/utils/schedulingUtils';
import type { ScheduledTask } from '@/types/dayPlanner';

export const useDayPlanner = () => {
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
      if (!isTimeSlotAvailable(targetTimeSlot, taskDuration, timeSlots, scheduledTasks, taskId)) {
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
    setScheduledTasks(prev => updateTaskDurationWithShifting(taskId, newDuration, prev, timeSlots));
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

  return {
    // State
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
    
    // Helper functions
    getTaskById,
    getClientByName,
    getAssigneeName,
    getUnscheduledTasks,
    
    // Actions
    handleDragEnd,
    updateTaskDuration,
    addCustomEntry,
    removeScheduledTask
  };
};
