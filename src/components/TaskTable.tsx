
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
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskTableProps {
  tasks: TaskWithClient[];
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
  const { teamMembers } = useTeamMembers();
  const { clients } = useClients();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Done': return 'bg-green-100 text-green-800';
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

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    dueDate.setHours(0, 0, 0, 0); // Reset time to start of day
    return dueDate < today;
  };

  const getClientInitials = (clientName: string) => {
    return clientName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Unknown User';
  };

  const getClientGradient = (clientName: string) => {
    const client = clients.find(c => c.company === clientName);
    return client?.gradient || 'from-blue-400 to-blue-600';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Tags</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const clientGradient = task.client_name ? getClientGradient(task.client_name) : 'from-blue-400 to-blue-600';
          const overdueTask = isOverdue(task.due_date);
          
          return (
            <TableRow key={task.id} className={overdueTask ? 'bg-red-50/50' : ''}>
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
              <TableCell>
                {task.client_name && (
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${clientGradient} flex items-center justify-center text-white text-xs font-semibold`}>
                      {getClientInitials(task.client_name)}
                    </div>
                    <span className="text-sm text-gray-600">{task.client_name}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-gray-900">{task.project || 'No project'}</TableCell>
              <TableCell className="text-gray-900">{getAssigneeName(task.assignee)}</TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(task.status)}`}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell className={`${overdueTask ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                {overdueTask ? '⚠️ ' : ''}{formatDate(task.due_date)}
              </TableCell>
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
          );
        })}
      </TableBody>
    </Table>
  );
};
