
import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';

interface TimeEntry {
  id: string;
  hours: number;
  description: string;
  date: string;
  created_at: string;
}

interface TaskTimeEntriesProps {
  timeEntries: TimeEntry[];
}

export const TaskTimeEntries: React.FC<TaskTimeEntriesProps> = ({ timeEntries }) => {
  if (timeEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-gray-600">No time entries recorded yet</p>
          <p className="text-sm text-gray-500">Use the timer or log time manually to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
          <span className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full">
            {timeEntries.length}
          </span>
        </div>
        
        <div className="space-y-4">
          {timeEntries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {entry.hours}h
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium mb-1">{entry.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                  </div>
                  <span>
                    Logged {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
