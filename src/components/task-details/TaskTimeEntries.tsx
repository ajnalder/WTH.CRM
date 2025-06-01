
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimeEntry {
  id: string;
  description: string;
  date: string;
  hours: number;
}

interface TaskTimeEntriesProps {
  timeEntries: TimeEntry[];
}

export const TaskTimeEntries: React.FC<TaskTimeEntriesProps> = ({ timeEntries }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {timeEntries.length > 0 ? (
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{entry.description}</p>
                  <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{entry.hours}h</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No time entries yet</p>
        )}
      </CardContent>
    </Card>
  );
};
