import type { StandardType } from '../types/pacing';

export function getStandardBadgeClasses(type: StandardType): string {
  switch (type) {
    case 'essential':
      return 'bg-indigo-600 text-white border border-indigo-600';
    case 'supporting':
      return 'bg-white text-slate-700 border border-slate-300';
    case 'prerequisite':
      return 'bg-amber-100 text-amber-900 border border-amber-300';
    case 'unassigned':
    default:
      return 'bg-slate-100 text-slate-500 border border-slate-200';
  }
}

export function getStandardTypeLabel(type: StandardType): string {
  switch (type) {
    case 'essential':
      return 'Essential';
    case 'supporting':
      return 'Supporting';
    case 'prerequisite':
      return 'Prerequisite';
    case 'unassigned':
    default:
      return 'Unassigned';
  }
}

interface StandardCodePillProps {
  code: string;
  type: StandardType;
  title?: string;
}

export function StandardCodePill({ code, type, title }: StandardCodePillProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium leading-none whitespace-nowrap ${getStandardBadgeClasses(
        type
      )}`}
    >
      {code}
    </span>
  );
}
