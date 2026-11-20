import { AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import type {
  CalendarDoc,
  EntryDoc,
  NgssFilter,
  StandardDoc,
  StandardType,
} from '../types/pacing';
import { formatShortDate, matchesNgssFilter } from '../utils/calendarUtils';
import { NgssToggle } from './NgssToggle';
import { StandardCodePill } from './StandardBadge';

interface CoverageSummaryViewProps {
  calendar: CalendarDoc | undefined;
  standards: StandardDoc[];
  entries: EntryDoc[];
  ngssFilter: NgssFilter;
  onChangeNgssFilter: (next: NgssFilter) => void;
  onJumpToDate: (dateStr: string) => void;
}

const SECTIONS: { type: Exclude<StandardType, 'unassigned'>; title: string; subtitle: string }[] = [
  {
    type: 'essential',
    title: 'Essential Standards',
    subtitle: 'Guaranteed core standards — zero-day pacing gaps are highlighted for PLC review.',
  },
  {
    type: 'supporting',
    title: 'Supporting Standards',
    subtitle: 'Standards that reinforce and connect to essential units.',
  },
  {
    type: 'prerequisite',
    title: 'Prerequisite (Previous Grade) Standards',
    subtitle: 'Prior-grade foundational standards targeted for scaffolding or intervention.',
  },
];

export function CoverageSummaryView({
  calendar,
  standards,
  entries,
  ngssFilter,
  onChangeNgssFilter,
  onJumpToDate,
}: CoverageSummaryViewProps) {
  const courseStandards = useMemo(() => {
    if (!calendar) return [];
    return standards.filter(
      (s) =>
        s.calendarId === calendar.id &&
        s.type !== 'unassigned' &&
        matchesNgssFilter(s, calendar.isScience, ngssFilter)
    );
  }, [standards, calendar, ngssFilter]);

  const taggedDatesByStandard = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!calendar) return map;
    const courseEntries = entries.filter((e) => e.calendarId === calendar.id);
    for (const entry of courseEntries) {
      for (const stdId of entry.standardIds) {
        const list = map.get(stdId) || [];
        list.push(entry.date);
        map.set(stdId, list);
      }
    }
    for (const [key, list] of map.entries()) {
      list.sort();
      map.set(key, list);
    }
    return map;
  }, [entries, calendar]);

  if (!calendar) return null;

  const essentialStandards = courseStandards.filter((s) => s.type === 'essential');
  const essentialCoveredCount = essentialStandards.filter(
    (s) => (taggedDatesByStandard.get(s.id)?.length || 0) > 0
  ).length;
  const essentialGapCount = essentialStandards.length - essentialCoveredCount;
  const essentialPct =
    essentialStandards.length > 0
      ? Math.round((essentialCoveredCount / essentialStandards.length) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* Header & Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {calendar.name} — 2026–2027 Coverage Summary
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks total instructional days tagged across August 2026 – June 2027.
            </p>
          </div>
          {calendar.isScience && (
            <NgssToggle value={ngssFilter} onChange={onChangeNgssFilter} />
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <div className="text-xs font-medium text-slate-500">Essential Coverage</div>
            <div className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {essentialPct}%
            </div>
            <div className="text-xs text-slate-500 tabular-nums">
              {essentialCoveredCount} of {essentialStandards.length} tagged
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500">Essential Pacing Gaps</div>
            <div
              className={`mt-1 text-2xl font-bold tabular-nums ${
                essentialGapCount > 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {essentialGapCount}
            </div>
            <div className="text-xs text-slate-500">
              {essentialGapCount > 0
                ? 'Essential standards with 0 days'
                : 'All essentials scheduled'}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500">Supporting Standards</div>
            <div className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {courseStandards.filter((s) => s.type === 'supporting').length}
            </div>
            <div className="text-xs text-slate-500 tabular-nums">
              {
                courseStandards.filter(
                  (s) =>
                    s.type === 'supporting' &&
                    (taggedDatesByStandard.get(s.id)?.length || 0) > 0
                ).length
              }{' '}
              scheduled
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500">Prerequisite Standards</div>
            <div className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {courseStandards.filter((s) => s.type === 'prerequisite').length}
            </div>
            <div className="text-xs text-slate-500 tabular-nums">
              {
                courseStandards.filter(
                  (s) =>
                    s.type === 'prerequisite' &&
                    (taggedDatesByStandard.get(s.id)?.length || 0) > 0
                ).length
              }{' '}
              scheduled
            </div>
          </div>
        </div>
      </div>

      {/* Classification Sections */}
      {SECTIONS.map((sec) => {
        const items = courseStandards.filter((s) => s.type === sec.type);
        return (
          <div
            key={sec.type}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{sec.title}</h2>
                <p className="text-xs text-slate-500">{sec.subtitle}</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 tabular-nums">
                {items.length} {items.length === 1 ? 'standard' : 'standards'}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-xs text-slate-500 text-center">
                No standards classified as {sec.title.toLowerCase()} yet. Classify them in the
                Standards Triage tab.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((std) => {
                  const dates = taggedDatesByStandard.get(std.id) || [];
                  const isEssentialGap = sec.type === 'essential' && dates.length === 0;

                  return (
                    <div
                      key={std.id}
                      className={`px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isEssentialGap ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <StandardCodePill code={std.code} type={std.type} />
                          <span className="text-xs text-slate-500">
                            Grade {std.gradeLevel} · {std.domain}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed">
                          {std.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 lg:max-w-md">
                        {isEssentialGap ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 border border-amber-300 text-xs font-semibold text-amber-900 tabular-nums whitespace-nowrap">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                            0 days · Pacing gap
                          </span>
                        ) : dates.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 tabular-nums mr-1 whitespace-nowrap">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {dates.length} {dates.length === 1 ? 'day' : 'days'}
                            </span>
                            {dates.slice(0, 6).map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => onJumpToDate(d)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded cursor-pointer"
                              >
                                <Calendar className="w-2.5 h-2.5" />
                                {formatShortDate(d)}
                              </button>
                            ))}
                            {dates.length > 6 && (
                              <span className="text-[11px] text-slate-500 tabular-nums">
                                +{dates.length - 6} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
                            0 days tagged
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
