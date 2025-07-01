
import React from 'react';
import { ShadowBox } from '@/components/ui/shadow-box';

interface TaskStatsCardsProps {
  statusCounts: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  };
}

export const TaskStatsCards: React.FC<TaskStatsCardsProps> = ({ statusCounts }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4">
      <ShadowBox className="p-2 sm:p-4">
        <div className="text-lg sm:text-2xl font-bold text-gray-900">{statusCounts.total}</div>
        <div className="text-xs sm:text-sm text-gray-600">Total</div>
      </ShadowBox>
      <ShadowBox className="p-2 sm:p-4">
        <div className="text-lg sm:text-2xl font-bold text-blue-600">{statusCounts.todo}</div>
        <div className="text-xs sm:text-sm text-gray-600">To Do</div>
      </ShadowBox>
      <ShadowBox className="p-2 sm:p-4">
        <div className="text-lg sm:text-2xl font-bold text-orange-600">{statusCounts.inProgress}</div>
        <div className="text-xs sm:text-sm text-gray-600">In Progress</div>
      </ShadowBox>
      <ShadowBox className="p-2 sm:p-4">
        <div className="text-lg sm:text-2xl font-bold text-purple-600">{statusCounts.review}</div>
        <div className="text-xs sm:text-sm text-gray-600">Review</div>
      </ShadowBox>
      <ShadowBox className="p-2 sm:p-4 col-span-2 sm:col-span-1">
        <div className="text-lg sm:text-2xl font-bold text-green-600">{statusCounts.done}</div>
        <div className="text-xs sm:text-sm text-gray-600">Done</div>
      </ShadowBox>
    </div>
  );
};
