import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TimeSlot } from '@/types/dayPlanner';

export const useTimeSlots = (selectedDate: string) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load time slots for the selected date
  const loadTimeSlots = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('date', selectedDate)
        .order('time_slot');

      if (error) throw error;

      // Cast the data to ensure proper typing for task_type
      const typedData: TimeSlot[] = (data || []).map(slot => ({
        ...slot,
        task_type: slot.task_type as 'task' | 'custom' | undefined
      }));

      setTimeSlots(typedData);
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast({
        title: "Error",
        description: "Failed to load time slots",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get all time slots for a specific task
  const getTaskSlots = (taskId: string): TimeSlot[] => {
    return timeSlots.filter(slot => slot.task_id === taskId);
  };

  // Check if a time slot is occupied
  const isSlotOccupied = (timeSlot: string): boolean => {
    return timeSlots.some(slot => slot.time_slot === timeSlot && slot.task_id);
  };

  // Assign a task to time slots
  const assignTaskToSlots = async (taskId: string, startTime: string, duration: number, taskType: 'task' | 'custom', title?: string, color?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Calculate which slots we need
      const startIndex = getTimeSlotIndex(startTime);
      const slotsNeeded = Math.ceil(duration / 15);
      const timeSlotStrings = generateTimeSlots();
      
      const slotsToAssign = [];
      for (let i = 0; i < slotsNeeded; i++) {
        const slotIndex = startIndex + i;
        if (slotIndex < timeSlotStrings.length) {
          slotsToAssign.push(timeSlotStrings[slotIndex]);
        }
      }

      // Clear any existing slots for this task first
      await clearTaskSlots(taskId);

      // Insert new slots
      const newSlots = slotsToAssign.map(timeSlot => ({
        user_id: user.id,
        date: selectedDate,
        time_slot: timeSlot,
        task_id: taskId,
        task_type: taskType,
        title: title,
        color: color
      }));

      const { error } = await supabase
        .from('time_slots')
        .upsert(newSlots, {
          onConflict: 'user_id,date,time_slot'
        });

      if (error) throw error;

      await loadTimeSlots();
    } catch (error) {
      console.error('Error assigning task to slots:', error);
      toast({
        title: "Error",
        description: "Failed to assign task to time slots",
        variant: "destructive"
      });
    }
  };

  // Clear all slots for a specific task
  const clearTaskSlots = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('task_id', taskId)
        .eq('date', selectedDate);

      if (error) throw error;

      await loadTimeSlots();
    } catch (error) {
      console.error('Error clearing task slots:', error);
      toast({
        title: "Error",
        description: "Failed to clear task slots",
        variant: "destructive"
      });
    }
  };

  // Clear a specific time slot
  const clearTimeSlot = async (timeSlot: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .eq('time_slot', timeSlot);

      if (error) throw error;

      await loadTimeSlots();
    } catch (error) {
      console.error('Error clearing time slot:', error);
      toast({
        title: "Error",
        description: "Failed to clear time slot",
        variant: "destructive"
      });
    }
  };

  // Helper function to get time slot index
  const getTimeSlotIndex = (timeSlot: string): number => {
    const timeSlotStrings = generateTimeSlots();
    return timeSlotStrings.indexOf(timeSlot);
  };

  // Generate time slots array
  const generateTimeSlots = (): string[] => {
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  // Load slots when the selected date changes
  useEffect(() => {
    loadTimeSlots();
  }, [selectedDate]);

  return {
    timeSlots,
    isLoading,
    assignTaskToSlots,
    clearTaskSlots,
    clearTimeSlot,
    isSlotOccupied,
    getTaskSlots,
    generateTimeSlots
  };
};
