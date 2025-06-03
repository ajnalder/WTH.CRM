
import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';

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

export const useTaskPlanning = () => {
  const { tasks, updateTask, isUpdating } = useTasks();
  const { teamMembers } = useTeamMembers();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [sortBy, setSortBy] = useState('order');
  const [scheduledTaskIds, setScheduledTaskIds] = useState<string[]>([]);

  // Convert tasks to planning items with default time allocations and client info
  const planningTasks = useMemo(() => {
    return tasks
      .filter(task => statusFilter === 'All' || 
        (statusFilter === 'Active' && task.status !== 'Done') ||
        task.status === statusFilter)
      .map((task, index) => {
        // Find client info through project name
        const client = clients.find(c => c.company === task.client_name);
        
        return {
          ...task,
          priority: 'Medium', // Default priority since it's not in the database
          allocated_minutes: 60, // Default 1 hour allocation
          order_index: index,
          is_scheduled: scheduledTaskIds.includes(task.id),
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
  }, [tasks, searchTerm, statusFilter, teamMembers, clients, scheduledTaskIds]);

  // Split tasks into available and scheduled
  const availableTasks = useMemo(() => {
    return planningTasks.filter(task => !task.is_scheduled);
  }, [planningTasks]);

  const scheduledTasks = useMemo(() => {
    return planningTasks.filter(task => task.is_scheduled);
  }, [planningTasks]);

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

  const getTotalAllocatedTime = () => {
    return scheduledTasks.reduce((total, task) => total + task.allocated_minutes, 0);
  };

  const scheduleTask = (taskId: string) => {
    setScheduledTaskIds(prev => [...prev, taskId]);
  };

  const unscheduleTask = (taskId: string) => {
    setScheduledTaskIds(prev => prev.filter(id => id !== taskId));
  };

  const updateTaskOrder = (taskId: string, newIndex: number) => {
    console.log(`Moving task ${taskId} to position ${newIndex}`);
  };

  const updateTaskAllocation = (taskId: string, minutes: number) => {
    console.log(`Allocating ${minutes} minutes to task ${taskId}`);
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
    isUpdating,
  };
};
