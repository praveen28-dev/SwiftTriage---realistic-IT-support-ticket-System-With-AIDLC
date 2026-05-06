/**
 * Card Component - Phase 2 Enhanced
 * Professional card container with design system integration
 * Features: Multiple variants, hover effects, headers, footers
 */

'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
}: CardProps) {
  // Base card styles using design system
  const baseStyles = 'card';

  // Variant styles
  const variantStyles = {
    default: '',
    elevated: 'shadow-lg',
    outlined: 'border-2 shadow-none',
    flat: 'shadow-none border-0',
  };

  // Padding styles using design system spacing
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Hover effect
  const hoverStyles = hover ? 'cursor-pointer' : '';

  // Clickable card
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hoverStyles}
        ${clickableStyles}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

// Card Header Component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className = '',
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="flex-shrink-0 mt-1" style={{ color: 'var(--primary-600)' }}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate" style={{ color: 'var(--gray-900)' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: 'var(--gray-600)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

// Card Body Component
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={className} style={{ color: 'var(--gray-700)' }}>
      {children}
    </div>
  );
}

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export function CardFooter({ children, className = '', divider = true }: CardFooterProps) {
  return (
    <div
      className={`
        mt-4 pt-4
        ${divider ? 'border-t border-gray-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Stat Card - Specialized card for statistics
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'teal';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  onClick,
}: StatCardProps) {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-600',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      icon: 'text-yellow-600',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: 'text-red-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'text-purple-600',
    },
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      icon: 'text-teal-600',
    },
  };

  const styles = colorStyles[color];

  return (
    <Card hover={Boolean(onClick)} onClick={onClick} padding="md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className={`text-3xl font-bold ${styles.text}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <svg
                className={`h-4 w-4 ${trend.isPositive ? 'text-success-600' : 'text-error-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {trend.isPositive ? (
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-success-600' : 'text-error-600'}`}>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        <div className={`${styles.bg} p-3 rounded-lg`}>
          <div className={`w-6 h-6 ${styles.icon}`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}
