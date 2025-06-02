
import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { TaskTable } from '@/components/TaskTable';
import { NewTaskForm } from '@/components/NewTaskForm';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';

const Tasks = () => {
  const { tasks, isLoading, error } = useTasks();
  const { teamMembers } = useTeamMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date'); // Changed default to due_date
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Tasks</h1>
          <p className="text-gray-600 mb-4">There was an error loading the tasks.</p>
        </div>
      </div>
    );
  }

  const handleTaskCreated = () => {
    // The useTasks hook will automatically refetch tasks after creation
  };

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Unknown User';
  };

  // Separate completed and active tasks
  const activeTasks = tasks.filter(task => task.status !== 'Done');
  const completedTasks = tasks.filter(task => task.status === 'Done');

  let filteredActiveTasks = activeTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.project && task.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (task.assignee && getAssigneeName(task.assignee).toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (task.client_name && task.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  let filteredCompletedTasks = completedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.project && task.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (task.assignee && getAssigneeName(task.assignee).toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (task.client_name && task.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Sort tasks based on selected sort criteria
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

  filteredActiveTasks = sortTasks(filteredActiveTasks);
  filteredCompletedTasks = sortTasks(filteredCompletedTasks);

  const statusOptions = ['All', 'To Do', 'In Progress', 'Review'];
  const sortOptions = [
    { value: 'due_date', label: 'Due Date' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
    { value: 'assignee', label: 'Staff Member' }
  ];

  const getStatusCounts = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'To Do').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      review: tasks.filter(t => t.status === 'Review').length,
      done: tasks.filter(t => t.status === 'Done').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
        <p className="text-gray-600">Manage and track all project tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.todo}</div>
          <div className="text-sm text-gray-600">To Do</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-orange-600">{statusCounts.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-purple-600">{statusCounts.review}</div>
          <div className="text-sm text-gray-600">Review</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-green-600">{statusCounts.done}</div>
          <div className="text-sm text-gray-600">Done</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search tasks, projects, or assignees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>Status: {status}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>Sort by: {option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                Table
              </button>
            </div>
            
            <NewTaskForm onTaskCreated={handleTaskCreated} />
          </div>
        </div>
      </div>

      {/* Active Tasks Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Active Tasks ({filteredActiveTasks.length})
          </h2>
        </div>

        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredActiveTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <TaskTable tasks={filteredActiveTasks} />
        )}

        {filteredActiveTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active tasks found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Completed Tasks Section */}
      {filteredCompletedTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Finished Tasks ({filteredCompletedTasks.length})
            </h2>
          </div>

          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-75">
              {filteredCompletedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="opacity-75">
              <TaskTable tasks={filteredCompletedTasks} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
