import React from 'react';
import { cn } from '@/lib/utils'; // We'll need a utils file for cn

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-t border-indigo-400 hover:shadow-indigo-500/40 hover:brightness-110 active:scale-[0.98]',
      secondary: 'bg-slate-900 text-white hover:bg-slate-800 border-t border-slate-700 shadow-lg',
      outline: 'bg-white/10 backdrop-blur-sm border border-slate-200 text-slate-700 hover:bg-white/50 hover:border-indigo-300 hover:text-indigo-600',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100/50',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
