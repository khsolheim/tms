import React from 'react';

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

interface ActivityFeedProps {
  config?: any;
  activities?: Activity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ config, activities = [] }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">Siste aktiviteter</h3>
      {activities.length > 0 ? (
        <div className="space-y-2">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Ingen aktiviteter å vise</p>
        </div>
      )}
    </div>
  );
};