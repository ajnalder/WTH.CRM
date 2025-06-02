
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { TimeSlot } from './TimeSlot';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { Client } from '@/hooks/useClients';
import type { ScheduledTask } from '@/types/dayPlanner';

interface DailyScheduleProps {
  timeSlots: string[];
  scheduledTasks: ScheduledTask[];
  occupiedSlots: Set<string>;
  getTaskById: (taskId: string) => TaskWithClient | undefined;
  getClientByName: (clientName: string) => Client | undefined;
  getAssigneeName: (assigneeId: string | null) => string;
  updateTaskDuration: (taskId: string, duration: number) => void;
  removeScheduledTask: (taskId: string) => void;
}

export const DailySchedule: React.FC<DailyScheduleProps> = ({
  timeSlots,
  scheduledTasks,
  occupiedSlots,
  getTaskById,
  getClientByName,
  getAssigneeName,
  updateTaskDuration,
  removeScheduledTask
}) => {
  // Find the scheduled task that covers a specific time slot
  const getScheduledTaskForSlot = (timeSlot: string) => {
    return scheduledTasks.find(st => {
      // Check if this time slot is between the start and end time of the task
      const startTimeIndex = timeSlots.indexOf(st.start_time);
      const endTimeIndex = timeSlots.indexOf(st.end_time);
      const currentIndex = timeSlots.indexOf(timeSlot);
      
      return currentIndex >= startTimeIndex && currentIndex <= endTimeIndex;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} />
          Daily Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {timeSlots.map((timeSlot) => {
            const scheduledTask = getScheduledTaskForSlot(timeSlot);
            const isOccupied = occupiedSlots.has(timeSlot);
            
            const task = scheduledTask && scheduledTask.task_type === 'task' 
              ? getTaskById(scheduledTask.task_id) 
              : undefined;
              
            const client = task?.client_name ? getClientByName(task.client_name) : undefined;
            
            return (
              <TimeSlot
                key={timeSlot}
                timeSlot={timeSlot}
                scheduledTask={scheduledTask}
                task={task}
                client={client}
                getAssigneeName={getAssigneeName}
                updateTaskDuration={updateTaskDuration}
                removeScheduledTask={removeScheduledTask}
                isOccupied={isOccupied}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
