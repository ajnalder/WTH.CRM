
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface NewTaskFormTriggerProps {
  triggerText: string;
  triggerVariant: 'default' | 'outline';
}

export const NewTaskFormTrigger: React.FC<NewTaskFormTriggerProps> = ({ 
  triggerText, 
  triggerVariant 
}) => {
  if (triggerVariant === 'outline') {
    return (
      <Button variant="outline">
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
