'use client';

import React from 'react';
import Button from './ui/Button';
import { LogIn, User } from 'lucide-react';
import { getUserByEmail } from '../utils/db/actions';

interface QuickLoginProps {
  onLogin: (user: { id: number; email: string; name: string }) => void;
}

export const QuickLogin: React.FC<QuickLoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = React.useState(false);

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      // Use demo user for quick testing
      const user = await getUserByEmail('demo@scrapai.com');
      if (user) {
        localStorage.setItem('userEmail', user.email);
        onLogin(user);
      } else {
        alert('Demo user not found. Please run the setup script first.');
      }
    } catch (error) {
      console.error('Quick login error:', error);
      alert('Quick login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to ScrapAI</h1>
          <p className="text-gray-300 mb-6">
            AI-powered waste management platform
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleQuickLogin}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Logging in...
              </>
            ) : (
              <>
                <User className="mr-2 h-5 w-5" />
                Quick Login (Demo)
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-400">
            Use demo account for testing
          </p>
        </div>
      </div>
    </div>
  );
}; 