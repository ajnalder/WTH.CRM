
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
  start_time: string;
  end_time: string;
  duration: number;
  title?: string;
  color?: string;
}
