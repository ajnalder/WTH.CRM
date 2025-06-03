
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import type { ScheduledTask } from '@/types/dayPlanner';

export const useDayPlanner = () => {
  const { tasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const { clients } = useClients();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDuration, setCustomDuration] = useState('30');
  const [customColor, setCustomColor] = useState('blue');
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const getUnscheduledTasks = () => {
    const scheduledTaskIds = new Set(scheduledTasks.map(st => st.task_id));
    return tasks.filter(task => !scheduledTaskIds.has(task.id));
  };

  const calculateDropPosition = (clientY: number, timelineElement: HTMLElement) => {
    const rect = timelineElement.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, relativeY / rect.height));
    return Math.floor(percentage * 480); // Convert to minutes from 8 AM
  };

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Handle dropping task into timeline
    if (destination.droppableId === 'timeline') {
      const taskId = draggableId.startsWith('task-') ? draggableId.replace('task-', '') : draggableId;
      
      // Check if task is already scheduled and just being repositioned
      const existingTaskIndex = scheduledTasks.findIndex(st => st.task_id === taskId);
      
      if (existingTaskIndex >= 0) {
        // Task is being repositioned - calculate new position from drop coordinates
        const timelineElement = document.querySelector('[data-rbd-droppable-id="timeline"]') as HTMLElement;
        if (timelineElement && result.combine === null) {
          // For repositioning, we'll use a default behavior for now
          // In a real implementation, you'd capture the mouse position during drag
          return;
        }
      } else {
        // New task being scheduled - use default position
        const newScheduledTask: ScheduledTask = {
          task_id: taskId,
          task_type: 'task',
          start_time: 60, // Default to 9 AM (60 minutes from 8 AM)
          duration: 60, // Default 1 hour
        };
        
        setScheduledTasks(prev => [...prev, newScheduledTask]);
        
        toast({
          title: "Task Scheduled",
          description: "Task has been added to your timeline",
        });
      }
    }
    
    // Handle dropping task back to pool
    if (destination.droppableId === 'task-pool') {
      const taskId = draggableId.startsWith('scheduled-') 
        ? draggableId.replace('scheduled-', '') 
        : draggableId.replace('task-', '');
      
      setScheduledTasks(prev => prev.filter(st => st.task_id !== taskId));
      
      toast({
        title: "Task Unscheduled",
        description: "Task has been removed from your timeline",
      });
    }
  };

  const updateTaskDuration = (taskId: string, newDuration: number) => {
    setScheduledTasks(prev => 
      prev.map(st => 
        st.task_id === taskId 
          ? { ...st, duration: Math.max(15, Math.min(newDuration, 480)) }
          : st
      )
    );
  };

  const updateTaskStartTime = (taskId: string, startTime: number) => {
    setScheduledTasks(prev => 
      prev.map(st => 
        st.task_id === taskId 
          ? { ...st, start_time: Math.max(0, Math.min(startTime, 480 - st.duration)) }
          : st
      )
    );
  };

  const addCustomEntry = () => {
    if (!customTitle.trim()) return;
    
    const customId = crypto.randomUUID();
    const newCustomTask: ScheduledTask = {
      task_id: customId,
      task_type: 'custom',
      start_time: 240, // Default to 12 PM (240 minutes from 8 AM)
      duration: parseInt(customDuration),
      title: customTitle,
      color: customColor
    };
    
    setScheduledTasks(prev => [...prev, newCustomTask]);
    
    setCustomTitle('');
    setCustomDuration('30');
    setIsAddingCustom(false);
    
    toast({
      title: "Custom Entry Added",
      description: "Your custom time block has been added",
    });
  };

  const removeScheduledTask = (taskId: string) => {
    setScheduledTasks(prev => prev.filter(st => st.task_id !== taskId));
    
    toast({
      title: "Task Removed",
      description: "Task has been removed from your timeline",
    });
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
    
    // Helper functions
    getTaskById,
    getClientByName,
    getAssigneeName,
    getUnscheduledTasks,
    
    // Actions
    handleDragEnd,
    updateTaskDuration,
    updateTaskStartTime,
    addCustomEntry,
    removeScheduledTask
  };
};
