
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TaskCreateTriggerProps {
  triggerText?: string;
  triggerVariant?: 'default' | 'outline';
}

export const TaskCreateTrigger: React.FC<TaskCreateTriggerProps> = ({
  triggerText = "New Task",
  triggerVariant = "default"
}) => {
  if (!triggerText || triggerText.trim() === '') {
    return (
      <Button variant="outline" size="icon" className="h-8 w-8">
        <Plus className="w-4 h-4" />
      </Button>
    );
  }

  if (triggerVariant === 'outline') {
    return (
      <Button variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        {triggerText}
      </Button>
    );
  }

  return (
    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
      <Plus size={20} className="mr-2" />
      {triggerText}
    </Button>
  );
};
