'use client';

import React from 'react';
import { useWeb3Auth } from './Web3AuthProvider';
import Button from './ui/Button';
import { LogIn, Loader } from 'lucide-react';
import { QuickLogin } from './QuickLogin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { loggedIn, loading, login } = useWeb3Auth();
  const [showQuickLogin, setShowQuickLogin] = React.useState(false);

  const handleQuickLogin = async (user: { id: number; email: string; name: string }) => {
    // Set user info in localStorage and reload
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userInfo', JSON.stringify(user));
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Initializing Web3Auth...</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showQuickLogin) {
      return <QuickLogin onLogin={handleQuickLogin} />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Welcome to ScrapAI</h1>
            <p className="text-gray-300 mb-6">
              Connect your wallet to access the AI-powered waste management platform
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={login}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg w-full"
              size="lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
            
            <Button 
              onClick={() => setShowQuickLogin(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Quick Demo Login
            </Button>
          </div>
          
          <p className="text-sm text-gray-400 mt-4">
            By connecting, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 