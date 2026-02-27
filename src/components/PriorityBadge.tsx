import { type FC } from 'react';
import type { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
  onClick?: () => void;
  interactive?: boolean;
}

const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PriorityBadge: FC<PriorityBadgeProps> = ({ priority, onClick, interactive }) => {
  return (
    <span
      className={`priority-badge priority-badge-${priority} ${interactive ? 'priority-badge-interactive' : ''}`}
      aria-label={`${priorityLabels[priority]} Priority${interactive ? ' (click to change)' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {priorityLabels[priority]}
      {interactive && <span className="priority-badge-arrow">▾</span>}
    </span>
  );
};
