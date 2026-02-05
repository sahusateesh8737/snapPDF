import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  variant?: 'red' | 'blue' | 'green' | 'orange' | 'default';
}

export const FeatureCard = ({ icon, title, description, className, variant = 'default' }: CardProps) => {
  const variantStyles = {
    red: "bg-red-500/10 text-red-500 group-hover:bg-red-600 group-hover:text-white",
    blue: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white",
    green: "bg-green-500/10 text-green-500 group-hover:bg-green-600 group-hover:text-white",
    orange: "bg-orange-500/10 text-orange-500 group-hover:bg-orange-600 group-hover:text-white",
    default: "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
  };

  return (
    <div className={`p-8 bg-zinc-900 rounded-xl shadow-card hover:shadow-card-hover border border-zinc-800 hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 group cursor-pointer ${className}`}>
      {icon && (
        <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 text-2xl transition-colors duration-300 ${variantStyles[variant]}`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 28 }) : icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm font-medium">{description}</p>
    </div>
  );
};
