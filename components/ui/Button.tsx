"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'default';
  children: React.ReactNode;
}

const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  ghost: 'text-gray-300 hover:text-white hover:bg-white/10 focus:ring-white/20',
  outline: 'border border-gray-300 text-gray-300 hover:bg-white/10 hover:text-white focus:ring-white/20'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  icon: 'h-10 w-10 p-0',
  default: 'px-4 py-2 text-base'
};

export const buttonVariants = ({ 
  variant = 'primary', 
  size = 'md' 
}: { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'default';
} = {}) => {
  return cn(baseClasses, variants[variant], sizes[size]);
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;