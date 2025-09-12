"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Bell, CheckCircle, AlertCircle, Info, Bot, User, Loader2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { useThemeColors } from '../../lib/themeUtils';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import { getUnreadNotifications, markNotificationAsRead } from '../../utils/db/actions';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function Messages() {
  const { userInfo } = useWeb3Auth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [activeTab, setActiveTab] = useState<'notifications' | 'chat'>('notifications');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your ScrapAI assistant. I can help you with waste management questions, guide you through the app, and provide tips for environmental sustainability. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const colors = useThemeColors();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // For demo purposes, always show sample notifications
        const sampleNotifications: Notification[] = [
          {
            id: 1,
            message: "Your waste report at Central Park has been verified by AI! You earned 15 points.",
            type: "reward",
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          },
          {
            id: 2,
            message: "New collection task available near your location. Check the Collect Waste page!",
            type: "task",
            isRead: false,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
          },
          {
            id: 3,
            message: "Congratulations! You've reached Level 3. Unlock new rewards in the Rewards Center.",
            type: "achievement",
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          },
          {
            id: 4,
            message: "Your report at Times Square has been collected. Thank you for keeping the city clean!",
            type: "collection",
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
          },
          {
            id: 5,
            message: "Welcome to ScrapAI! Start reporting waste to earn points and help the environment.",
            type: "welcome",
            isRead: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
          }
        ];

        setNotifications(sampleNotifications);
        
        // If userInfo exists, try to fetch real notifications
        if (userInfo?.id) {
          try {
            const unreadNotifications = await getUnreadNotifications(userInfo.id);
            // You can merge real notifications with sample ones here if needed
          } catch (error) {
            console.error('Error fetching real notifications:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userInfo?.id]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark message as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'task':
        return <Bell className="w-5 h-5 text-blue-400" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-purple-400" />;
      case 'collection':
        return <CheckCircle className="w-5 h-5 text-orange-400" />;
      case 'welcome':
        return <Info className="w-5 h-5 text-cyan-400" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'reward':
        return 'bg-green-500/10 border-green-500/20';
      case 'task':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'achievement':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'collection':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'welcome':
        return 'bg-cyan-500/10 border-cyan-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.isRead;
    if (selectedFilter === 'read') return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // AI Chat functionality
  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulate AI response with predefined responses
      const aiResponse = await generateAIResponse(inputMessage.trim());
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setTimeout(() => {
        setChatMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000); // Simulate typing delay
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsTyping(false);
      toast.error('Failed to get AI response');
    }
  };

  const generateAIResponse = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();
    
    // Predefined responses for common questions
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I help you with waste management today?";
    }
    
    if (lowerMessage.includes('report') || lowerMessage.includes('waste')) {
      return "To report waste, go to the Report page and take a photo of the waste. Our AI will analyze it and you'll earn points for verified reports!";
    }
    
    if (lowerMessage.includes('collect') || lowerMessage.includes('pickup')) {
      return "You can collect waste by visiting the Collect page. There you'll find available collection tasks near your location. Complete them to earn points!";
    }
    
    if (lowerMessage.includes('points') || lowerMessage.includes('reward')) {
      return "You earn points by reporting waste (10-15 points) and collecting waste (15-20 points). Check the Rewards page to redeem your points for rewards!";
    }
    
    if (lowerMessage.includes('recycle') || lowerMessage.includes('environment')) {
      return "Great question! Recycling helps reduce landfill waste and conserves resources. In ScrapAI, you can report recyclable waste and earn bonus points for proper recycling!";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('guide')) {
      return "I can help you with:\n• Reporting waste\n• Collecting waste\n• Understanding points and rewards\n• Environmental tips\n• App navigation\nWhat would you like to know more about?";
    }
    
    if (lowerMessage.includes('level') || lowerMessage.includes('rank')) {
      return "Your level increases as you earn more points. Higher levels unlock better rewards and special features. Check the Leaderboard to see how you rank!";
    }
    
    // Default response
    return "I'm here to help with waste management and environmental sustainability. You can ask me about reporting waste, collecting waste, earning points, recycling tips, or how to use the app!";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={colors.textSecondary}>Loading messages...</p>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Messages & AI Chat
              </h1>
              <p className={`text-xl ${colors.textSecondary}`}>
                Stay updated with your activities and chat with our AI assistant
              </p>
            </div>

            {/* Main Tabs */}
            <motion.div
              className={`flex justify-center mb-8 p-2 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex space-x-2">
                {[
                  { id: 'notifications', label: 'Notifications', count: unreadCount, icon: Bell },
                  { id: 'chat', label: 'AI Chat', count: 0, icon: Bot }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                        : `${colors.textSecondary} hover:bg-white/10`
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content based on active tab */}
            {activeTab === 'notifications' ? (
              <>
                {/* Filter Tabs */}
                <motion.div
                  className={`flex justify-center mb-8 p-2 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="flex space-x-2">
                    {[
                      { id: 'all', label: 'All Messages', count: notifications.length },
                      { id: 'unread', label: 'Unread', count: unreadCount },
                      { id: 'read', label: 'Read', count: notifications.length - unreadCount }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id as any)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                          selectedFilter === filter.id
                            ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                            : `${colors.textSecondary} hover:bg-white/10`
                        }`}
                      >
                        <span>{filter.label}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedFilter === filter.id ? 'bg-blue-500/20' : 'bg-white/10'
                        }`}>
                          {filter.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Messages List */}
                <div className="space-y-4">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary} hover:bg-white/5 transition-all duration-200 ${
                          !notification.isRead ? 'ring-2 ring-blue-500/20' : ''
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className={`${colors.textPrimary} ${!notification.isRead ? 'font-semibold' : ''}`}>
                                  {notification.message}
                                </p>
                                <p className={`text-sm ${colors.textTertiary} mt-1`}>
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                              
                              {!notification.isRead && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-xs"
                                  >
                                    Mark as read
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                notification.type === 'reward' ? 'bg-green-500/20 text-green-400' :
                                notification.type === 'task' ? 'bg-blue-500/20 text-blue-400' :
                                notification.type === 'achievement' ? 'bg-purple-500/20 text-purple-400' :
                                notification.type === 'collection' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {notification.type}
                              </span>
                              
                              {notification.isRead && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Read
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      className={`text-center py-12 ${colors.textSecondary}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg mb-2">No messages yet</p>
                      <p className="text-sm">Start reporting waste to receive notifications!</p>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              /* Chat Interface */
              <motion.div
                className="h-[600px] flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {/* Chat Messages */}
                <div className={`flex-1 overflow-y-auto p-4 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary} mb-4`}>
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className={`p-2 rounded-full ${
                            message.sender === 'user' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {message.sender === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          
                          <div className={`p-3 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-500/20 text-blue-100'
                              : 'bg-gray-800/50 text-gray-100'
                          }`}>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'user' ? 'text-blue-300' : 'text-gray-400'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        className="flex justify-start"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="p-3 rounded-lg bg-gray-800/50">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className={`p-4 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about waste management, points, or app features..."
                      className={`flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                      disabled={isTyping}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="px-4 py-2"
                    >
                      {isTyping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
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