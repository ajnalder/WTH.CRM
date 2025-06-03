
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TimeSlot {
  id: string;
  user_id: string;
  date: string;
  time_slot: string;
  task_id: string | null;
  task_type: string | null;
  title: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export const useTimeSlots = (selectedDate: Date) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTimeSlots = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const dateString = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateString);

      if (error) {
        console.error('Error fetching time slots:', error);
        return;
      }

      setTimeSlots(data || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate, user]);

  return {
    timeSlots,
    isLoading,
    refetchTimeSlots: fetchTimeSlots,
  };
};
