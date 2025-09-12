"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, TrendingUp, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import { useThemeColors } from '../../lib/themeUtils';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import { getLeaderboardData, getUserBalance, getUserByEmail } from '../../utils/db/actions';
import { toast } from 'react-hot-toast';

interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  points: number;
  level: number;
  avatar?: string;
  badge?: string;
  weeklyPoints?: number;
  monthlyPoints?: number;
  totalReports?: number;
  totalCollections?: number;
}



export default function Leaderboard() {
  const { userInfo } = useWeb3Auth();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('allTime');
  const [category, setCategory] = useState<'points' | 'reports' | 'collections'>('points');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
        toast.error('Loading timeout. Please refresh the page.');
      }, 10000);

      try {
        const data = await getLeaderboardData();
        setLeaderboardData(data);

        // Find current user's rank
        let userId = userInfo?.id;
        if (!userId) {
          const email = localStorage.getItem('userEmail');
          if (email) {
            const user = await getUserByEmail(email);
            if (user) {
              userId = user.id;
            }
          }
        }

        if (userId) {
          const userData = data.find(entry => entry.id === userId);
          if (userData) {
            setUserRank(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        toast.error('Failed to load leaderboard. Please try again.');
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [userInfo?.id]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/30';
      case 2:
        return 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-300/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Champion':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Expert':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Pro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDisplayValue = (entry: LeaderboardEntry) => {
    switch (category) {
      case 'reports':
        return entry.totalReports || 0;
      case 'collections':
        return entry.totalCollections || 0;
      default:
        return entry.points;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={colors.textSecondary}>Loading leaderboard...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4">
              Leaderboard
            </h1>
            <p className={`text-xl ${colors.textSecondary}`}>
              See how you rank among the top eco-warriors
            </p>
          </div>

          {/* Filters */}
          <motion.div
            className={`flex flex-col md:flex-row justify-center items-center gap-4 mb-8 p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex gap-2">
              <span className={`${colors.textTertiary} text-sm mr-2`}>Timeframe:</span>
              {[
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'allTime', label: 'All Time' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTimeframe(option.id as any)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    timeframe === option.id
                      ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                      : `${colors.bgSecondary} ${colors.textSecondary} ${colors.hoverBg}`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <span className={`${colors.textTertiary} text-sm mr-2`}>Category:</span>
              {[
                { id: 'points', label: 'Points' },
                { id: 'reports', label: 'Reports' },
                { id: 'collections', label: 'Collections' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setCategory(option.id as any)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    category === option.id
                      ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                      : `${colors.bgSecondary} ${colors.textSecondary} ${colors.hoverBg}`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Top 3 Podium */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {leaderboardData.slice(0, 3).map((entry, index) => (
              <motion.div
                key={entry.id}
                className={`p-6 rounded-xl backdrop-blur-sm border text-center ${getRankColor(entry.rank)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex justify-center mb-4">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${colors.textPrimary} mb-2`}>{entry.name}</h3>
                {entry.badge && (
                  <span className={`inline-block px-2 py-1 rounded-full text-xs border mb-2 ${getBadgeColor(entry.badge)}`}>
                    {entry.badge}
                  </span>
                )}
                <div className={`text-2xl font-bold ${colors.textPrimary} mb-1`}>
                  {getDisplayValue(entry).toLocaleString()}
                </div>
                <div className={`text-sm ${colors.textTertiary}`}>
                  {category === 'points' ? 'points' : category}
                </div>
                <div className={`text-sm ${colors.textMuted} mt-2`}>
                  Level {entry.level}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Full Leaderboard */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {leaderboardData.map((entry, index) => (
              <motion.div
                key={entry.id}
                className={`p-4 rounded-xl backdrop-blur-sm border hover:bg-white/15 transition-all duration-300 ${
                  entry.rank <= 3 ? getRankColor(entry.rank) : `${colors.bgCard} ${colors.borderPrimary}`
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`${colors.textPrimary} font-semibold`}>{entry.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${colors.textTertiary}`}>Level {entry.level}</span>
                        {entry.badge && (
                          <span className={`px-2 py-1 rounded-full text-xs border ${getBadgeColor(entry.badge)}`}>
                            {entry.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${colors.textPrimary}`}>
                      {getDisplayValue(entry).toLocaleString()}
                    </div>
                    <div className={`text-sm ${colors.textTertiary}`}>
                      {category === 'points' ? 'points' : category}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Your Rank */}
          {userRank && (
            <motion.div
              className={`mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-green-500/10 border ${colors.borderPrimary}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg">
                    <span className="text-lg font-bold text-blue-400">#{userRank.rank}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`${colors.textPrimary} font-semibold`}>You ({userRank.name})</h3>
                    <span className={`text-sm ${colors.textTertiary}`}>Level {userRank.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${colors.textPrimary}`}>{userRank.points.toLocaleString()}</div>
                  <div className={`text-sm ${colors.textTertiary}`}>points</div>
                  <div className="flex items-center text-sm text-green-400 mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{userRank.totalReports} reports, {userRank.totalCollections} collections</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      </Layout>
    </ProtectedRoute>
  );
}