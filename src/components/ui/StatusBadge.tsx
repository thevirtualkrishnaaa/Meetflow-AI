import React from 'react';
import { Priority, TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const configs: Record<TaskStatus, { label: string; textClass: string; dotClass: string }> = {
    Open: {
      label: 'Open',
      textClass: 'text-neutral-600',
      dotClass: 'bg-neutral-400',
    },
    'In Progress': {
      label: 'In Progress',
      textClass: 'text-blue-700 font-medium',
      dotClass: 'bg-blue-600 animate-pulse',
    },
    Completed: {
      label: 'Completed',
      textClass: 'text-emerald-700',
      dotClass: 'bg-emerald-600',
    },
    Overdue: {
      label: 'Overdue',
      textClass: 'text-rose-700 font-semibold',
      dotClass: 'bg-rose-600',
    },
  };

  const config = configs[status] || configs.Open;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs whitespace-nowrap ${config.textClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const configs: Record<Priority, { label: string; textClass: string }> = {
    Urgent: { label: 'Urgent', textClass: 'text-rose-700 font-medium' },
    High: { label: 'High', textClass: 'text-amber-700 font-medium' },
    Medium: { label: 'Medium', textClass: 'text-neutral-600' },
    Low: { label: 'Low', textClass: 'text-neutral-400' },
  };

  const config = configs[priority] || configs.Medium;

  return (
    <span className={`text-xs whitespace-nowrap ${config.textClass} ${className}`}>
      {config.label}
    </span>
  );
};
