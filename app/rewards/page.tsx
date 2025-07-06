"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Trophy, Coins, ArrowRight, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { useThemeColors } from '../../lib/themeUtils';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import { getAvailableRewards, getRewardTransactions, redeemReward, getUserByEmail } from '../../utils/db/actions';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

interface Reward {
  id: number;
  name: string;
  description: string | null;
  cost: number;
  collectionInfo: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  date: string;
}

export default function Rewards() {
  const { userInfo } = useWeb3Auth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const colors = useThemeColors();

  useEffect(() => {
    const fetchRewards = async () => {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
        toast.error('Loading timeout. Please refresh the page.');
      }, 10000);

      try {
        // If no userInfo, try to get from localStorage
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

        if (!userId) {
          toast.error('Please log in to view rewards');
          setLoading(false);
          return;
        }

        const availableRewards = await getAvailableRewards(userId);
        const userTransactions = await getRewardTransactions(userId);
        
        // Calculate user points from transactions
        const points = userTransactions.reduce((total, transaction) => {
          return transaction.type.startsWith('earned') ? total + transaction.amount : total - transaction.amount;
        }, 0);

        setRewards(availableRewards);
        setTransactions(userTransactions);
        setUserPoints(points);
      } catch (error) {
        console.error('Error fetching rewards:', error);
        toast.error('Failed to load rewards. Please try again.');
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchRewards();
  }, [userInfo?.id]);

  const handleRedeemReward = async (rewardId: number, pointsRequired: number) => {
    if (!userInfo?.id) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (userPoints < pointsRequired) {
      toast.error('Insufficient points to redeem this reward');
      return;
    }

    setRedeeming(rewardId);
    
    try {
      await redeemReward(userInfo.id, rewardId);
      toast.success('Reward redeemed successfully!');
      
      // Refresh rewards and transactions
      const availableRewards = await getAvailableRewards(userInfo.id);
      const userTransactions = await getRewardTransactions(userInfo.id);
      
      const points = userTransactions.reduce((total, transaction) => {
        return transaction.type.startsWith('earned') ? total + transaction.amount : total - transaction.amount;
      }, 0);

      setRewards(availableRewards);
      setTransactions(userTransactions);
      setUserPoints(points);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned_report':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'earned_collect':
        return <Trophy className="w-4 h-4 text-blue-400" />;
      case 'redeemed':
        return <Gift className="w-4 h-4 text-purple-400" />;
      default:
        return <Coins className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={colors.textSecondary}>Loading rewards...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Rewards Center
              </h1>
              <p className={`text-xl ${colors.textSecondary}`}>
                Earn points and redeem exciting rewards for your environmental efforts
              </p>
            </div>

            {/* Points Summary */}
            <motion.div
              className={`p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border ${colors.borderPrimary} mb-8`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${colors.textPrimary} mb-2`}>Your Points</h2>
                  <p className={`text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
                    {userPoints}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <span className={`text-lg font-semibold ${colors.textPrimary}`}>Available</span>
                  </div>
                  <p className={`text-sm ${colors.textSecondary}`}>Ready to redeem</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Rewards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className={`text-xl font-semibold ${colors.textPrimary} mb-6`}>Available Rewards</h3>
                <div className="space-y-4">
                  {rewards.length > 0 ? (
                    rewards.map((reward, index) => (
                      <motion.div
                        key={reward.id}
                        className={`p-4 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary} hover:bg-white/5 transition-all duration-200`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                              <Gift className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${colors.textPrimary}`}>{reward.name}</h4>
                              <p className={`text-sm ${colors.textSecondary}`}>{reward.description}</p>
                            </div>
                          </div>
                                                      <div className="text-right">
                              <div className="flex items-center space-x-1">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className={`font-semibold ${colors.textPrimary}`}>{reward.cost}</span>
                              </div>
                              <span className={`text-xs ${colors.textTertiary}`}>points</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${colors.textTertiary}`}>{reward.collectionInfo}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRedeemReward(reward.id, reward.cost)}
                            disabled={userPoints < reward.cost || redeeming === reward.id}
                            className="flex items-center space-x-1"
                          >
                            {redeeming === reward.id ? (
                              <>
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                <span>Redeeming...</span>
                              </>
                            ) : (
                              <>
                                <span>Redeem</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${colors.textSecondary}`}>
                      <Gift className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No rewards available yet</p>
                      <p className="text-sm">Keep reporting waste to earn points!</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Transaction History */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h3 className={`text-xl font-semibold ${colors.textPrimary} mb-6`}>Transaction History</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        className={`p-3 rounded-lg ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className={`text-sm ${colors.textPrimary}`}>{transaction.description}</p>
                              <p className={`text-xs ${colors.textTertiary}`}>{transaction.date}</p>
                            </div>
                          </div>
                          <div className={`text-sm font-semibold ${
                            transaction.type.startsWith('earned') ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type.startsWith('earned') ? '+' : '-'}{transaction.amount}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${colors.textSecondary}`}>
                      <Coins className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No transactions yet</p>
                      <p className="text-sm">Start reporting waste to see your activity!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* How to Earn Points */}
            <motion.div
              className={`mt-8 p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>How to Earn Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-500/10">
                  <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className={`font-semibold ${colors.textPrimary} mb-1`}>Report Waste</h4>
                  <p className={`text-sm ${colors.textSecondary}`}>Earn 10 points per report</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10">
                  <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className={`font-semibold ${colors.textPrimary} mb-1`}>Verified Reports</h4>
                  <p className={`text-sm ${colors.textSecondary}`}>Earn 15 points for AI verification</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10">
                  <Gift className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className={`font-semibold ${colors.textPrimary} mb-1`}>Collect Waste</h4>
                  <p className={`text-sm ${colors.textSecondary}`}>Earn 25 points per collection</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 