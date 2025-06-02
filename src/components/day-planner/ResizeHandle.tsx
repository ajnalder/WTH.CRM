
import React, { useRef, useState, useCallback } from 'react';
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
  const startHeightRef = useRef(0);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const snapToSlot = useCallback((pixelDelta: number, startDuration: number) => {
    const slotHeight = 69; // Each 15-minute slot
    const slotsChanged = Math.round(pixelDelta / slotHeight);
    const newDuration = startDuration + (slotsChanged * 15);
    
    // Clamp between 15 minutes and 8 hours
    return Math.max(15, Math.min(newDuration, 480));
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    startYRef.current = e.clientY;
    
    // Find the card element to directly manipulate its height
    const handle = e.currentTarget as HTMLElement;
    cardRef.current = handle.closest('[data-task-card]') as HTMLDivElement;
    
    if (cardRef.current) {
      startHeightRef.current = cardRef.current.offsetHeight;
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const deltaY = e.clientY - startYRef.current;
      const snappedDuration = snapToSlot(deltaY, scheduledTask.duration);
      
      // Calculate new height
      const slots = Math.ceil(snappedDuration / 15);
      const newHeight = Math.max(60, slots * 69 - 8);
      
      // Directly update the card height for immediate feedback
      if (cardRef.current) {
        cardRef.current.style.height = `${newHeight}px`;
      }
      
      // Update the duration display
      onTempDurationChange(snappedDuration);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsResizing(false);
      
      const deltaY = e.clientY - startYRef.current;
      const finalDuration = snapToSlot(deltaY, scheduledTask.duration);
      
      // Reset the direct style manipulation
      if (cardRef.current) {
        cardRef.current.style.height = '';
      }
      
      // Only update database if duration actually changed
      if (finalDuration !== scheduledTask.duration) {
        updateTaskDuration(scheduledTask.task_id, finalDuration);
      } else {
        // Reset to original duration if no change
        onTempDurationChange(scheduledTask.duration);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Reset when not resizing
  React.useEffect(() => {
    if (!isResizing) {
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
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30">
          {Math.round(((cardRef.current?.offsetHeight || 0) + 8) / 69) * 15}min
        </div>
      )}
    </div>
  );
};
