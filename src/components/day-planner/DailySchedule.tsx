
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { TimeSlot } from './TimeSlot';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { Client } from '@/hooks/useClients';

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
  getClientByName: (clientName: string) => Client | undefined;
  getAssigneeName: (assigneeId: string | null) => string;
  updateTaskDuration: (taskId: string, duration: number) => void;
  removeScheduledTask: (taskId: string) => void;
}

export const DailySchedule: React.FC<DailyScheduleProps> = ({
  timeSlots,
  scheduledTasks,
  getTaskById,
  getClientByName,
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

  const getVisibleTimeSlots = () => {
    const visibleSlots: string[] = [];
    const coveredSlots = new Set<string>();

    // First pass: identify all covered slots
    scheduledTasks.forEach(task => {
      const startIndex = timeSlots.indexOf(task.startTime);
      const slotsNeeded = Math.ceil(task.duration / 15);
      
      for (let i = startIndex + 1; i < startIndex + slotsNeeded; i++) {
        if (i < timeSlots.length) {
          coveredSlots.add(timeSlots[i]);
        }
      }
    });

    // Second pass: keep only slots that aren't covered
    timeSlots.forEach(slot => {
      if (!coveredSlots.has(slot)) {
        visibleSlots.push(slot);
      }
    });

    return visibleSlots;
  };

  const visibleTimeSlots = getVisibleTimeSlots();

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
          {visibleTimeSlots.map((timeSlot) => {
            const scheduledTask = getScheduledTaskForSlot(timeSlot);
            const isFirstSlotOfTask = scheduledTask && scheduledTask.startTime === timeSlot;
            const task = scheduledTask && scheduledTask.type === 'task' ? getTaskById(scheduledTask.taskId) : undefined;
            const client = task?.client_name ? getClientByName(task.client_name) : undefined;
            
            return (
              <TimeSlot
                key={timeSlot}
                timeSlot={timeSlot}
                scheduledTask={isFirstSlotOfTask ? scheduledTask : undefined}
                task={task}
                client={client}
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
