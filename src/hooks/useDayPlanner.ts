import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';
import { useScheduledTasks } from '@/hooks/useScheduledTasks';
import { generateTimeSlots } from '@/utils/timeUtils';
import { isTimeSlotAvailable, updateTaskDurationWithShifting } from '@/utils/schedulingUtils';
import type { ScheduledTask } from '@/types/dayPlanner';

export const useDayPlanner = () => {
  const { tasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const { clients } = useClients();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDuration, setCustomDuration] = useState('30');
  const [customColor, setCustomColor] = useState('blue');
  
  const { 
    scheduledTasks, 
    isLoading, 
    updateScheduledTasks, 
    saveScheduledTask, 
    removeScheduledTask: removeFromDatabase 
  } = useScheduledTasks(selectedDate);
  
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

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    console.log('Drag end:', { source, destination, draggableId });

    // Handle dropping task into a time slot
    if (destination.droppableId.startsWith('timeslot-')) {
      const targetTimeSlot = destination.droppableId.replace('timeslot-', '');
      const taskId = draggableId.startsWith('task-') ? draggableId.replace('task-', '') : draggableId;
      
      console.log('Dropping task into timeslot:', { targetTimeSlot, taskId });
      
      const existingScheduledTask = scheduledTasks.find(st => st.taskId === taskId);
      const taskDuration = existingScheduledTask ? existingScheduledTask.duration : 60;
      
      if (!isTimeSlotAvailable(targetTimeSlot, taskDuration, timeSlots, scheduledTasks, taskId)) {
        console.log('Target time slot is not available');
        return;
      }
      
      const updatedSchedule = scheduledTasks.filter(st => st.taskId !== taskId);
      
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
      
      await updateScheduledTasks([...updatedSchedule, newScheduledTask]);
    }
    
    // Handle dropping task back to the pool
    if (destination.droppableId === 'task-pool') {
      const taskId = draggableId.startsWith('task-') ? draggableId.replace('task-', '') : draggableId;
      console.log('Dropping task back to pool:', taskId);
      const updatedTasks = scheduledTasks.filter(st => st.taskId !== taskId);
      await updateScheduledTasks(updatedTasks);
    }
  };

  const getUnscheduledTasks = () => {
    const scheduledTaskIds = scheduledTasks.filter(st => st.type === 'task').map(st => st.taskId);
    return tasks.filter(task => !scheduledTaskIds.includes(task.id));
  };

  const updateTaskDuration = async (taskId: string, newDuration: number) => {
    const updatedTasks = updateTaskDurationWithShifting(taskId, newDuration, scheduledTasks, timeSlots);
    await updateScheduledTasks(updatedTasks);
  };

  const addCustomEntry = async () => {
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
    
    await updateScheduledTasks([...scheduledTasks, newCustomEntry]);
    setCustomTitle('');
    setCustomDuration('30');
    setIsAddingCustom(false);
  };

  const removeScheduledTask = async (taskId: string) => {
    const updatedTasks = scheduledTasks.filter(task => task.taskId !== taskId);
    await updateScheduledTasks(updatedTasks);
  };

  return {
    // State
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
