"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Coins } from 'lucide-react';

interface Activity {
  id: number;
  type: 'report' | 'collect' | 'reward';
  description: string;
  location?: string;
  points?: number;
  time: string;
  status: 'completed' | 'pending' | 'verified';
}

const activities: Activity[] = [
  {
    id: 1,
    type: 'report',
    description: 'Reported plastic waste',
    location: 'Central Park, NYC',
    points: 25,
    time: '2 hours ago',
    status: 'verified'
  },
  {
    id: 2,
    type: 'collect',
    description: 'Collected organic waste',
    location: 'Times Square',
    points: 30,
    time: '5 hours ago',
    status: 'completed'
  },
  {
    id: 3,
    type: 'reward',
    description: 'Level up bonus',
    points: 100,
    time: '1 day ago',
    status: 'completed'
  },
  {
    id: 4,
    type: 'report',
    description: 'Reported mixed waste',
    location: 'Brooklyn Bridge',
    points: 20,
    time: '2 days ago',
    status: 'pending'
  }
];

export const RecentActivity: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'report':
        return 'bg-blue-500/20 text-blue-400';
      case 'collect':
        return 'bg-green-500/20 text-green-400';
      case 'reward':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <motion.div
      className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
              {activity.type === 'report' && <MapPin className="w-4 h-4" />}
              {activity.type === 'collect' && <CheckCircle className="w-4 h-4" />}
              {activity.type === 'reward' && <Coins className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{activity.description}</p>
              {activity.location && (
                <p className="text-sm text-gray-400">{activity.location}</p>
              )}
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
            <div className="flex items-center space-x-2">
              {activity.points && (
                <span className="text-sm font-medium text-blue-400">
                  +{activity.points}
                </span>
              )}
              {getStatusIcon(activity.status)}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};