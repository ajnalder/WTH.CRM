
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { TimeSlot } from './TimeSlot';
import type { TaskWithClient } from '@/hooks/useTasks';

interface ScheduledTask {
  id: string;
  taskId: string;
  startTime: string;
  duration: number;
  type: 'task' | 'custom';
  title?: string;
  color?: string;
}

interface DailyScheduleProps {
  timeSlots: string[];
  scheduledTasks: ScheduledTask[];
  getTaskById: (taskId: string) => TaskWithClient | undefined;
  getAssigneeName: (assigneeId: string | null) => string;
  updateTaskDuration: (taskId: string, duration: number) => void;
  removeScheduledTask: (taskId: string) => void;
}

export const DailySchedule: React.FC<DailyScheduleProps> = ({
  timeSlots,
  scheduledTasks,
  getTaskById,
  getAssigneeName,
  updateTaskDuration,
  removeScheduledTask
}) => {
  const getScheduledTaskForSlot = (timeSlot: string) => {
    return scheduledTasks.find(st => {
      const startIndex = timeSlots.indexOf(st.startTime);
      const slotsNeeded = Math.ceil(st.duration / 15);
      const endIndex = startIndex + slotsNeeded;
      const currentIndex = timeSlots.indexOf(timeSlot);
      
      return currentIndex >= startIndex && currentIndex < endIndex;
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
            const isFirstSlotOfTask = scheduledTask && scheduledTask.startTime === timeSlot;
            
            return (
              <TimeSlot
                key={timeSlot}
                timeSlot={timeSlot}
                scheduledTask={isFirstSlotOfTask ? scheduledTask : undefined}
                task={scheduledTask && scheduledTask.type === 'task' ? getTaskById(scheduledTask.taskId) : undefined}
                getAssigneeName={getAssigneeName}
                updateTaskDuration={updateTaskDuration}
                removeScheduledTask={removeScheduledTask}
                isOccupied={!!scheduledTask}
                isFirstSlot={!!isFirstSlotOfTask}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
