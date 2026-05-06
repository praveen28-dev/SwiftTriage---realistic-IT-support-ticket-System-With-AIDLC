/**
 * Button Component - Phase 2 Design System Integration
 * Professional button leveraging the complete design system
 * Features: Multiple variants, sizes, loading states, icons, smooth animations
 */

'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
}: ButtonProps) {
  // Base button styles using design system
  const baseStyles = 'btn';
  
  // Variant styles using design system classes from globals.css
  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    ghost: 'bg-transparent hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-400',
  };
  
  // Size styles with design system spacing tokens
  const sizeStyles = {
    sm: 'text-sm h-9',  // 36px height
    md: 'text-base h-11', // 44px height (default)
    lg: 'text-lg h-12',  // 48px height
  };

  // Full width style
  const widthStyle = fullWidth ? 'w-full' : '';

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin h-5 w-5" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles} 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${widthStyle}
        ${className}
      `}
      data-testid={`button-${variant}`}
      aria-busy={loading}
      aria-disabled={disabled || loading}
    >
      {/* Loading state */}
      {loading && <LoadingSpinner />}
      
      {/* Icon left */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      {/* Button text */}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
      
      {/* Icon right */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
}
