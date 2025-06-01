
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { TimeSlot } from '@/components/day-planner/TimeSlot';
import { TaskPool } from '@/components/day-planner/TaskPool';
import { generateTimeSlots } from '@/utils/timeUtils';

interface ScheduledTask {
  id: string;
  taskId: string;
  startTime: string;
  duration: number; // in minutes
}

const DayPlanner = () => {
  const { tasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  
  const timeSlots = generateTimeSlots('09:00', '17:00', 15);
  
  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Unknown User';
  };

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // If dropping on a time slot
    if (destination.droppableId.startsWith('timeslot-')) {
      const timeSlot = destination.droppableId.replace('timeslot-', '');
      const taskId = draggableId.replace('task-', '');
      
      // Remove task from previous slot if it was already scheduled
      const updatedSchedule = scheduledTasks.filter(st => st.taskId !== taskId);
      
      // Add task to new time slot
      const newScheduledTask: ScheduledTask = {
        id: `${taskId}-${timeSlot}`,
        taskId,
        startTime: timeSlot,
        duration: 60 // Default 1 hour, can be made configurable
      };
      
      setScheduledTasks([...updatedSchedule, newScheduledTask]);
    }
    
    // If dropping back to task pool
    if (destination.droppableId === 'task-pool') {
      const taskId = draggableId.replace('task-', '');
      setScheduledTasks(scheduledTasks.filter(st => st.taskId !== taskId));
    }
  };

  const getScheduledTaskForSlot = (timeSlot: string) => {
    return scheduledTasks.find(st => st.startTime === timeSlot);
  };

  const getUnscheduledTasks = () => {
    const scheduledTaskIds = scheduledTasks.map(st => st.taskId);
    return tasks.filter(task => !scheduledTaskIds.includes(task.id));
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Day Planner</h1>
        <p className="text-gray-600">Plan your day by scheduling tasks in 15-minute time slots</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Schedule */}
          <div className="lg:col-span-2">
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
                    return (
                      <TimeSlot
                        key={timeSlot}
                        timeSlot={timeSlot}
                        scheduledTask={scheduledTask}
                        task={scheduledTask ? getTaskById(scheduledTask.taskId) : undefined}
                        getAssigneeName={getAssigneeName}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Pool */}
          <div>
            <TaskPool
              tasks={getUnscheduledTasks()}
              getAssigneeName={getAssigneeName}
            />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default DayPlanner;
