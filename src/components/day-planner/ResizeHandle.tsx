
import React, { useRef } from 'react';

interface ResizeHandleProps {
  scheduledTask: {
    id: string;
    taskId: string;
    duration: number;
  };
  updateTaskDuration: (taskId: string, duration: number) => void;
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  scheduledTask,
  updateTaskDuration,
  isResizing,
  setIsResizing
}) => {
  const startYRef = useRef(0);
  const initialDurationRef = useRef(0);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startYRef.current = e.clientY;
    initialDurationRef.current = scheduledTask.duration;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startYRef.current;
      const slotHeight = 64; // Each 15-minute slot is 64px (including gap)
      const slotsChanged = Math.round(deltaY / slotHeight);
      const newDuration = Math.max(15, initialDurationRef.current + (slotsChanged * 15));
      
      // Cap at reasonable maximum (8 hours)
      const cappedDuration = Math.min(newDuration, 480);
      
      if (cappedDuration !== scheduledTask.duration) {
        updateTaskDuration(scheduledTask.taskId, cappedDuration);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize bg-gradient-to-t from-gray-400 via-gray-300 to-transparent rounded-b-lg transition-colors ${
        isResizing ? 'from-blue-500 via-blue-400' : ''
      }`}
      onMouseDown={handleResizeStart}
      title="Drag to resize duration"
    >
      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gray-600 rounded-t"></div>
    </div>
  );
};
