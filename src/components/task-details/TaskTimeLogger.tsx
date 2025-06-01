
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TaskTimeLoggerProps {
  taskId: string;
  createTimeEntry: (entry: any) => void;
  isCreating: boolean;
  initialHours?: string;
  onHoursChange?: (hours: string) => void;
}

export const TaskTimeLogger: React.FC<TaskTimeLoggerProps> = ({ 
  taskId, 
  createTimeEntry, 
  isCreating,
  initialHours = '',
  onHoursChange
}) => {
  const { toast } = useToast();
  const [newTimeEntry, setNewTimeEntry] = useState({
    hours: initialHours,
    description: ''
  });

  const handleSaveTimeEntry = () => {
    if (!newTimeEntry.hours || !newTimeEntry.description) {
      toast({
        title: "Error",
        description: "Please enter both hours and description",
        variant: "destructive"
      });
      return;
    }

    createTimeEntry({
      task_id: taskId,
      hours: parseFloat(newTimeEntry.hours),
      description: newTimeEntry.description,
      date: new Date().toISOString().split('T')[0]
    });

    setNewTimeEntry({ hours: '', description: '' });
    if (onHoursChange) {
      onHoursChange('');
    }
  };

  const handleHoursChange = (value: string) => {
    setNewTimeEntry(prev => ({ ...prev, hours: value }));
    if (onHoursChange) {
      onHoursChange(value);
    }
  };

  // Update hours when initialHours changes
  React.useEffect(() => {
    if (initialHours !== newTimeEntry.hours) {
      setNewTimeEntry(prev => ({ ...prev, hours: initialHours }));
    }
  }, [initialHours]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hours
          </label>
          <Input
            type="number"
            step="0.25"
            placeholder="e.g. 2.5"
            value={newTimeEntry.hours}
            onChange={(e) => handleHoursChange(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            placeholder="What did you work on?"
            value={newTimeEntry.description}
            onChange={(e) => setNewTimeEntry(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <Button 
          onClick={handleSaveTimeEntry} 
          className="w-full"
          disabled={isCreating}
        >
          <Save className="mr-2" size={16} />
          Save Time Entry
        </Button>
      </CardContent>
    </Card>
  );
};
