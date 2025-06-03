
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  progress: number;
  budget: number;
  team: string[];
  dueDate: string;
  isRetainer?: boolean;
  tasks: { completed: number; total: number };
}

interface ProjectStatsProps {
  project: Project;
  daysUntilDue: number;
  onDueDateUpdate?: (dueDate: string | null) => void;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ 
  project, 
  daysUntilDue
}) => {
  const formatBudget = (budget: number) => {
    if (!budget || budget === 0) return 'Not set';
    return `$${budget.toLocaleString()}`;
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {project.tasks.completed}/{project.tasks.total}
          </div>
          <p className="text-sm text-gray-600">tasks completed</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{formatBudget(project.budget)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {project.isRetainer ? 'Project Type' : 'Due Date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project.isRetainer ? (
            <div className="flex flex-col">
              <Badge variant="secondary" className="w-fit mb-1">
                Retainer
              </Badge>
              <p className="text-sm text-gray-600">Ongoing project</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900">
                  {daysUntilDue > 0 ? `${daysUntilDue}` : daysUntilDue < 0 ? 'Overdue' : 'Due today'}
                </div>
                <p className="text-sm text-gray-600">
                  {daysUntilDue > 0 ? 'days left' : daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days ago` : ''}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDisplayDate(project.dueDate)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
