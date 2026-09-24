import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium tracking-wide",
    md: "text-xs px-2.5 py-1 font-medium"
  };

  const variantStyles = {
    default: "bg-slate-800/80 text-slate-300 border border-slate-700/60",
    primary: "bg-blue-950/60 text-blue-400 border border-blue-800/40",
    success: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
    warning: "bg-amber-950/60 text-amber-300 border border-amber-800/40",
    danger: "bg-rose-950/60 text-rose-400 border border-rose-800/40",
    neutral: "bg-slate-900 text-slate-400 border border-slate-800",
    outline: "bg-transparent text-slate-300 border border-slate-700",
    purple: "bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
  };

  return (
    <span className={`inline-flex items-center rounded-md shrink-0 gap-1.5 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
