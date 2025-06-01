
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Tables } from '@/integrations/supabase/types';

type Task = Tables<'tasks'>;

interface TaskTableProps {
  tasks: Task[];
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
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
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Tags</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <div>
                <div className="font-medium text-gray-900">{task.title}</div>
                {task.description && (
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {task.description}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-gray-900">{task.project || 'No project'}</TableCell>
            <TableCell className="text-gray-900">{task.assignee || 'Unassigned'}</TableCell>
            <TableCell>
              <Badge className={`${getStatusColor(task.status)}`}>
                {task.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={`${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-600">{formatDate(task.due_date)}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Progress value={task.progress || 0} className="w-16 h-2" />
                <span className="text-sm text-gray-600">{task.progress || 0}%</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {task.tags && task.tags.length > 0 ? (
                  <>
                    {task.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{task.tags.length - 2}
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-400">No tags</span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
