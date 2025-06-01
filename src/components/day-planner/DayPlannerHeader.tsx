
import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

interface DayPlannerHeaderProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isAddingCustom: boolean;
  setIsAddingCustom: (adding: boolean) => void;
  children: React.ReactNode; // for the dialog content
}

export const DayPlannerHeader: React.FC<DayPlannerHeaderProps> = ({
  selectedDate,
  setSelectedDate,
  isAddingCustom,
  setIsAddingCustom,
  children
}) => {
  return (
    <div className="mb-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Day Planner</h1>
        <p className="text-gray-600">Plan your day by scheduling tasks and breaks in 15-minute increments</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={20} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <Dialog open={isAddingCustom} onOpenChange={setIsAddingCustom}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus size={16} className="mr-2" />
              Add Break/Lunch
            </Button>
          </DialogTrigger>
          {children}
        </Dialog>
      </div>
    </div>
  );
};
