
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TaskCreateTriggerProps {
  triggerText?: string;
  triggerVariant?: 'default' | 'outline';
}

export const TaskCreateTrigger = React.forwardRef<HTMLButtonElement, TaskCreateTriggerProps>(({
  triggerText = "New Task",
  triggerVariant = "default"
}, ref) => {
  // Determine if we should show icon only
  const isIconOnly = !triggerText || triggerText.trim() === '';
  
  // Determine button variant and classes
  const buttonVariant = isIconOnly ? 'outline' : triggerVariant;
  const buttonSize = isIconOnly ? 'icon' : (triggerVariant === 'outline' ? 'sm' : 'default');
  const buttonClasses = isIconOnly 
    ? "h-8 w-8"
    : triggerVariant === 'outline' 
      ? "" 
      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700";

  return (
    <Button 
      ref={ref} 
      variant={buttonVariant} 
      size={buttonSize}
      className={buttonClasses}
    >
      {isIconOnly ? (
        <Plus className="w-4 h-4" />
      ) : (
        <>
          <Plus size={triggerVariant === 'outline' ? 16 : 20} className="mr-2" />
          {triggerText}
        </>
      )}
    </Button>
  );
});

TaskCreateTrigger.displayName = 'TaskCreateTrigger';
