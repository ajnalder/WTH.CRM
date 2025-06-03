
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskPlanningCard } from './TaskPlanningCard';
import type { TaskPlanningItem } from '@/hooks/useTaskPlanning';

interface TaskPlanningListProps {
  tasks: TaskPlanningItem[];
  onTaskOrderChange: (taskId: string, newIndex: number) => void;
  onTimeAllocationChange: (taskId: string, minutes: number) => void;
  onMarkComplete: (taskId: string) => void;
  getAssigneeName: (assigneeId: string | null) => string;
  isUpdating: boolean;
}

export const TaskPlanningList: React.FC<TaskPlanningListProps> = ({
  tasks,
  onTaskOrderChange,
  onTimeAllocationChange,
  onMarkComplete,
  getAssigneeName,
  isUpdating,
}) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.index !== destination.index) {
      onTaskOrderChange(draggableId, destination.index);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-gray-500 text-lg">No tasks found matching your criteria</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter settings</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="task-planning-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={task.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`transition-shadow ${
                      snapshot.isDragging ? 'shadow-lg' : ''
                    }`}
                  >
                    <TaskPlanningCard
                      task={task}
                      index={index + 1}
                      dragHandleProps={provided.dragHandleProps}
                      onTimeAllocationChange={onTimeAllocationChange}
                      onMarkComplete={onMarkComplete}
                      getAssigneeName={getAssigneeName}
                      isUpdating={isUpdating}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
