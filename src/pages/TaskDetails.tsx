
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Play, Pause, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Mock task data - in a real app this would come from an API
const mockTasks = [
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
    progress: 60,
    timeLogged: 8.5,
    timeEntries: [
      { id: 1, date: '2024-06-10', hours: 3.5, description: 'Initial wireframes' },
      { id: 2, date: '2024-06-11', hours: 5, description: 'High-fidelity mockups' }
    ]
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
    progress: 0,
    timeLogged: 0,
    timeEntries: []
  }
];

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [newTimeEntry, setNewTimeEntry] = useState({
    hours: '',
    description: ''
  });

  // Find the task by ID
  const task = mockTasks.find(t => t.id === parseInt(id || '0'));

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h1>
          <Button onClick={() => navigate('/tasks')}>
            <ArrowLeft className="mr-2" size={16} />
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      // Stop timer
      setIsTimerRunning(false);
      if (timerSeconds > 0) {
        const hours = (timerSeconds / 3600).toFixed(2);
        setNewTimeEntry(prev => ({
          ...prev,
          hours: hours
        }));
      }
    } else {
      // Start timer
      setIsTimerRunning(true);
      setTimerSeconds(0);
    }
  };

  const handleSaveTimeEntry = () => {
    if (!newTimeEntry.hours || !newTimeEntry.description) {
      toast({
        title: "Error",
        description: "Please enter both hours and description",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would save to the backend
    toast({
      title: "Time logged",
      description: `${newTimeEntry.hours} hours logged successfully`
    });

    setNewTimeEntry({ hours: '', description: '' });
    setTimerSeconds(0);
  };

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tasks')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Tasks
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <p className="text-gray-600">{task.project}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={`${getStatusColor(task.status)}`}>
                {task.status}
              </Badge>
              <Badge className={`${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details */}
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{task.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Assignee</h3>
                    <p className="text-gray-600">{task.assignee}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Due Date</h3>
                    <p className="text-gray-600">{formatDate(task.dueDate)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Progress</h3>
                  <div className="flex items-center space-x-3">
                    <Progress value={task.progress} className="flex-1" />
                    <span className="text-sm text-gray-600">{task.progress}%</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {task.timeEntries.length > 0 ? (
                  <div className="space-y-3">
                    {task.timeEntries.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{entry.description}</p>
                          <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{entry.hours}h</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No time entries yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Time Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2" size={20} />
                  Time Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{task.timeLogged}h</p>
                  <p className="text-gray-600">Total logged</p>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card>
              <CardHeader>
                <CardTitle>Time Tracker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold text-gray-900">
                    {formatTime(timerSeconds)}
                  </p>
                  <Button
                    onClick={toggleTimer}
                    className={`mt-2 w-full ${isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="mr-2" size={16} />
                        Stop Timer
                      </>
                    ) : (
                      <>
                        <Play className="mr-2" size={16} />
                        Start Timer
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Log Time */}
            <Card>
              <CardHeader>
                <CardTitle>Log Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours
                  </label>
                  <Input
                    type="number"
                    step="0.25"
                    placeholder="e.g. 2.5"
                    value={newTimeEntry.hours}
                    onChange={(e) => setNewTimeEntry(prev => ({ ...prev, hours: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    placeholder="What did you work on?"
                    value={newTimeEntry.description}
                    onChange={(e) => setNewTimeEntry(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button onClick={handleSaveTimeEntry} className="w-full">
                  <Save className="mr-2" size={16} />
                  Save Time Entry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
