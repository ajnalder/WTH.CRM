
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Play, Pause, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTask } from '@/hooks/useTask';
import { useTimeEntries } from '@/hooks/useTimeEntries';

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

  console.log('TaskDetails - Task ID:', id);

  const { task, isLoading: taskLoading, error: taskError } = useTask(id || '');
  const { timeEntries, totalHours, createTimeEntry, isCreating } = useTimeEntries(id || '');

  console.log('TaskDetails - Task data:', task);
  console.log('TaskDetails - Loading:', taskLoading);
  console.log('TaskDetails - Error:', taskError);

  // Timer effect - fixed to prevent React error #310
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning]);

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (taskError || !task) {
    console.error('TaskDetails - Error or no task:', taskError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h1>
          <p className="text-gray-600 mb-4">
            {taskError?.message || 'The task could not be found.'}
          </p>
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
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
      setIsTimerRunning(false);
      if (timerSeconds > 0) {
        const hours = (timerSeconds / 3600).toFixed(2);
        setNewTimeEntry(prev => ({
          ...prev,
          hours: hours
        }));
      }
    } else {
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

    createTimeEntry({
      task_id: id!,
      hours: parseFloat(newTimeEntry.hours),
      description: newTimeEntry.description,
      date: new Date().toISOString().split('T')[0]
    });

    setNewTimeEntry({ hours: '', description: '' });
    setTimerSeconds(0);
  };

  const getClientInitials = (clientName: string) => {
    return clientName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
            <div className="flex items-center gap-3">
              {task.client_name && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                  {getClientInitials(task.client_name)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
                <p className="text-gray-600">{task.project}</p>
              </div>
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
                {task.description && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{task.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Assignee</h3>
                    <p className="text-gray-600">{task.assignee || 'Unassigned'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Due Date</h3>
                    <p className="text-gray-600">{formatDate(task.due_date)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Progress</h3>
                  <div className="flex items-center space-x-3">
                    <Progress value={task.progress || 0} className="flex-1" />
                    <span className="text-sm text-gray-600">{task.progress || 0}%</span>
                  </div>
                </div>

                {task.tags && task.tags.length > 0 && (
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
                )}
              </CardContent>
            </Card>

            {/* Time Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {timeEntries.length > 0 ? (
                  <div className="space-y-3">
                    {timeEntries.map((entry) => (
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
                  <p className="text-3xl font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
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

                <Button 
                  onClick={handleSaveTimeEntry} 
                  className="w-full"
                  disabled={isCreating}
                >
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
