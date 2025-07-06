import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useThemeColors = () => {
  const theme = useSelector((state: RootState) => state.ui.theme);
  
  return {
    // Text colors
    textPrimary: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    textTertiary: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    textMuted: theme === 'dark' ? 'text-gray-500' : 'text-gray-400',
    
    // Background colors
    bgPrimary: theme === 'dark' ? 'bg-white/10' : 'bg-gray-100',
    bgSecondary: theme === 'dark' ? 'bg-white/5' : 'bg-white',
    bgCard: theme === 'dark' ? 'bg-white/10' : 'bg-white',
    
    // Border colors
    borderPrimary: theme === 'dark' ? 'border-white/20' : 'border-gray-200',
    borderSecondary: theme === 'dark' ? 'border-white/10' : 'border-gray-100',
    
    // Input colors
    inputBg: theme === 'dark' ? 'bg-white/10' : 'bg-white',
    inputBorder: theme === 'dark' ? 'border-white/20' : 'border-gray-200',
    inputText: theme === 'dark' ? 'text-white' : 'text-gray-900',
    inputPlaceholder: theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500',
    
    // Hover states
    hoverBg: theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-50',
    hoverBorder: theme === 'dark' ? 'hover:border-white/40' : 'hover:border-gray-300',
    
    // Theme-aware classes
    theme: theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

// Static utility function for use outside of React components
export const getThemeColors = (theme: 'light' | 'dark') => {
  return {
    textPrimary: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    textTertiary: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    textMuted: theme === 'dark' ? 'text-gray-500' : 'text-gray-400',
    bgPrimary: theme === 'dark' ? 'bg-white/10' : 'bg-gray-100',
    bgSecondary: theme === 'dark' ? 'bg-white/5' : 'bg-white',
    bgCard: theme === 'dark' ? 'bg-white/10' : 'bg-white',
    borderPrimary: theme === 'dark' ? 'border-white/20' : 'border-gray-200',
    borderSecondary: theme === 'dark' ? 'border-white/10' : 'border-gray-100',
    inputBg: theme === 'dark' ? 'bg-white/10' : 'bg-white',
    inputBorder: theme === 'dark' ? 'border-white/20' : 'border-gray-200',
    inputText: theme === 'dark' ? 'text-white' : 'text-gray-900',
    inputPlaceholder: theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500',
    hoverBg: theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-50',
    hoverBorder: theme === 'dark' ? 'hover:border-white/40' : 'hover:border-gray-300',
  };
}; 