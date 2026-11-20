export interface DayTagTheme {
  badgeClasses: string;
  cellClasses: string;
  stripeColorClass: string;
}

export function getDayTagTheme(tag: string | undefined): DayTagTheme | null {
  const normalized = (tag || '').trim().toUpperCase();
  if (!normalized) return null;

  if (normalized === 'FLEX DAY') {
    return {
      badgeClasses: 'bg-emerald-600 text-white border border-emerald-600',
      cellClasses: 'bg-emerald-50/85 hover:bg-emerald-100/75',
      stripeColorClass: 'bg-emerald-500',
    };
  }
  if (normalized === 'ACTIVITY') {
    return {
      badgeClasses: 'bg-sky-600 text-white border border-sky-600',
      cellClasses: 'bg-sky-50/85 hover:bg-sky-100/75',
      stripeColorClass: 'bg-sky-500',
    };
  }
  if (normalized === 'RETEACH') {
    return {
      badgeClasses: 'bg-amber-600 text-white border border-amber-600',
      cellClasses: 'bg-amber-50/85 hover:bg-amber-100/75',
      stripeColorClass: 'bg-amber-500',
    };
  }
  if (normalized === 'REVIEW') {
    return {
      badgeClasses: 'bg-cyan-600 text-white border border-cyan-600',
      cellClasses: 'bg-cyan-50/85 hover:bg-cyan-100/75',
      stripeColorClass: 'bg-cyan-500',
    };
  }
  if (normalized === 'CFA') {
    return {
      badgeClasses: 'bg-violet-600 text-white border border-violet-600',
      cellClasses: 'bg-violet-50/85 hover:bg-violet-100/75',
      stripeColorClass: 'bg-violet-500',
    };
  }
  if (normalized.startsWith('PM')) {
    return {
      badgeClasses: 'bg-teal-600 text-white border border-teal-600',
      cellClasses: 'bg-teal-50/85 hover:bg-teal-100/75',
      stripeColorClass: 'bg-teal-500',
    };
  }
  if (normalized.startsWith('BM')) {
    return {
      badgeClasses: 'bg-orange-600 text-white border border-orange-600',
      cellClasses: 'bg-orange-50/85 hover:bg-orange-100/75',
      stripeColorClass: 'bg-orange-500',
    };
  }
  if (normalized === 'CA') {
    return {
      badgeClasses: 'bg-rose-600 text-white border border-rose-600',
      cellClasses: 'bg-rose-50/85 hover:bg-rose-100/75',
      stripeColorClass: 'bg-rose-500',
    };
  }

  return {
    badgeClasses: 'bg-slate-700 text-white border border-slate-700',
    cellClasses: 'bg-slate-100/80 hover:bg-slate-200/70',
    stripeColorClass: 'bg-slate-500',
  };
}

export function DayTagBadge({ tag }: { tag: string }) {
  const clean = tag.trim();
  const theme = getDayTagTheme(clean);
  if (!clean || !theme) return null;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none whitespace-nowrap ${theme.badgeClasses}`}
    >
      {clean}
    </span>
  );
}
