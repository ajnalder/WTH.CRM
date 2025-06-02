
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ScheduledTask } from '@/types/dayPlanner';

export const useScheduledTasks = (selectedDate: string) => {
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load scheduled tasks for the selected date
  const loadScheduledTasks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .select('*')
        .eq('scheduled_date', selectedDate);

      if (error) throw error;

      const formattedTasks: ScheduledTask[] = data.map(task => ({
        id: task.id,
        taskId: task.task_id,
        startTime: task.start_time,
        duration: task.duration,
        type: task.type as 'task' | 'custom',
        title: task.title,
        color: task.color
      }));

      setScheduledTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading scheduled tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load scheduled tasks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save a scheduled task to the database
  const saveScheduledTask = async (task: ScheduledTask) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('scheduled_tasks')
        .upsert({
          id: task.id,
          task_id: task.taskId,
          scheduled_date: selectedDate,
          start_time: task.startTime,
          duration: task.duration,
          type: task.type,
          title: task.title,
          color: task.color,
          user_id: user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving scheduled task:', error);
      toast({
        title: "Error",
        description: "Failed to save scheduled task",
        variant: "destructive"
      });
    }
  };

  // Remove a scheduled task from the database
  const removeScheduledTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_tasks')
        .delete()
        .eq('task_id', taskId)
        .eq('scheduled_date', selectedDate);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing scheduled task:', error);
      toast({
        title: "Error",
        description: "Failed to remove scheduled task",
        variant: "destructive"
      });
    }
  };

  // Update local state and sync with database
  const updateScheduledTasks = async (newTasks: ScheduledTask[]) => {
    setScheduledTasks(newTasks);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Delete all existing tasks for this date first
      const { error: deleteError } = await supabase
        .from('scheduled_tasks')
        .delete()
        .eq('scheduled_date', selectedDate)
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;

      // Then insert the new tasks if any exist
      if (newTasks.length > 0) {
        const tasksToInsert = newTasks.map(task => ({
          id: task.id,
          task_id: task.taskId,
          scheduled_date: selectedDate,
          start_time: task.startTime,
          duration: task.duration,
          type: task.type,
          title: task.title,
          color: task.color,
          user_id: user?.id
        }));

        const { error: insertError } = await supabase
          .from('scheduled_tasks')
          .insert(tasksToInsert);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating scheduled tasks:', error);
      toast({
        title: "Error",
        description: "Failed to update scheduled tasks",
        variant: "destructive"
      });
    }
  };

  // Load tasks when the selected date changes
  useEffect(() => {
    loadScheduledTasks();
  }, [selectedDate]);

  return {
    scheduledTasks,
    isLoading,
    updateScheduledTasks,
    saveScheduledTask,
    removeScheduledTask
  };
};
