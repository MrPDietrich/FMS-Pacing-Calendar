import type { NgssFilter } from '../types/pacing';

interface NgssToggleProps {
  value: NgssFilter;
  onChange: (next: NgssFilter) => void;
}

export function NgssToggle({ value, onChange }: NgssToggleProps) {
  const options: { id: NgssFilter; label: string }[] = [
    { id: 'integrated', label: 'Preferred Integrated' },
    { id: 'discipline-specific', label: 'Discipline-Specific' },
    { id: 'all', label: 'All NGSS' },
  ];

  return (
    <div
      role="group"
      aria-label="CA NGSS Course Model Filter"
      className="inline-flex items-center gap-0.5 p-1 bg-slate-100 border border-slate-200 rounded-lg"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              active
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
