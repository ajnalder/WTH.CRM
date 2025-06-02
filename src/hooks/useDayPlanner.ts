
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';
import { useTimeSlots } from '@/hooks/useTimeSlots';
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
    timeSlots,
    isLoading,
    assignTaskToSlots,
    clearTaskSlots,
    clearTimeSlot,
    isSlotOccupied,
    getTaskSlots,
    generateTimeSlots
  } = useTimeSlots(selectedDate);
  
  const timeSlotStrings = generateTimeSlots();
  
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
      
      // Check if task is already scheduled
      const existingTaskSlots = getTaskSlots(taskId);
      const taskDuration = existingTaskSlots.length > 0 ? existingTaskSlots.length * 15 : 60;
      
      await assignTaskToSlots(taskId, targetTimeSlot, taskDuration, 'task');
    }
    
    // Handle dropping task back to the pool
    if (destination.droppableId === 'task-pool') {
      const taskId = draggableId.startsWith('task-') ? draggableId.replace('task-', '') : draggableId;
      console.log('Dropping task back to pool:', taskId);
      await clearTaskSlots(taskId);
    }
  };

  const getUnscheduledTasks = () => {
    // Get all task IDs that are scheduled in any time slot
    const scheduledTaskIds = new Set<string>();
    timeSlots.forEach(slot => {
      if (slot.task_id && slot.task_type === 'task') {
        scheduledTaskIds.add(slot.task_id);
      }
    });
    
    // Return tasks that are not in the scheduled tasks set
    return tasks.filter(task => !scheduledTaskIds.has(task.id));
  };

  const updateTaskDuration = async (taskId: string, newDuration: number) => {
    // Find the earliest time slot for this task
    const taskSlots = getTaskSlots(taskId);
    if (taskSlots.length === 0) return;
    
    // Sort to get the earliest slot
    taskSlots.sort((a, b) => a.time_slot.localeCompare(b.time_slot));
    const startTime = taskSlots[0].time_slot;
    
    // Get the task type and other properties
    const taskType = taskSlots[0].task_type as 'task' | 'custom';
    const title = taskSlots[0].title;
    const color = taskSlots[0].color;
    
    // Re-assign with new duration
    await assignTaskToSlots(taskId, startTime, newDuration, taskType, title, color);
  };

  const addCustomEntry = async () => {
    if (!customTitle.trim()) return;
    
    const customId = crypto.randomUUID();
    await assignTaskToSlots(
      customId,
      '12:00', // Default start time
      parseInt(customDuration),
      'custom',
      customTitle,
      customColor
    );
    
    setCustomTitle('');
    setCustomDuration('30');
    setIsAddingCustom(false);
  };

  const removeScheduledTask = async (taskId: string) => {
    await clearTaskSlots(taskId);
  };

  // Group time slots by task to generate scheduled tasks
  const getScheduledTasks = (): ScheduledTask[] => {
    const taskMap = new Map<string, TimeSlot[]>();
    
    // Group slots by task ID
    timeSlots.forEach(slot => {
      if (slot.task_id) {
        if (!taskMap.has(slot.task_id)) {
          taskMap.set(slot.task_id, []);
        }
        taskMap.get(slot.task_id)?.push(slot);
      }
    });
    
    // Convert grouped slots to scheduled tasks
    const scheduledTasks: ScheduledTask[] = [];
    taskMap.forEach((slots, taskId) => {
      if (slots.length === 0) return;
      
      // Sort slots by time
      slots.sort((a, b) => a.time_slot.localeCompare(b.time_slot));
      
      const firstSlot = slots[0];
      const lastSlot = slots[slots.length - 1];
      
      scheduledTasks.push({
        task_id: taskId,
        task_type: firstSlot.task_type as 'task' | 'custom',
        start_time: firstSlot.time_slot,
        end_time: lastSlot.time_slot,
        duration: slots.length * 15,
        title: firstSlot.title,
        color: firstSlot.color
      });
    });
    
    return scheduledTasks;
  };

  return {
    // State
    selectedDate,
    setSelectedDate,
    timeSlots,
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
    
    // Helper functions
    getTaskById,
    getClientByName,
    getAssigneeName,
    getUnscheduledTasks,
    getScheduledTasks,
    isSlotOccupied,
    
    // Actions
    handleDragEnd,
    updateTaskDuration,
    addCustomEntry,
    removeScheduledTask
  };
};
