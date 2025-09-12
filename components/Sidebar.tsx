"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FileText, 
  Trash2, 
  Trophy, 
  Gift, 
  Settings, 
  MessageSquare,
  X,
  MapPin,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSidebarOpen, setSidebarOpen, selectTheme } from '../store/slices/uiSlice';
import Button from './ui/Button';

interface NavigationItem {
  name: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const theme = useSelector(selectTheme);
  
  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', icon: Home, href: '/' },
    { name: 'Report Waste', icon: FileText, href: '/report' },
    { name: 'Collect Waste', icon: Trash2, href: '/collect' },
    { name: 'Verify Collections', icon: CheckCircle, href: '/verify' },
    { name: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
    { name: 'Analytics', icon: BarChart3, href: '/analytics' },
    { name: 'Rewards', icon: Gift, href: '/rewards' },
    { name: 'Messages', icon: MessageSquare, href: '/messages', badge: 3 },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];
  
  const closeSidebar = () => dispatch(setSidebarOpen(false));
  
  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className={`fixed inset-0 backdrop-blur-sm z-40 lg:hidden ${
              theme === 'dark' ? 'bg-black/50' : 'bg-black/20'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`
          fixed left-0 top-0 h-full w-64
          z-[1000]
          backdrop-blur-lg
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:block
          ${theme === 'dark' 
            ? 'bg-black/30 border-r border-white/10' 
            : 'bg-white/80 border-r border-gray-200'
          }
        `}
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
          WebkitBackdropFilter: 'blur(16px)',
          backdropFilter: 'blur(16px)',
        }}
        initial={false}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex flex-col h-full overflow-y-auto min-h-0 scrollbar-hide">
          <div className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                ScrapAI
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-white/10'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <item.icon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </motion.a>
            ))}
          </nav>

          <div className={`p-4 border-t ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className={`p-4 text-center rounded-lg backdrop-blur-sm border ${
              theme === 'dark' 
                ? 'bg-white/10 border-white/20' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                1,247
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Points
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;