
import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Clock, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  type: 'task' | 'custom';
  title?: string; // for custom entries
  color?: string; // for custom entries
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

    // If dropping on a time slot
    if (destination.droppableId.startsWith('timeslot-')) {
      const timeSlot = destination.droppableId.replace('timeslot-', '');
      const taskId = draggableId.replace('task-', '');
      
      // Remove task from previous slot if it was already scheduled
      const updatedSchedule = scheduledTasks.filter(st => st.taskId !== taskId);
      
      // Add task to new time slot with default duration
      const newScheduledTask: ScheduledTask = {
        id: `${taskId}-${timeSlot}`,
        taskId,
        startTime: timeSlot,
        duration: 60, // Default 1 hour
        type: 'task'
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
    return scheduledTasks.find(st => {
      const startIndex = timeSlots.indexOf(st.startTime);
      const endIndex = startIndex + Math.ceil(st.duration / 15);
      const currentIndex = timeSlots.indexOf(timeSlot);
      return currentIndex >= startIndex && currentIndex < endIndex;
    });
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
      startTime: '12:00', // Default to lunch time
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Day Planner</h1>
        <p className="text-gray-600">Plan your day by scheduling tasks and breaks in 15-minute increments</p>
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
          
          <Dialog open={isAddingCustom} onOpenChange={setIsAddingCustom}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus size={16} className="mr-2" />
                Add Break/Lunch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Time Block</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g., Lunch, Coffee Break, Meeting"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={customDuration} onValueChange={setCustomDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select value={customColor} onValueChange={setCustomColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addCustomEntry} className="w-full">
                  Add Time Block
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                        isFirstSlot={isFirstSlotOfTask}
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
