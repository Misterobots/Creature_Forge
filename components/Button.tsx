
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-xl font-bold transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  const variants = {
    primary: "bg-gradient-to-r from-magic-500 to-brand-600 text-white shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5",
    secondary: "bg-white text-brand-900 shadow-md hover:bg-brand-50 hover:shadow-lg border border-brand-100",
    outline: "border-2 border-brand-200 text-brand-600 hover:border-brand-500 hover:bg-brand-50"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
