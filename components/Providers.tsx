'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '../store';
import GoogleTranslateProvider from './GoogleTranslateProvider';
import { Web3AuthProvider } from './Web3AuthProvider';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Provider store={store}>
        <Web3AuthProvider>
          <GoogleTranslateProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              {children}
            </div>
            <Toaster position="top-right" />
          </GoogleTranslateProvider>
        </Web3AuthProvider>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <Web3AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
          themes={['light', 'dark', 'system']}
        >
          <GoogleTranslateProvider>
            {children}
            <Toaster position="top-right" />
          </GoogleTranslateProvider>
        </ThemeProvider>
      </Web3AuthProvider>
    </Provider>
  );
};

export default Providers; 