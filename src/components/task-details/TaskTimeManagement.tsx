
import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { sanitizeString, validatePositiveNumber } from '@/utils/validation';

interface TaskTimeManagementProps {
  totalHours: number;
  taskId: string;
  createTimeEntry: (entry: any) => void;
  isCreating: boolean;
  onTimerComplete: (hours: string) => void;
  initialHours?: string;
  onHoursChange?: (hours: string) => void;
}

export const TaskTimeManagement: React.FC<TaskTimeManagementProps> = ({ 
  totalHours,
  taskId,
  createTimeEntry,
  isCreating,
  onTimerComplete,
  initialHours = '',
  onHoursChange
}) => {
  const { toast } = useToast();
  const { errors, validateForm, clearErrors } = useFormValidation();
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  // Time entry form state
  const [newTimeEntry, setNewTimeEntry] = useState({
    hours: initialHours,
    description: ''
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning]);

  // Update hours when initialHours changes
  React.useEffect(() => {
    if (initialHours !== newTimeEntry.hours) {
      setNewTimeEntry(prev => ({ ...prev, hours: initialHours }));
    }
  }, [initialHours]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      if (timerSeconds > 0) {
        const hours = (timerSeconds / 3600).toFixed(2);
        onTimerComplete(hours);
        setTimerSeconds(0);
      }
    } else {
      setIsTimerRunning(true);
      setTimerSeconds(0);
    }
  };

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Time Summary */}
        <div className="text-center pb-4 border-b border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Time Tracking</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
          <p className="text-sm text-gray-600">Total logged</p>
        </div>

        {/* Timer */}
        <div className="text-center space-y-3">
          <h4 className="font-medium text-gray-900">Timer</h4>
          <p className="text-2xl font-mono font-bold text-gray-900">
            {formatTime(timerSeconds)}
          </p>
          <Button
            onClick={toggleTimer}
            className={`w-full ${isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isTimerRunning ? (
              <>
                <Pause className="mr-2" size={16} />
                Stop Timer
              </>
            ) : (
              <>
                <Play className="mr-2" size={16} />
                Start Timer
              </>
            )}
          </Button>
        </div>

        {/* Manual Time Entry */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h4 className="font-medium text-gray-900">Log Time Manually</h4>
          
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
              rows={3}
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
        </div>
      </div>
    </div>
  );
};
