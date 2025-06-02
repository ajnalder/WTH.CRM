
import React, { useRef, useCallback } from 'react';
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
  const startDurationRef = useRef(0);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  const snapToSlot = useCallback((pixelDelta: number, startDuration: number) => {
    const slotHeight = 69; // Each 15-minute slot height
    const slotsChanged = Math.round(pixelDelta / slotHeight);
    const newDuration = startDuration + (slotsChanged * 15);
    
    // Clamp between 15 minutes and 8 hours
    return Math.max(15, Math.min(newDuration, 480));
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    isDraggingRef.current = true;
    setIsResizing(true);
    startYRef.current = e.clientY;
    startDurationRef.current = scheduledTask.duration;
    
    // Find the card element
    const handle = e.currentTarget as HTMLElement;
    cardRef.current = handle.closest('[data-task-card]') as HTMLDivElement;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const deltaY = e.clientY - startYRef.current;
      const snappedDuration = snapToSlot(deltaY, startDurationRef.current);
      
      // Calculate new height
      const slots = Math.ceil(snappedDuration / 15);
      const newHeight = Math.max(60, slots * 69 - 8);
      
      // Directly update the card height for immediate feedback
      if (cardRef.current) {
        cardRef.current.style.height = `${newHeight}px`;
        cardRef.current.style.transition = 'none'; // Disable transitions during drag
      }
      
      // Update the duration display without triggering re-renders
      onTempDurationChange(snappedDuration);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      isDraggingRef.current = false;
      setIsResizing(false);
      
      const deltaY = e.clientY - startYRef.current;
      const finalDuration = snapToSlot(deltaY, startDurationRef.current);
      
      // Reset the direct style manipulation and re-enable transitions
      if (cardRef.current) {
        cardRef.current.style.height = '';
        cardRef.current.style.transition = '';
      }
      
      // Only update if duration actually changed
      if (finalDuration !== scheduledTask.duration) {
        updateTaskDuration(scheduledTask.task_id, finalDuration);
      } else {
        // Reset to original duration if no change
        onTempDurationChange(scheduledTask.duration);
      }
      
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
    };

    // Use capture: true to ensure we get the events even if other elements interfere
    document.addEventListener('mousemove', handleMouseMove, { capture: true });
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
  }, [scheduledTask.duration, scheduledTask.task_id, setIsResizing, onTempDurationChange, snapToSlot, updateTaskDuration]);

  // Reset when not resizing - but prevent unnecessary re-renders
  React.useEffect(() => {
    if (!isResizing && !isDraggingRef.current) {
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
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30 pointer-events-none">
          {Math.round(((cardRef.current?.offsetHeight || 0) + 8) / 69) * 15}min
        </div>
      )}
    </div>
  );
};
