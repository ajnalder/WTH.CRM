
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';

export const useTasksPage = () => {
  const navigate = useNavigate();
  const { tasks, isLoading, error, createTask } = useTasks();
  const { teamMembers } = useTeamMembers();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleTaskCreated = () => {
    // This will be called after a task is successfully created
    // The navigation will be handled by the TaskCreateDialog itself
  };

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Unknown User';
  };

  // Separate completed and active tasks
  const activeTasks = tasks.filter(task => task.status !== 'Done');
  const completedTasks = tasks.filter(task => task.status === 'Done');

  const filterTasks = (tasksToFilter: typeof tasks) => {
    return tasksToFilter.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.project && task.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (task.assignee && getAssigneeName(task.assignee).toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (task.client_name && task.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const sortTasks = (tasksToSort: typeof tasks) => {
    return [...tasksToSort].sort((a, b) => {
      switch (sortBy) {
        case 'assignee':
          const nameA = getAssigneeName(a.assignee);
          const nameB = getAssigneeName(b.assignee);
          return nameA.localeCompare(nameB);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const filteredActiveTasks = sortTasks(filterTasks(activeTasks));
  const filteredCompletedTasks = sortTasks(completedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.project && task.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (task.assignee && getAssigneeName(task.assignee).toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (task.client_name && task.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  }));

  const getStatusCounts = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'To Do').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      review: tasks.filter(t => t.status === 'Review').length,
      done: tasks.filter(t => t.status === 'Done').length
    };
  };

  return {
    // Data
    tasks,
    isLoading,
    error,
    filteredActiveTasks,
    filteredCompletedTasks,
    statusCounts: getStatusCounts(),
    teamMembers,
    clients,
    
    // State
    searchTerm,
    statusFilter,
    sortBy,
    viewMode,
    
    // Actions
    setSearchTerm,
    setStatusFilter,
    setSortBy,
    setViewMode,
    handleTaskCreated
  };
};
