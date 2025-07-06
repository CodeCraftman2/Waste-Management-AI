"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Coins, Filter, Navigation, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import { useThemeColors } from '../../lib/themeUtils';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import { getPendingReports, updateReportStatus, createCollectedWaste, getUserByEmail } from '../../utils/db/actions';
import { toast } from 'react-hot-toast';

interface CollectionTask {
  id: number;
  location: string;
  address: string;
  wasteType: string;
  reward: number;
  estimatedTime: number;
  priority: 'low' | 'medium' | 'high';
  distance: number;
  description: string;
  reportedBy: string;
  reportedAt: string;
}

const mockTasks: CollectionTask[] = [
  {
    id: 1,
    location: 'Central Park - Bethesda Fountain',
    address: '72nd St & Park Dr, New York, NY',
    wasteType: 'Mixed Recyclables',
    reward: 45,
    estimatedTime: 20,
    priority: 'high',
    distance: 0.3,
    description: 'Large amount of plastic bottles and cans near the fountain area',
    reportedBy: 'EcoWarrior',
    reportedAt: '2 hours ago'
  },
  {
    id: 2,
    location: 'Times Square - Red Steps',
    address: 'Broadway & 47th St, New York, NY',
    wasteType: 'Paper & Cardboard',
    reward: 30,
    estimatedTime: 15,
    priority: 'medium',
    distance: 0.8,
    description: 'Scattered newspapers and food packaging',
    reportedBy: 'GreenHero',
    reportedAt: '4 hours ago'
  },
  {
    id: 3,
    location: 'Brooklyn Bridge Park',
    address: 'Pier 1, Brooklyn, NY',
    wasteType: 'Organic Waste',
    reward: 25,
    estimatedTime: 10,
    priority: 'low',
    distance: 1.2,
    description: 'Food waste and organic materials near picnic area',
    reportedBy: 'CleanMachine',
    reportedAt: '6 hours ago'
  },
  {
    id: 4,
    location: 'High Line - Gansevoort St',
    address: 'Gansevoort St & Washington St, New York, NY',
    wasteType: 'Electronic Waste',
    reward: 60,
    estimatedTime: 30,
    priority: 'high',
    distance: 1.5,
    description: 'Old electronics and batteries improperly disposed',
    reportedBy: 'TechCleaner',
    reportedAt: '8 hours ago'
  }
];

export default function CollectWaste() {
  const { userInfo } = useWeb3Auth();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('distance');
  const [acceptedTasks, setAcceptedTasks] = useState<Set<number>>(new Set());
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  useEffect(() => {
    const fetchTasks = async () => {
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
          toast.error('Please log in to view collection tasks');
          setLoading(false);
          return;
        }

        const pendingReports = await getPendingReports();
        const formattedTasks: CollectionTask[] = pendingReports.map((report, index) => ({
          id: report.id,
          location: report.location,
          address: report.location, // Using location as address for now
          wasteType: report.wasteType,
          reward: 25, // Default reward for collection
          estimatedTime: 15,
          priority: 'medium' as const,
          distance: Math.random() * 2, // Mock distance
          description: report.description || 'No description provided',
          reportedBy: 'Anonymous',
          reportedAt: new Date(report.createdAt).toLocaleDateString()
        }));
        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load collection tasks. Please try again.');
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userInfo?.id]);

  const filters = [
    { id: 'all', label: 'All Tasks' },
    { id: 'high', label: 'High Priority' },
    { id: 'medium', label: 'Medium Priority' },
    { id: 'low', label: 'Low Priority' }
  ];

  const sortOptions = [
    { id: 'distance', label: 'Distance' },
    { id: 'reward', label: 'Reward' },
    { id: 'time', label: 'Time Required' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getWasteTypeColor = (wasteType: string) => {
    const colors: { [key: string]: string } = {
      'Mixed Recyclables': 'bg-blue-500/20 text-blue-400',
      'Paper & Cardboard': 'bg-green-500/20 text-green-400',
      'Organic Waste': 'bg-yellow-500/20 text-yellow-400',
      'Electronic Waste': 'bg-purple-500/20 text-purple-400',
      'Plastic': 'bg-cyan-500/20 text-cyan-400',
      'Glass': 'bg-pink-500/20 text-pink-400'
    };
    return colors[wasteType] || 'bg-gray-500/20 text-gray-400';
  };

  const handleAcceptTask = async (taskId: number) => {
    if (!userInfo?.id) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Update report status to 'in_progress' and assign collector
      await updateReportStatus(taskId, 'in_progress');
      
      // Create collected waste record
      await createCollectedWaste(taskId, userInfo.id);
      
      // Remove task from list
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast.success('Task accepted! Go to the Verify page to complete verification and earn points.');
    } catch (error) {
      console.error('Error accepting task:', error);
      toast.error('Failed to accept task. Please try again.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'all') return true;
    return task.priority === selectedFilter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'distance': return a.distance - b.distance;
      case 'reward': return b.reward - a.reward;
      case 'time': return a.estimatedTime - b.estimatedTime;
      default: return 0;
    }
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading collection tasks...</p>
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Collection Tasks
            </h1>
            <p className={`text-xl ${colors.textSecondary}`}>
              Find and complete waste collection tasks in your area
            </p>
          </div>

          {/* Filters and Sort */}
          <motion.div
            className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex flex-wrap gap-2">
              <Filter className="w-5 h-5 text-gray-400 mt-2" />
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedFilter === filter.id
                      ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`${colors.textTertiary} text-sm`}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`${colors.inputBg} border ${colors.inputBorder} rounded-lg px-3 py-2 ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary} hover:bg-white/15 transition-all duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{task.location}</h3>
                    <p className="text-sm text-gray-400 mb-2">{task.address}</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs ${getWasteTypeColor(task.wasteType)}`}>
                        {task.wasteType}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      +{task.reward}
                    </div>
                    <div className="text-xs text-gray-400">points</div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4">{task.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{task.distance} mi</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{task.estimatedTime} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div>Reported by {task.reportedBy}</div>
                    <div>{task.reportedAt}</div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                  {acceptedTasks.has(task.id) ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accepted
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAcceptTask(task.id)}
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      Accept Task
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-white/20 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">23</div>
              <div className="text-gray-300">Tasks Completed</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">1,450</div>
              <div className="text-gray-300">Points Earned</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/20 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">4.9</div>
              <div className="text-gray-300">Average Rating</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      </Layout>
    </ProtectedRoute>
  );
}