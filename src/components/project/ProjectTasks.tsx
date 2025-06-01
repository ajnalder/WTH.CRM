
import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/useTasks';

interface Project {
  id: string;
  name: string;
  tasks: { completed: number; total: number };
}

interface ProjectTasksProps {
  project: Project;
}

export const ProjectTasks: React.FC<ProjectTasksProps> = ({ project }) => {
  const { tasks } = useTasks();
  
  // Calculate real task counts for this project
  const projectTasks = tasks.filter(task => task.project === project.name);
  const completedTasks = projectTasks.filter(task => task.status === 'Completed' || task.status === 'Done').length;
  const inProgressTasks = projectTasks.filter(task => task.status === 'In Progress' || task.status === 'To Do').length;
  const totalTasks = projectTasks.length;

  // Avoid division by zero
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="text-green-500" size={16} />
            <span className="text-sm">Completed</span>
          </div>
          <span className="text-sm font-medium">{completedTasks}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="text-blue-500" size={16} />
            <span className="text-sm">In Progress</span>
          </div>
          <span className="text-sm font-medium">{inProgressTasks}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-gray-500" size={16} />
            <span className="text-sm">Total</span>
          </div>
          <span className="text-sm font-medium">{totalTasks}</span>
        </div>
        <div className="pt-2 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {completionPercentage}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
