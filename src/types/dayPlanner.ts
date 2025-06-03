
export interface TimeSlot {
  id: string;
  user_id: string;
  date: string;
  time_slot: string;
  task_id?: string;
  task_type?: 'task' | 'custom';
  title?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledTask {
  task_id: string;
  task_type: 'task' | 'custom';
  start_time: number; // minutes from 8 AM (0-480)
  duration: number; // duration in minutes
  title?: string;
  color?: string;
}
