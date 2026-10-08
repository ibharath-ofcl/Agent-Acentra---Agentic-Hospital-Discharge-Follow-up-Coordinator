import type { TaskStatus, TaskPriority, EscalationLevel, CareCoordinationPriorityLevel } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<TaskStatus, { label: string; className: string; dotColor: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-800 border-amber-200', dotColor: 'bg-amber-500' },
  'in-progress': { label: 'In Progress', className: 'bg-sky-50 text-sky-800 border-sky-200', dotColor: 'bg-sky-500' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-800 border-emerald-200', dotColor: 'bg-emerald-500' },
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-800 border-red-200', dotColor: 'bg-red-500' },
  'needs-review': { label: 'Needs Review', className: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold', dotColor: 'bg-amber-500' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClass} ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${status === 'needs-review' ? 'animate-pulse-soft' : ''}`} />
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-slate-500 bg-slate-100 border-slate-200' },
  medium: { label: 'Medium', className: 'text-teal-700 bg-teal-50 border-teal-200' },
  high: { label: 'High', className: 'text-amber-800 bg-amber-50 border-amber-200' },
  urgent: { label: 'Urgent', className: 'text-red-700 bg-red-50 border-red-200' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${config.className}`}>
      {config.label}
    </span>
  );
}

interface EscalationBadgeProps {
  level: EscalationLevel;
}

const escalationConfig: Record<EscalationLevel, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-800 border-orange-200' },
  critical: { label: 'Critical', className: 'bg-red-50 text-red-800 border-red-200' },
};

export function EscalationBadge({ level }: EscalationBadgeProps) {
  const config = escalationConfig[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded border px-2.5 py-0.5 ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${level === 'high' || level === 'critical' ? 'bg-red-500 animate-pulse-soft' : 'bg-amber-500'}`} />
      {config.label}
    </span>
  );
}

// ── Care Coordination Priority Badge (Prominent Feature) ────
interface CareCoordinationPriorityBadgeProps {
  level: CareCoordinationPriorityLevel;
  size?: 'sm' | 'md';
}

const priorityLevelConfig: Record<CareCoordinationPriorityLevel, { label: string; emoji: string; className: string }> = {
  'immediate-review': {
    label: 'Immediate Review',
    emoji: '🔴',
    className: 'bg-red-50 text-red-900 border-red-200 font-bold',
  },
  'high-priority': {
    label: 'High Follow-up Priority',
    emoji: '🟠',
    className: 'bg-amber-50 text-amber-900 border-amber-200 font-bold',
  },
  routine: {
    label: 'Routine',
    emoji: '🟢',
    className: 'bg-emerald-50 text-emerald-900 border-emerald-200 font-medium',
  },
};

export function CareCoordinationPriorityBadge({ level, size = 'md' }: CareCoordinationPriorityBadgeProps) {
  const config = priorityLevelConfig[level];
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClass} ${config.className}`}>
      <span className="text-[10px] leading-none">{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
