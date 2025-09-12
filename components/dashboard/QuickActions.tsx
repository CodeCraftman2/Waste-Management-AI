"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Trophy, Gift } from 'lucide-react';
import Button from '../ui/Button';

const quickActions = [
  {
    title: 'Report Waste',
    description: 'Take a photo and report waste in your area',
    icon: Camera,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    href: '/report'
  },
  {
    title: 'Find Collection Tasks',
    description: 'Discover nearby waste collection opportunities',
    icon: MapPin,
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    href: '/collect'
  },
  {
    title: 'View Leaderboard',
    description: 'See how you rank among eco-warriors',
    icon: Trophy,
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    href: '/leaderboard'
  },
  {
    title: 'Claim Rewards',
    description: 'Redeem your points for amazing rewards',
    icon: Gift,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    href: '/rewards'
  }
];

export const QuickActions: React.FC = () => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {quickActions.map((action, index) => (
        <motion.a
          key={action.title}
          href={action.href}
          className="block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
            <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
            <p className="text-sm text-gray-400">{action.description}</p>
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
};