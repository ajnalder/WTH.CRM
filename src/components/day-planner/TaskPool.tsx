
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Calendar } from 'lucide-react';
import { getInitials } from '@/utils/clientGradients';
import type { TaskWithClient } from '@/hooks/useTasks';
import type { Client } from '@/hooks/useClients';

interface TaskPoolProps {
  tasks: TaskWithClient[];
  getAssigneeName: (assigneeId: string | null) => string;
  getClientByName: (clientName: string) => Client | undefined;
}

export const TaskPool: React.FC<TaskPoolProps> = ({ 
  tasks, 
  getAssigneeName, 
  getClientByName 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientColorClass = (client: Client) => {
    const gradientMatch = client.gradient.match(/from-(\w+)-\d+/);
    const color = gradientMatch ? gradientMatch[1] : 'blue';
    
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200';
      case 'green': return 'bg-green-50 border-green-200';
      case 'purple': return 'bg-purple-50 border-purple-200';
      case 'red': return 'bg-red-50 border-red-200';
      case 'yellow': return 'bg-yellow-50 border-yellow-200';
      case 'pink': return 'bg-pink-50 border-pink-200';
      case 'indigo': return 'bg-indigo-50 border-indigo-200';
      case 'teal': return 'bg-teal-50 border-teal-200';
      case 'orange': return 'bg-orange-50 border-orange-200';
      case 'cyan': return 'bg-cyan-50 border-cyan-200';
      case 'lime': return 'bg-lime-50 border-lime-200';
      case 'rose': return 'bg-rose-50 border-rose-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Tasks ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Droppable droppableId="task-pool">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                snapshot.isDraggingOver ? 'bg-gray-50' : ''
              }`}
            >
              {tasks.map((task, index) => {
                const client = task.client_name ? getClientByName(task.client_name) : undefined;
                const cardColorClass = client ? getClientColorClass(client) : 'bg-white border-gray-200';
                
                return (
                  <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`border rounded-lg p-3 shadow-sm cursor-move transition-shadow ${cardColorClass} ${
                          snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {client && (
                              <Avatar className="h-5 w-5 flex-shrink-0">
                                <AvatarFallback className={`bg-gradient-to-br ${client.gradient} text-white text-xs font-semibold`}>
                                  {getInitials(client.company)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1 min-w-0">
                              {task.title}
                            </h4>
                          </div>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User size={12} />
                            <span>{getAssigneeName(task.assignee)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              
              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">All tasks are scheduled!</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};
