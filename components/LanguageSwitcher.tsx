'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useGoogleTranslate } from '../hooks/useGoogleTranslate';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useGoogleTranslate();

  return (
    <div className={`relative group ${className}`}>
      <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium">
          {supportedLanguages[currentLanguage as keyof typeof supportedLanguages]}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {Object.entries(supportedLanguages).map(([code, name]) => (
            <button
              key={code}
              onClick={() => {
                changeLanguage(code);
                // Show feedback
                const button = event?.target as HTMLElement;
                if (button) {
                  const originalText = button.textContent;
                  button.textContent = '✓ ' + originalText;
                  setTimeout(() => {
                    button.textContent = originalText;
                  }, 1000);
                }
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                currentLanguage === code 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher; 