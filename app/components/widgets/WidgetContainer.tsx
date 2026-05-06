/**
 * Widget Container Component
 * Reusable wrapper for dashboard widgets with drag-and-drop support
 */

'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetHeader } from './WidgetHeader';

interface WidgetContainerProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

export function WidgetContainer({
  id,
  title,
  children,
  onEdit,
  onRemove,
  onRefresh,
  onExport,
  className = '',
}: WidgetContainerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
        isDragging ? 'z-50 cursor-grabbing' : ''
      } ${className}`}
    >
      <WidgetHeader
        title={title}
        dragHandleProps={{ ...attributes, ...listeners }}
        onEdit={onEdit}
        onRemove={onRemove}
        onRefresh={onRefresh}
        onExport={onExport}
      />
      <div className="p-6">{children}</div>
    </div>
  );
}
