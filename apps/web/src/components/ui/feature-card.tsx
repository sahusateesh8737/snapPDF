import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  variant?: 'red' | 'blue' | 'green' | 'orange' | 'default';
  comingSoon?: boolean;
}

export const FeatureCard = ({ icon, title, description, className, variant = 'default', comingSoon = false }: CardProps) => {
  const variantStyles = {
    red: "bg-red-500/10 text-red-500 group-hover:bg-red-600 group-hover:text-white",
    blue: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white",
    green: "bg-green-500/10 text-green-500 group-hover:bg-green-600 group-hover:text-white",
    orange: "bg-orange-500/10 text-orange-500 group-hover:bg-orange-600 group-hover:text-white",
    default: "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
  };

  return (
    <div className={`
      relative p-8 bg-zinc-900 rounded-xl shadow-card border border-zinc-800 transition-all duration-300 group
      ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-card-hover hover:border-zinc-700 hover:-translate-y-1 cursor-pointer'} 
      ${className}
    `}>
      {comingSoon && (
        <div className="absolute top-4 right-4 bg-zinc-800 text-slate-300 text-xs font-bold px-2 py-1 rounded-full border border-zinc-700 z-10">
          Coming Soon
        </div>
      )}
      
      <div className={comingSoon ? 'blur-[1px]' : ''}>
        {icon && (
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 text-2xl transition-colors duration-300 ${!comingSoon ? variantStyles[variant] : 'bg-zinc-800 text-zinc-600'}`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 28 }) : icon}
          </div>
        )}
        <h3 className={`text-xl font-bold mb-2 ${comingSoon ? 'text-zinc-500' : 'text-white'}`}>{title}</h3>
        <p className={`text-sm font-medium leading-relaxed ${comingSoon ? 'text-zinc-600' : 'text-slate-400'}`}>{description}</p>
      </div>
    </div>
  );
};
