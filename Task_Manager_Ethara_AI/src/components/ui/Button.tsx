/**
 * Button Component - Reusable button with variants and loading state
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-green-600 hover:bg-green-700 text-white shadow-sm disabled:bg-green-300',
  secondary:
    'bg-gray-700 hover:bg-gray-800 text-white shadow-sm disabled:bg-gray-400',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:bg-red-300',
  ghost:
    'bg-transparent hover:bg-gray-800 text-gray-200 disabled:text-gray-500',
  outline:
    'border border-gray-600 hover:bg-gray-900 text-gray-200 bg-gray-800 disabled:text-gray-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-150 cursor-pointer
        disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;
