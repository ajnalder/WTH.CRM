
import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { DayPlannerHeader } from '@/components/day-planner/DayPlannerHeader';
import { AddCustomEntryDialog } from '@/components/day-planner/AddCustomEntryDialog';
import { DailySchedule } from '@/components/day-planner/DailySchedule';
import { TaskPool } from '@/components/day-planner/TaskPool';
import { generateTimeSlots } from '@/utils/timeUtils';

interface ScheduledTask {
  id: string;
  taskId: string;
  startTime: string;
  duration: number;
  type: 'task' | 'custom';
  title?: string;
  color?: string;
}

const DayPlanner = () => {
  const { tasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDuration, setCustomDuration] = useState('30');
  const [customColor, setCustomColor] = useState('blue');
  
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

    if (destination.droppableId.startsWith('timeslot-')) {
      const timeSlot = destination.droppableId.replace('timeslot-', '');
      const taskId = draggableId.replace('task-', '');
      
      const updatedSchedule = scheduledTasks.filter(st => st.taskId !== taskId);
      
      const newScheduledTask: ScheduledTask = {
        id: `${taskId}-${timeSlot}`,
        taskId,
        startTime: timeSlot,
        duration: 60,
        type: 'task'
      };
      
      setScheduledTasks([...updatedSchedule, newScheduledTask]);
    }
    
    if (destination.droppableId === 'task-pool') {
      const taskId = draggableId.replace('task-', '');
      setScheduledTasks(scheduledTasks.filter(st => st.taskId !== taskId));
    }
  };

  const getUnscheduledTasks = () => {
    const scheduledTaskIds = scheduledTasks.filter(st => st.type === 'task').map(st => st.taskId);
    return tasks.filter(task => !scheduledTaskIds.includes(task.id));
  };

  const updateTaskDuration = (taskId: string, newDuration: number) => {
    setScheduledTasks(prev => 
      prev.map(task => 
        task.taskId === taskId ? { ...task, duration: newDuration } : task
      )
    );
  };

  const addCustomEntry = () => {
    if (!customTitle.trim()) return;
    
    const newCustomEntry: ScheduledTask = {
      id: `custom-${Date.now()}`,
      taskId: `custom-${Date.now()}`,
      startTime: '12:00',
      duration: parseInt(customDuration),
      type: 'custom',
      title: customTitle,
      color: customColor
    };
    
    setScheduledTasks([...scheduledTasks, newCustomEntry]);
    setCustomTitle('');
    setCustomDuration('30');
    setIsAddingCustom(false);
  };

  const removeScheduledTask = (taskId: string) => {
    setScheduledTasks(prev => prev.filter(task => task.taskId !== taskId));
  };

  return (
    <div className="flex-1 p-6">
      <DayPlannerHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isAddingCustom={isAddingCustom}
        setIsAddingCustom={setIsAddingCustom}
      >
        <AddCustomEntryDialog
          customTitle={customTitle}
          setCustomTitle={setCustomTitle}
          customDuration={customDuration}
          setCustomDuration={setCustomDuration}
          customColor={customColor}
          setCustomColor={setCustomColor}
          onAddCustomEntry={addCustomEntry}
        />
      </DayPlannerHeader>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DailySchedule
              timeSlots={timeSlots}
              scheduledTasks={scheduledTasks}
              getTaskById={getTaskById}
              getAssigneeName={getAssigneeName}
              updateTaskDuration={updateTaskDuration}
              removeScheduledTask={removeScheduledTask}
            />
          </div>

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
