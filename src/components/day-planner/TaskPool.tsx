
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar } from 'lucide-react';
import type { TaskWithClient } from '@/hooks/useTasks';

interface TaskPoolProps {
  tasks: TaskWithClient[];
  getAssigneeName: (assigneeId: string | null) => string;
}

export const TaskPool: React.FC<TaskPoolProps> = ({ tasks, getAssigneeName }) => {
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
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-move transition-shadow ${
                        snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {task.title}
                        </h4>
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
              ))}
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
