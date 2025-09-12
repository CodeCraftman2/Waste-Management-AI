"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Users, MapPin, Calendar } from 'lucide-react';
import Layout from '../../components/Layout';
import { useThemeColors } from '../../lib/themeUtils';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import { getReportsByUserId, getRecentReports } from '../../utils/db/actions';

interface AnalyticsData {
  totalReports: number;
  verifiedReports: number;
  pendingReports: number;
  totalPoints: number;
  monthlyReports: number[];
  wasteTypeDistribution: { [key: string]: number };
  recentActivity: any[];
}

export default function Analytics() {
  const { userInfo } = useWeb3Auth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalReports: 0,
    verifiedReports: 0,
    pendingReports: 0,
    totalPoints: 0,
    monthlyReports: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
    wasteTypeDistribution: {
      'Plastic': 35,
      'Paper': 25,
      'Organic': 20,
      'Metal': 10,
      'Glass': 5,
      'Electronic': 5
    },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userInfo?.id) return;
      
      try {
        const userReports = await getReportsByUserId(userInfo.id);
        const recentReports = await getRecentReports(10);
        
        const verified = userReports.filter(r => r.verificationStatus === 'verified').length;
        const pending = userReports.filter(r => r.status === 'pending').length;
        const totalPoints = userReports.reduce((sum, report) => {
          if (report.verificationStatus === 'verified') return sum + 15;
          if (report.verificationStatus === 'rejected') return sum + 5;
          return sum + 10;
        }, 0);

        setAnalyticsData(prev => ({
          ...prev,
          totalReports: userReports.length,
          verifiedReports: verified,
          pendingReports: pending,
          totalPoints,
          recentActivity: recentReports
        }));
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userInfo?.id]);

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <motion.div
      className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${colors.textSecondary} mb-1`}>{title}</p>
          <p className={`text-2xl font-bold ${colors.textPrimary}`}>{value}</p>
          {trend && (
            <div className={`flex items-center text-sm mt-1 ${
              trend > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={colors.textSecondary}>Loading analytics...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-4">
                Analytics Dashboard
              </h1>
              <p className={`text-xl ${colors.textSecondary}`}>
                Track your environmental impact and performance metrics
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Reports"
                value={analyticsData.totalReports}
                icon={BarChart3}
                trend={12}
                color="bg-blue-500"
              />
              <StatCard
                title="Verified Reports"
                value={analyticsData.verifiedReports}
                icon={TrendingUp}
                trend={8}
                color="bg-green-500"
              />
              <StatCard
                title="Pending Reports"
                value={analyticsData.pendingReports}
                icon={Calendar}
                trend={-5}
                color="bg-yellow-500"
              />
              <StatCard
                title="Total Points"
                value={analyticsData.totalPoints}
                icon={Users}
                trend={15}
                color="bg-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Reports Chart */}
              <motion.div
                className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Monthly Reports</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.monthlyReports.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                        style={{ height: `${(value / 45) * 200}px` }}
                      />
                      <span className={`text-xs mt-2 ${colors.textTertiary}`}>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Waste Type Distribution */}
              <motion.div
                className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Waste Type Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.wasteTypeDistribution).map(([type, percentage], index) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className={`${colors.textSecondary} text-sm`}>{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${colors.textPrimary}`}>{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              className={`mt-8 p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Recent Activity</h3>
              <div className="space-y-3">
                {analyticsData.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <p className={`text-sm ${colors.textPrimary}`}>
                        Report submitted at {activity.location}
                      </p>
                      <p className={`text-xs ${colors.textTertiary}`}>
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.verificationStatus === 'verified' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {activity.verificationStatus}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 