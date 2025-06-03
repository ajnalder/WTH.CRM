
import React from 'react';

export const TimelineRuler: React.FC = () => {
  const hours = Array.from({ length: 9 }, (_, i) => {
    const hour = 8 + i;
    const displayHour = hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}${period}`;
  });

  return (
    <div className="w-16 bg-gray-50 border-r border-gray-200 relative">
      {hours.map((time, index) => (
        <div
          key={time}
          className="absolute text-xs text-gray-600 font-medium -translate-y-2 pl-2"
          style={{ top: `${index * 60}px` }}
        >
          {time}
        </div>
      ))}
    </div>
  );
};
