
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { sanitizeString, validatePositiveNumber } from '@/utils/validation';

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
  const { errors, validateForm, clearErrors } = useFormValidation();
  const [newTimeEntry, setNewTimeEntry] = useState({
    hours: initialHours,
    description: ''
  });

  const validationRules = {
    hours: {
      required: true,
      type: 'number' as const,
      min: 0.25,
      max: 24,
      custom: (value: string) => {
        const num = parseFloat(value);
        if (!validatePositiveNumber(num, 24)) {
          return 'Hours must be between 0.25 and 24';
        }
        if (num % 0.25 !== 0) {
          return 'Hours must be in 0.25 increments (e.g., 1.25, 2.5)';
        }
        return null;
      }
    },
    description: {
      required: true,
      minLength: 3,
      maxLength: 500,
      type: 'text' as const
    }
  };

  const handleSaveTimeEntry = () => {
    const sanitizedEntry = {
      hours: newTimeEntry.hours,
      description: sanitizeString(newTimeEntry.description, 500)
    };

    const isValid = validateForm(sanitizedEntry, validationRules);

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive"
      });
      return;
    }

    createTimeEntry({
      task_id: taskId,
      hours: parseFloat(sanitizedEntry.hours),
      description: sanitizedEntry.description,
      date: new Date().toISOString().split('T')[0]
    });

    setNewTimeEntry({ hours: '', description: '' });
    clearErrors();
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

  const handleDescriptionChange = (value: string) => {
    setNewTimeEntry(prev => ({ ...prev, description: value }));
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
            Hours *
          </label>
          <Input
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            placeholder="e.g. 2.5"
            value={newTimeEntry.hours}
            onChange={(e) => handleHoursChange(e.target.value)}
            className={errors.hours ? 'border-red-500' : ''}
          />
          {errors.hours && (
            <p className="text-sm text-red-600 mt-1">{errors.hours[0]}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <Textarea
            placeholder="What did you work on?"
            value={newTimeEntry.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            maxLength={500}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description[0]}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {newTimeEntry.description.length}/500 characters
          </p>
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
