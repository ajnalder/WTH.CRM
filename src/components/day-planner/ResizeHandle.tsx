
import React, { useRef, useState } from 'react';
import type { ScheduledTask } from '@/types/dayPlanner';

interface ResizeHandleProps {
  scheduledTask: ScheduledTask;
  updateTaskDuration: (taskId: string, duration: number) => void;
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
  onTempDurationChange: (duration: number) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  scheduledTask,
  updateTaskDuration,
  isResizing,
  setIsResizing,
  onTempDurationChange
}) => {
  const startYRef = useRef(0);
  const initialDurationRef = useRef(0);
  const [tempDuration, setTempDuration] = useState(scheduledTask.duration);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only handle if this is specifically the resize handle
    if (!e.currentTarget.classList.contains('resize-handle')) {
      return;
    }
    
    setIsResizing(true);
    startYRef.current = e.clientY;
    initialDurationRef.current = scheduledTask.duration;
    setTempDuration(scheduledTask.duration);

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const deltaY = e.clientY - startYRef.current;
      const slotHeight = 69; // Each 15-minute slot is 69px
      
      // Simple calculation: how many 15-minute slots have we moved?
      const slotsChanged = Math.round(deltaY / slotHeight);
      
      // Calculate new duration (each slot = 15 minutes)
      const newDuration = initialDurationRef.current + (slotsChanged * 15);
      
      // Ensure minimum 15 minutes and maximum 8 hours (480 minutes)
      const clampedDuration = Math.max(15, Math.min(newDuration, 480));
      
      // Update local state for immediate visual feedback
      setTempDuration(clampedDuration);
      onTempDurationChange(clampedDuration);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsResizing(false);
      
      // Only update database if duration actually changed
      if (tempDuration !== scheduledTask.duration) {
        updateTaskDuration(scheduledTask.task_id, tempDuration);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Reset temp duration when scheduled task changes (from external updates)
  React.useEffect(() => {
    if (!isResizing) {
      setTempDuration(scheduledTask.duration);
      onTempDurationChange(scheduledTask.duration);
    }
  }, [scheduledTask.duration, isResizing, onTempDurationChange]);

  return (
    <div
      className={`resize-handle absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize bg-gradient-to-t from-gray-400 via-gray-300 to-transparent rounded-b-lg transition-colors z-20 ${
        isResizing ? 'from-blue-500 via-blue-400' : ''
      }`}
      onMouseDown={handleResizeStart}
      title="Drag to resize duration"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gray-600 rounded-t pointer-events-none"></div>
      {isResizing && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {tempDuration}min
        </div>
      )}
    </div>
  );
};
