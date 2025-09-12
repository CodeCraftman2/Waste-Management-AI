import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/slices/uiSlice';
import { RootState } from '../store';

export const useTheme = () => {
  const { theme, setTheme: setNextTheme, systemTheme } = useNextTheme();
  const dispatch = useDispatch();
  const reduxTheme = useSelector((state: RootState) => state.ui.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync Redux theme with next-themes
  useEffect(() => {
    if (mounted && theme && theme !== reduxTheme) {
      dispatch(setTheme(theme as 'light' | 'dark'));
    }
  }, [theme, reduxTheme, dispatch, mounted]);

  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (!mounted) return;
    
    setNextTheme(newTheme);
    if (newTheme !== 'system') {
      dispatch(setTheme(newTheme));
    } else {
      // For system theme, use the resolved theme
      const resolvedTheme = systemTheme as 'light' | 'dark';
      dispatch(setTheme(resolvedTheme));
    }
  };

  const getCurrentTheme = () => {
    if (!mounted) return 'dark'; // Default during SSR
    if (theme === 'system') {
      return systemTheme as 'light' | 'dark';
    }
    return theme as 'light' | 'dark';
  };

  return {
    theme: getCurrentTheme(),
    systemTheme,
    changeTheme,
    isSystem: theme === 'system',
    mounted,
  };
}; 