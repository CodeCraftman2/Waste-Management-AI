"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Recycle, Users, MapPin, Award, TrendingUp, Leaf } from 'lucide-react';
import Layout from '../components/Layout';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { QuickActions } from '../components/dashboard/QuickActions';
import SolanaWallet from '../components/SolanaWallet';
import { useThemeColors } from '../lib/themeUtils';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useWeb3Auth } from '../components/Web3AuthProvider';

export default function Dashboard() {
  const colors = useThemeColors();
  const { userInfo } = useWeb3Auth();
  
  const stats = [
    {
      title: 'Total Reports',
      value: '1,247',
      icon: Recycle,
      trend: { value: 12, isPositive: true },
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Points Earned',
      value: '3,450',
      icon: Award,
      trend: { value: 8, isPositive: true },
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Collections',
      value: '89',
      icon: MapPin,
      trend: { value: 15, isPositive: true },
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      title: 'Community Rank',
      value: '#23',
      icon: TrendingUp,
      trend: { value: 5, isPositive: true },
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    }
  ];

  return (
    <ProtectedRoute>
      <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-green-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
              Welcome to ScrapAI
            </h1>
          </div>
          <p className={`text-xl ${colors.textSecondary} max-w-2xl mx-auto`}>
            Join the movement to create a cleaner, greener world. Report waste, collect rewards, and make a difference in your community.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div>
          <h2 className={`text-2xl font-bold ${colors.textPrimary} mb-6`}>Quick Actions</h2>
          <QuickActions />
        </div>

        {/* Stats Grid */}
        <div>
          <h2 className={`text-2xl font-bold ${colors.textPrimary} mb-6`}>Your Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>
        </div>

        {/* Recent Activity and Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RecentActivity />
          
          {/* Solana Wallet */}
          <SolanaWallet />
          
          {/* Environmental Impact */}
          <motion.div
            className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Environmental Impact</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div>
                  <p className={`${colors.textPrimary} font-medium`}>CO₂ Saved</p>
                  <p className={`text-sm ${colors.textTertiary}`}>This month</p>
                </div>
                <span className="text-2xl font-bold text-green-400">45kg</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                <div>
                  <p className={`${colors.textPrimary} font-medium`}>Waste Diverted</p>
                  <p className={`text-sm ${colors.textTertiary}`}>From landfills</p>
                </div>
                <span className="text-2xl font-bold text-blue-400">127kg</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10">
                <div>
                  <p className={`${colors.textPrimary} font-medium`}>Trees Saved</p>
                  <p className={`text-sm ${colors.textTertiary}`}>Equivalent</p>
                </div>
                <span className="text-2xl font-bold text-purple-400">12</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Community Stats */}
        <motion.div
          className="p-8 rounded-xl bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="text-center mb-6">
            <h3 className={`text-2xl font-bold ${colors.textPrimary} mb-2`}>Community Impact</h3>
            <p className={colors.textSecondary}>Together, we're making a difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">12,847</div>
              <div className={colors.textSecondary}>Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">8,923</div>
              <div className={colors.textSecondary}>Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">2.3M</div>
              <div className={colors.textSecondary}>Points Earned</div>
            </div>
          </div>
        </motion.div>
      </div>
      </Layout>
    </ProtectedRoute>
  );
}