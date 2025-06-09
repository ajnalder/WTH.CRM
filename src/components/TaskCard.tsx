
import React from 'react';
import { Calendar, User, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import type { TaskWithClient } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';

interface TaskCardProps {
  task: TaskWithClient;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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

  // Find the client by name to get their gradient color
  const client = clients.find(c => c.company === task.client_name);
  const clientGradient = client?.gradient || 'from-blue-400 to-blue-600';
  
  // Extract the base color from the gradient for the card background with tint
  const getCardBackgroundClass = (gradient: string) => {
    if (gradient.includes('blue')) return 'bg-blue-50/80 border-blue-200/80';
    if (gradient.includes('green')) return 'bg-green-50/80 border-green-200/80';
    if (gradient.includes('purple')) return 'bg-purple-50/80 border-purple-200/80';
    if (gradient.includes('red')) return 'bg-red-50/80 border-red-200/80';
    if (gradient.includes('yellow')) return 'bg-yellow-50/80 border-yellow-200/80';
    if (gradient.includes('pink')) return 'bg-pink-50/80 border-pink-200/80';
    if (gradient.includes('indigo')) return 'bg-indigo-50/80 border-indigo-200/80';
    if (gradient.includes('teal')) return 'bg-teal-50/80 border-teal-200/80';
    if (gradient.includes('orange')) return 'bg-orange-50/80 border-orange-200/80';
    if (gradient.includes('cyan')) return 'bg-cyan-50/80 border-cyan-200/80';
    if (gradient.includes('lime')) return 'bg-lime-50/80 border-lime-200/80';
    if (gradient.includes('rose')) return 'bg-rose-50/80 border-rose-200/80';
    if (gradient.includes('emerald')) return 'bg-emerald-50/80 border-emerald-200/80';
    if (gradient.includes('amber')) return 'bg-amber-50/80 border-amber-200/80';
    if (gradient.includes('violet')) return 'bg-violet-50/80 border-violet-200/80';
    if (gradient.includes('sky')) return 'bg-sky-50/80 border-sky-200/80';
    if (gradient.includes('fuchsia')) return 'bg-fuchsia-50/80 border-fuchsia-200/80';
    return 'bg-blue-50/80 border-blue-200/80'; // default
  };

  const overdueTask = isOverdue(task.due_date);
  const cardBackgroundClass = overdueTask ? 'bg-red-50/80 border-red-200/80' : getCardBackgroundClass(clientGradient);

  return (
    <Link to={`/tasks/${task.id}`}>
      <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${cardBackgroundClass} ${overdueTask ? 'ring-1 ring-red-300' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {task.client_name && (
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${clientGradient} flex items-center justify-center text-white text-sm font-semibold`}>
                  {getClientInitials(task.client_name)}
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600">{task.client_name || 'No client'}</div>
              </div>
            </div>
            <Badge className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
            {task.title}
          </CardTitle>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span>{getAssigneeName(task.assignee)}</span>
            </div>
            <div className={`flex items-center space-x-1 ${overdueTask ? 'text-red-600 font-semibold' : ''}`}>
              <Calendar size={14} />
              <span>{overdueTask ? '⚠️ ' : ''}{formatDate(task.due_date)}</span>
            </div>
          </div>

          {task.project && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <CheckCircle2 size={14} />
              <span>{task.project}</span>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
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
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
