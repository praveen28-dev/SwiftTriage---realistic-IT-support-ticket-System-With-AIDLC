/**
 * Badge Component - Phase 2 Enhanced
 * Professional badge/tag with design system integration
 * Features: Multiple variants, sizes, icons, removable option
 */

'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gray' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  icon,
  onRemove,
  className = '',
}: BadgeProps) {
  // Base badge styles using design system
  const baseStyles = 'badge';

  // Variant styles using design system classes from globals.css
  const variantStyles = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    gray: 'bg-[var(--gray-100)] text-[var(--gray-700)]',
    primary: 'bg-[var(--primary-100)] text-[var(--primary-700)]',
  };

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  // Icon size based on badge size
  const iconSizeStyles = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      role="status"
    >
      {/* Icon */}
      {icon && (
        <span className={`${iconSizeStyles[size]} flex-shrink-0`}>
          {icon}
        </span>
      )}

      {/* Badge Text */}
      <span>{children}</span>

      {/* Remove Button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 flex-shrink-0 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current rounded-full"
          aria-label="Remove"
        >
          <svg
            className={iconSizeStyles[size]}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

// Urgency Badge - Specialized badge for ticket urgency
interface UrgencyBadgeProps {
  urgency: number; // 1-5
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function UrgencyBadge({ urgency, size = 'md', showLabel = true }: UrgencyBadgeProps) {
  const urgencyConfig = {
    1: { label: 'Low', variant: 'success' as const, color: 'var(--low)' },
    2: { label: 'Low', variant: 'success' as const, color: 'var(--low)' },
    3: { label: 'Medium', variant: 'warning' as const, color: 'var(--medium)' },
    4: { label: 'High', variant: 'warning' as const, color: 'var(--high)' },
    5: { label: 'Critical', variant: 'error' as const, color: 'var(--critical)' },
  };

  const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig[3];

  return (
    <Badge variant={config.variant} size={size}>
      <span className="flex items-center gap-1">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: config.color }}
          aria-hidden="true"
        />
        {showLabel && config.label}
      </span>
    </Badge>
  );
}

// Status Badge - Specialized badge for ticket status
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'gray' }> = {
    OPEN: { variant: 'info' },
    IN_PROGRESS: { variant: 'warning' },
    PENDING: { variant: 'warning' },
    RESOLVED: { variant: 'success' },
    CLOSED: { variant: 'gray' },
    CANCELLED: { variant: 'error' },
  };

  const config = statusConfig[status.toUpperCase()] || { variant: 'gray' as const };

  return (
    <Badge variant={config.variant} size={size}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
