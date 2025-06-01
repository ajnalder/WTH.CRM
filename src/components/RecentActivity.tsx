
import React from 'react';
import { Clock, CheckSquare, MessageSquare, Upload } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'task_completed',
    user: 'John Doe',
    action: 'completed task "UI Design Review"',
    project: 'E-commerce Platform',
    time: '2 hours ago',
    icon: CheckSquare,
    color: 'text-green-600',
  },
  {
    id: 2,
    type: 'comment',
    user: 'Sarah Miller',
    action: 'commented on "Mobile App Wireframes"',
    project: 'Mobile App Redesign',
    time: '4 hours ago',
    icon: MessageSquare,
    color: 'text-blue-600',
  },
  {
    id: 3,
    type: 'file_upload',
    user: 'Alex Lee',
    action: 'uploaded design assets',
    project: 'CRM Dashboard',
    time: '6 hours ago',
    icon: Upload,
    color: 'text-purple-600',
  },
  {
    id: 4,
    type: 'task_completed',
    user: 'Mike Kim',
    action: 'completed task "Database Schema"',
    project: 'API Integration',
    time: '1 day ago',
    icon: CheckSquare,
    color: 'text-green-600',
  },
];

export const RecentActivity = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Clock className="text-gray-400" size={20} />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg bg-gray-50 ${activity.color}`}>
              <activity.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.project}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
        View All Activity
      </button>
    </div>
  );
};
