/**
 * LoadingSpinner Component - Phase 2 Enhanced
 * Professional loading indicator with design system integration
 * Features: Multiple sizes, colors, centered option, accessibility
 */

'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray' | 'success' | 'warning' | 'error';
  centered?: boolean;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  centered = false,
  text
}: LoadingSpinnerProps) {
  // Size styles using design system
  const sizeStyles = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  // Color styles using design system CSS variables
  const colorStyles = {
    primary: 'text-[var(--primary-600)]',
    white: 'text-white',
    gray: 'text-[var(--gray-600)]',
    success: 'text-[var(--success-600)]',
    warning: 'text-[var(--warning-600)]',
    error: 'text-[var(--error-600)]',
  };

  // Text size based on spinner size
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <svg
        className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]}`}
        fill="none"
        viewBox="0 0 24 24"
        data-testid="loading-spinner"
        role="status"
        aria-label={text || 'Loading'}
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
      {text && (
        <p className={`${textSizeStyles[size]} ${colorStyles[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
