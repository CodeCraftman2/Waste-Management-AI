"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { ComponentProps } from '../types/index';
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarOpen } from '../store/slices/uiSlice';
import { RootState } from '../store';

// Inner layout that can use Redux hooks
const LayoutInner: React.FC<ComponentProps> = ({ children }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);

  // Handler to open sidebar
  const handleMenuClick = () => {
    dispatch(setSidebarOpen(true));
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Animated background orbs */}
      <div 
        className={`absolute w-96 h-96 -top-48 -left-48 rounded-full blur-3xl animate-pulse ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
            : 'bg-gradient-to-r from-blue-400/10 to-purple-400/10'
        }`}
        style={{ animationDelay: '0s', animationDuration: '4s' }}
      />
      <div 
        className={`absolute w-64 h-64 top-1/4 -right-32 rounded-full blur-3xl animate-pulse ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-emerald-400/20 to-blue-400/20'
            : 'bg-gradient-to-r from-emerald-400/10 to-blue-400/10'
        }`}
        style={{ animationDelay: '2s', animationDuration: '6s' }}
      />
      <div 
        className={`absolute w-80 h-80 bottom-0 left-1/3 rounded-full blur-3xl animate-pulse ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-purple-400/20 to-emerald-400/20'
            : 'bg-gradient-to-r from-purple-400/10 to-emerald-400/10'
        }`}
        style={{ animationDelay: '4s', animationDuration: '5s' }}
      />

      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={handleMenuClick} />
          <motion.main
            className="flex-1 overflow-y-auto p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

// Export the inner layout directly since Redux is provided at the root level
export const Layout: React.FC<ComponentProps> = ({ children }) => (
  <LayoutInner>{children}</LayoutInner>
);

export default Layout;