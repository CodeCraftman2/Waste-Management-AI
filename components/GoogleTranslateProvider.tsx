'use client';

import { useEffect } from 'react';
import { translateService } from '../lib/translateService';

interface GoogleTranslateProviderProps {
  children: React.ReactNode;
}

export const GoogleTranslateProvider: React.FC<GoogleTranslateProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize the translation service when the component mounts
    translateService.initializeLanguage();
  }, []);

  return <>{children}</>;
};

export default GoogleTranslateProvider; 