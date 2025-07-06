'use client';

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import Button from './ui/Button';

export const ThemeToggle: React.FC = () => {
  const { theme, changeTheme, isSystem, mounted } = useTheme();

  const getThemeIcon = () => {
    if (!mounted) {
      return <Moon className="h-4 w-4" />; // Default icon during SSR
    }
    if (isSystem) {
      return <Monitor className="h-4 w-4" />;
    }
    return theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;
  };

  const cycleTheme = () => {
    if (!mounted) return;
    
    if (isSystem) {
      changeTheme('light');
    } else if (theme === 'light') {
      changeTheme('dark');
    } else {
      changeTheme('system');
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={cycleTheme}
      className="transition-colors duration-200 p-2"
      title={mounted ? `Current theme: ${isSystem ? 'System' : theme}` : 'Loading theme...'}
      disabled={!mounted}
    >
      {getThemeIcon()}
    </Button>
  );
};

export default ThemeToggle; 