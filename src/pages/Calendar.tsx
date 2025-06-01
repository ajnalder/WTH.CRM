
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Users } from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

const projects = [
  {
    id: 1,
    name: 'E-commerce Platform',
    client: 'TechCorp Inc.',
    status: 'In Progress',
    progress: 65,
    startDate: '2024-06-01',
    dueDate: '2024-07-15',
    team: ['JD', 'SM', 'RJ'],
    priority: 'High',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Mobile App Redesign',
    client: 'StartupXYZ',
    status: 'In Progress',
    progress: 40,
    startDate: '2024-06-15',
    dueDate: '2024-08-01',
    team: ['AL', 'MK'],
    priority: 'Medium',
    color: 'bg-green-500'
  },
  {
    id: 3,
    name: 'CRM Dashboard',
    client: 'BusinessFlow',
    status: 'Review',
    progress: 90,
    startDate: '2024-05-20',
    dueDate: '2024-06-20',
    team: ['PL', 'JD', 'TN'],
    priority: 'High',
    color: 'bg-yellow-500'
  },
  {
    id: 4,
    name: 'Portfolio Website',
    client: 'Creative Agency',
    status: 'Completed',
    progress: 100,
    startDate: '2024-05-01',
    dueDate: '2024-06-01',
    team: ['SM', 'RJ'],
    priority: 'Low',
    color: 'bg-gray-500'
  },
  {
    id: 5,
    name: 'API Integration',
    client: 'DataFlow Systems',
    status: 'Planning',
    progress: 15,
    startDate: '2024-07-01',
    dueDate: '2024-09-15',
    team: ['MK', 'AL', 'PL'],
    priority: 'Medium',
    color: 'bg-purple-500'
  },
  {
    id: 6,
    name: 'Marketing Landing Page',
    client: 'GrowthHackers',
    status: 'In Progress',
    progress: 75,
    startDate: '2024-06-01',
    dueDate: '2024-07-10',
    team: ['TN', 'JD'],
    priority: 'High',
    color: 'bg-red-500'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Review':
      return 'bg-yellow-100 text-yellow-800';
    case 'Planning':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'timeline'>('month');

  const getProjectsForDate = (date: Date) => {
    return projects.filter(project => {
      const startDate = parseISO(project.startDate);
      const endDate = parseISO(project.dueDate);
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  const selectedDateProjects = selectedDate ? getProjectsForDate(selectedDate) : [];

  const modifiers = {
    hasProjects: (date: Date) => getProjectsForDate(date).length > 0,
  };

  const modifiersStyles = {
    hasProjects: {
      backgroundColor: '#e0f2fe',
      border: '2px solid #0ea5e9',
      borderRadius: '4px',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Calendar</h1>
          <p className="text-gray-600">View project timelines and deadlines</p>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CalendarDays className="inline-block mr-2 h-4 w-4" />
              Month View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Clock className="inline-block mr-2 h-4 w-4" />
              Timeline View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            {viewMode === 'month' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Project Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="rounded-md border"
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                      <span>Days with active projects</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project) => {
                      const startDate = parseISO(project.startDate);
                      const endDate = parseISO(project.dueDate);
                      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                      
                      return (
                        <div key={project.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                          <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <p className="text-sm text-gray-600">{project.client}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}</span>
                              <span>{duration} days</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Selected Date Projects */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate 
                    ? `Projects on ${format(selectedDate, 'MMM dd, yyyy')}`
                    : 'Select a date'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateProjects.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateProjects.map((project) => (
                      <div key={project.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                          <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{project.client}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={`${getStatusColor(project.status)} text-xs`}>
                            {project.status}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {project.team.length}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Due: {format(parseISO(project.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No projects scheduled for this date</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Legend */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Project Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                      <span className="text-sm text-gray-700">{project.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
