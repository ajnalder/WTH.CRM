import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { TaskTable } from '@/components/TaskTable';
import { NewTaskForm } from '@/components/NewTaskForm';

const initialTasks = [
  {
    id: 1,
    title: 'Design login page mockups',
    description: 'Create wireframes and high-fidelity mockups for the user authentication flow',
    status: 'In Progress',
    priority: 'High',
    assignee: 'Sarah Miller',
    project: 'E-commerce Platform',
    dueDate: '2024-06-15',
    tags: ['Design', 'UI/UX'],
    progress: 60
  },
  {
    id: 2,
    title: 'Implement user authentication API',
    description: 'Build REST endpoints for login, logout, and user registration',
    status: 'To Do',
    priority: 'High',
    assignee: 'John Doe',
    project: 'E-commerce Platform',
    dueDate: '2024-06-20',
    tags: ['Backend', 'API'],
    progress: 0
  },
  {
    id: 3,
    title: 'Write unit tests for payment module',
    description: 'Create comprehensive test coverage for payment processing functionality',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'Robert Johnson',
    project: 'E-commerce Platform',
    dueDate: '2024-06-18',
    tags: ['Testing', 'Backend'],
    progress: 30
  },
  {
    id: 4,
    title: 'Optimize mobile navigation',
    description: 'Improve mobile user experience and navigation performance',
    status: 'Review',
    priority: 'Medium',
    assignee: 'Alice Lee',
    project: 'Mobile App Redesign',
    dueDate: '2024-06-12',
    tags: ['Mobile', 'Performance'],
    progress: 85
  },
  {
    id: 5,
    title: 'Database schema optimization',
    description: 'Optimize database queries and improve indexing strategy',
    status: 'Done',
    priority: 'Low',
    assignee: 'Mike Kim',
    project: 'CRM Dashboard',
    dueDate: '2024-06-10',
    tags: ['Database', 'Performance'],
    progress: 100
  },
  {
    id: 6,
    title: 'Implement real-time notifications',
    description: 'Add WebSocket support for real-time user notifications',
    status: 'To Do',
    priority: 'Medium',
    assignee: 'Tom Nelson',
    project: 'Customer Support Portal',
    dueDate: '2024-06-25',
    tags: ['Frontend', 'Real-time'],
    progress: 0
  }
];

const Tasks = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleTaskCreated = (newTask: any) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusOptions = ['All', 'To Do', 'In Progress', 'Review', 'Done'];
  const priorityOptions = ['All', 'Low', 'Medium', 'High'];

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
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>Priority: {priority}</option>
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

      {/* Tasks Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredTasks.length} Task{filteredTasks.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <TaskTable tasks={filteredTasks} />
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
