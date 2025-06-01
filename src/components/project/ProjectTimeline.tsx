
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Project {
  startDate: string;
  dueDate: string;
}

interface ProjectTimelineProps {
  project: Project;
  projectDuration: number;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, projectDuration }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-500" size={16} />
            <span className="text-sm font-medium">Start Date</span>
          </div>
          <span className="text-sm text-gray-900">{formatDate(project.startDate)}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-500" size={16} />
            <span className="text-sm font-medium">Due Date</span>
          </div>
          <span className="text-sm text-gray-900">{formatDate(project.dueDate)}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="text-gray-500" size={16} />
            <span className="text-sm font-medium">Duration</span>
          </div>
          <span className="text-sm text-gray-900">
            {projectDuration > 0 ? `${projectDuration} days` : 'Not calculated'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
