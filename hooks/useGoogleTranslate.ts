import { useState, useEffect } from 'react';
import { translateService } from '../lib/translateService';

export const useGoogleTranslate = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set current language from service without re-initializing
    setCurrentLanguage(translateService.getCurrentLanguage());
    setIsInitialized(true);
  }, []);

  const changeLanguage = (languageCode: string) => {
    translateService.changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
  };

  const supportedLanguages = translateService.getSupportedLanguages();

  return {
    currentLanguage,
    changeLanguage,
    supportedLanguages,
    isInitialized,
  };
}; 