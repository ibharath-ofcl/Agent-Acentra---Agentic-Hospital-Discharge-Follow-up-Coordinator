import type { TaskStatus, TaskPriority, EscalationLevel } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'in-progress': { label: 'In Progress', className: 'bg-primary-50 text-primary-700 border-primary-200' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  overdue: { label: 'Overdue', className: 'bg-coral-50 text-coral-700 border-coral-200' },
  'needs-review': { label: 'Needs Review', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', className: 'bg-sage-100 text-sage-600 border-sage-200' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClass} ${config.className}`}>
      {status === 'needs-review' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-soft" />
      )}
      {status === 'overdue' && (
        <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
      )}
      {status === 'completed' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      )}
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-sage-500' },
  medium: { label: 'Medium', className: 'text-primary-500' },
  high: { label: 'High', className: 'text-amber-600' },
  urgent: { label: 'Urgent', className: 'text-coral-600' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

interface EscalationBadgeProps {
  level: EscalationLevel;
}

const escalationConfig: Record<EscalationLevel, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-sage-100 text-sage-700 border-sage-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'High', className: 'bg-coral-50 text-coral-700 border-coral-200' },
  critical: { label: 'Critical', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function EscalationBadge({ level }: EscalationBadgeProps) {
  const config = escalationConfig[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full border px-2.5 py-1 ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${level === 'high' || level === 'critical' ? 'bg-coral-500 animate-pulse-soft' : 'bg-amber-500'}`} />
      {config.label}
    </span>
  );
}
