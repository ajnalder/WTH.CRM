
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskTimeSummaryProps {
  totalHours: number;
}

export const TaskTimeSummary: React.FC<TaskTimeSummaryProps> = ({ totalHours }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2" size={20} />
          Time Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
          <p className="text-gray-600">Total logged</p>
        </div>
      </CardContent>
    </Card>
  );
};
