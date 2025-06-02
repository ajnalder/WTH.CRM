
import React from 'react';

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
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-0 p-4">
        <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
        <div className="text-sm text-gray-600">Total Tasks</div>
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-0 p-4">
        <div className="text-2xl font-bold text-blue-600">{statusCounts.todo}</div>
        <div className="text-sm text-gray-600">To Do</div>
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-0 p-4">
        <div className="text-2xl font-bold text-orange-600">{statusCounts.inProgress}</div>
        <div className="text-sm text-gray-600">In Progress</div>
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-0 p-4">
        <div className="text-2xl font-bold text-purple-600">{statusCounts.review}</div>
        <div className="text-sm text-gray-600">Review</div>
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-0 p-4">
        <div className="text-2xl font-bold text-green-600">{statusCounts.done}</div>
        <div className="text-sm text-gray-600">Done</div>
      </div>
    </div>
  );
};
