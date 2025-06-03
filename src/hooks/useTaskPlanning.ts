
import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';

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
  allocated_minutes: number;
  order_index: number;
  is_scheduled: boolean;
}

export const useTaskPlanning = () => {
  const { tasks, updateTask, isUpdating } = useTasks();
  const { teamMembers } = useTeamMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [sortBy, setSortBy] = useState('order');

  // Convert tasks to planning items with default time allocations
  const planningTasks = useMemo(() => {
    return tasks
      .filter(task => statusFilter === 'All' || 
        (statusFilter === 'Active' && task.status !== 'Done') ||
        task.status === statusFilter)
      .map((task, index) => ({
        ...task,
        allocated_minutes: 60, // Default 1 hour allocation
        order_index: index,
        is_scheduled: false,
      }))
      .filter(task => {
        const searchLower = searchTerm.toLowerCase();
        return task.title.toLowerCase().includes(searchLower) ||
               (task.project && task.project.toLowerCase().includes(searchLower)) ||
               (task.assignee && getAssigneeName(task.assignee).toLowerCase().includes(searchLower));
      });
  }, [tasks, searchTerm, statusFilter, teamMembers]);

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Unknown User';
  };

  const getTotalAllocatedTime = () => {
    return planningTasks.reduce((total, task) => total + task.allocated_minutes, 0);
  };

  const updateTaskOrder = (taskId: string, newIndex: number) => {
    // This would ideally update a task_planning table in the database
    // For now, we'll handle it in memory
    console.log(`Moving task ${taskId} to position ${newIndex}`);
  };

  const updateTaskAllocation = (taskId: string, minutes: number) => {
    // This would ideally update a task_planning table in the database
    // For now, we'll handle it in memory
    console.log(`Allocating ${minutes} minutes to task ${taskId}`);
  };

  const markTaskComplete = (taskId: string) => {
    updateTask({ id: taskId, updates: { status: 'Done' } });
  };

  const sortedTasks = useMemo(() => {
    const sorted = [...planningTasks];
    
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
  }, [planningTasks, sortBy]);

  return {
    tasks: sortedTasks,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    getTotalAllocatedTime,
    getAssigneeName,
    updateTaskOrder,
    updateTaskAllocation,
    markTaskComplete,
    isUpdating,
  };
};
