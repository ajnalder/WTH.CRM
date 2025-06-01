
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TaskDueDateEditorProps {
  currentDueDate: string | null;
  onDueDateUpdate: (dueDate: string | null) => void;
  isUpdating: boolean;
}

export const TaskDueDateEditor: React.FC<TaskDueDateEditorProps> = ({
  currentDueDate,
  onDueDateUpdate,
  isUpdating
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDueDate ? new Date(currentDueDate) : undefined
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onDueDateUpdate(date.toISOString().split('T')[0]);
    } else {
      onDueDateUpdate(null);
    }
    setIsOpen(false);
  };

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2">Due Date</h3>
      <div className="flex items-center gap-2">
        <p className="text-gray-600">{formatDisplayDate(currentDueDate)}</p>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={isUpdating}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateSelect(undefined)}
                className="w-full"
              >
                Clear due date
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
