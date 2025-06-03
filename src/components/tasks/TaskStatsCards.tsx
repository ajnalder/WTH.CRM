
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
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <ShadowBox className="p-4">
        <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
        <div className="text-sm text-gray-600">Total Tasks</div>
      </ShadowBox>
      <ShadowBox className="p-4">
        <div className="text-2xl font-bold text-blue-600">{statusCounts.todo}</div>
        <div className="text-sm text-gray-600">To Do</div>
      </ShadowBox>
      <ShadowBox className="p-4">
        <div className="text-2xl font-bold text-orange-600">{statusCounts.inProgress}</div>
        <div className="text-sm text-gray-600">In Progress</div>
      </ShadowBox>
      <ShadowBox className="p-4">
        <div className="text-2xl font-bold text-purple-600">{statusCounts.review}</div>
        <div className="text-sm text-gray-600">Review</div>
      </ShadowBox>
      <ShadowBox className="p-4">
        <div className="text-2xl font-bold text-green-600">{statusCounts.done}</div>
        <div className="text-sm text-gray-600">Done</div>
      </ShadowBox>
    </div>
  );
};
