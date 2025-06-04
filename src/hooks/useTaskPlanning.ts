
import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';
import { useTaskPlanningData } from './useTaskPlanningData';

export interface TaskPlanningItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  due_date: string | null;
  project: string | null;
  client_name?: string;
  client_id?: string;
  allocated_minutes: number;
  order_index: number;
  is_scheduled: boolean;
}

export const useTaskPlanning = (selectedDate: Date = new Date()) => {
  const { tasks, updateTask, isUpdating: isUpdatingTasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const { clients } = useClients();
  const { 
    taskPlanningData, 
    upsertTaskPlanning, 
    deleteTaskPlanning, 
    isUpdating: isUpdatingPlanning 
  } = useTaskPlanningData(selectedDate);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [sortBy, setSortBy] = useState('order');

  // Create a map of task planning data for quick lookup
  const taskPlanningMap = useMemo(() => {
    const map = new Map();
    taskPlanningData.forEach(tp => {
      map.set(tp.task_id, tp);
    });
    return map;
  }, [taskPlanningData]);

  // Utility functions declared before they are used
  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Unknown User';
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'No Client';
    const client = clients.find(c => c.id === clientId);
    return client ? client.company : 'Unknown Client';
  };

  const getClientGradient = (clientId: string | null) => {
    if (!clientId) return 'from-gray-400 to-gray-600';
    const client = clients.find(c => c.id === clientId);
    return client?.gradient || 'from-blue-400 to-blue-600';
  };

  const getClientInitials = (clientName: string) => {
    return clientName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Convert tasks to planning items with database-stored allocations
  const planningTasks = useMemo(() => {
    return tasks
      .filter(task => statusFilter === 'All' || 
        (statusFilter === 'Active' && task.status !== 'Done') ||
        task.status === statusFilter)
      .map((task, index) => {
        const client = clients.find(c => c.company === task.client_name);
        const planningData = taskPlanningMap.get(task.id);
        
        return {
          ...task,
          priority: 'Medium', // Default priority since it's not in the database
          allocated_minutes: planningData?.allocated_minutes || 60,
          order_index: planningData?.order_index || index,
          is_scheduled: planningData?.is_scheduled || false,
          client_id: client?.id,
        };
      })
      .filter(task => {
        const searchLower = searchTerm.toLowerCase();
        return task.title.toLowerCase().includes(searchLower) ||
               (task.project && task.project.toLowerCase().includes(searchLower)) ||
               (task.assignee && getAssigneeName(task.assignee).toLowerCase().includes(searchLower)) ||
               (task.client_name && task.client_name.toLowerCase().includes(searchLower));
      });
  }, [tasks, searchTerm, statusFilter, teamMembers, clients, taskPlanningMap]);

  // Split tasks into available and scheduled
  const availableTasks = useMemo(() => {
    return planningTasks.filter(task => !task.is_scheduled);
  }, [planningTasks]);

  const scheduledTasks = useMemo(() => {
    return planningTasks.filter(task => task.is_scheduled);
  }, [planningTasks]);

  const getTotalAllocatedTime = () => {
    return scheduledTasks.reduce((total, task) => total + task.allocated_minutes, 0);
  };

  const scheduleTask = (taskId: string) => {
    const task = planningTasks.find(t => t.id === taskId);
    if (!task) return;

    const maxOrderIndex = Math.max(...scheduledTasks.map(t => t.order_index), -1);
    
    upsertTaskPlanning({
      task_id: taskId,
      scheduled_date: selectedDate.toISOString().split('T')[0],
      allocated_minutes: task.allocated_minutes,
      order_index: maxOrderIndex + 1,
      is_scheduled: true,
    });
  };

  const unscheduleTask = (taskId: string) => {
    deleteTaskPlanning(taskId);
  };

  const updateTaskOrder = (taskId: string, newIndex: number) => {
    const task = planningTasks.find(t => t.id === taskId);
    if (!task) return;

    upsertTaskPlanning({
      task_id: taskId,
      scheduled_date: selectedDate.toISOString().split('T')[0],
      allocated_minutes: task.allocated_minutes,
      order_index: newIndex,
      is_scheduled: task.is_scheduled,
    });
  };

  const updateTaskAllocation = (taskId: string, minutes: number) => {
    const task = planningTasks.find(t => t.id === taskId);
    if (!task) return;

    upsertTaskPlanning({
      task_id: taskId,
      scheduled_date: selectedDate.toISOString().split('T')[0],
      allocated_minutes: minutes,
      order_index: task.order_index,
      is_scheduled: task.is_scheduled,
    });
  };

  const markTaskComplete = (taskId: string) => {
    updateTask({ id: taskId, updates: { status: 'Done' } });
  };

  const sortedAvailableTasks = useMemo(() => {
    const sorted = [...availableTasks];
    
    switch (sortBy) {
      case 'due_date':
        return sorted.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
      case 'priority':
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'order':
      default:
        return sorted.sort((a, b) => a.order_index - b.order_index);
    }
  }, [availableTasks, sortBy]);

  const sortedScheduledTasks = useMemo(() => {
    return [...scheduledTasks].sort((a, b) => a.order_index - b.order_index);
  }, [scheduledTasks]);

  return {
    availableTasks: sortedAvailableTasks,
    scheduledTasks: sortedScheduledTasks,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    getTotalAllocatedTime,
    getAssigneeName,
    getClientName,
    getClientGradient,
    getClientInitials,
    scheduleTask,
    unscheduleTask,
    updateTaskOrder,
    updateTaskAllocation,
    markTaskComplete,
    isUpdating: isUpdatingTasks || isUpdatingPlanning,
  };
};
