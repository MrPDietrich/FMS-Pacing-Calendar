import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Printer,
} from 'lucide-react';
import {
  type CalendarDoc,
  type EntryDoc,
  type NgssFilter,
  type StandardDoc,
  type SyncState,
} from '../types/pacing';
import {
  buildMonthGrid,
  getTodayIso,
  matchesNgssFilter,
  SCHOOL_YEAR_MONTHS,
} from '../utils/calendarUtils';
import { DayTagBadge, getDayTagTheme } from './DayTagBadge';
import { NgssToggle } from './NgssToggle';
import { StandardCodePill } from './StandardBadge';

interface CalendarViewProps {
  calendar: CalendarDoc | undefined;
  entries: EntryDoc[];
  standards: StandardDoc[];
  monthKey: string;
  onChangeMonth: (monthKey: string) => void;
  showWeekends: boolean;
  onToggleWeekends: () => void;
  ngssFilter: NgssFilter;
  onChangeNgssFilter: (next: NgssFilter) => void;
  syncState: SyncState;
  onSelectDate: (dateStr: string) => void;
}

export function CalendarView({
  calendar,
  entries,
  standards,
  monthKey,
  onChangeMonth,
  showWeekends,
  onToggleWeekends,
  ngssFilter,
  onChangeNgssFilter,
  syncState,
  onSelectDate,
}: CalendarViewProps) {
  const monthIdx = SCHOOL_YEAR_MONTHS.findIndex((m) => m.key === monthKey);
  const currentMonth = SCHOOL_YEAR_MONTHS[monthIdx >= 0 ? monthIdx : 0];
  const todayIso = getTodayIso();

  const weeks = buildMonthGrid(currentMonth.year, currentMonth.monthIndex, showWeekends);
  const dayHeaders = showWeekends
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const entryMap = new Map<string, EntryDoc>();
  for (const e of entries) {
    if (calendar && e.calendarId === calendar.id) {
      entryMap.set(e.date, e);
    }
  }

  const standardMap = new Map<string, StandardDoc>();
  for (const s of standards) {
    if (calendar && s.calendarId === calendar.id) {
      standardMap.set(s.id, s);
    }
  }

  const canPrev = monthIdx > 0;
  const canNext = monthIdx < SCHOOL_YEAR_MONTHS.length - 1;

  return (
    <div className="space-y-4">
      {/* Print-Only PLC Header */}
      <div className="hidden print-only mb-3 border-b border-slate-300 pb-2">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {calendar?.name || 'Course'} — {currentMonth.label}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              2026–2027 Middle School Pacing Calendar · {calendar?.category}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-700">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" /> Essential
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs border border-slate-400 bg-white inline-block" /> Supporting
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-200 border border-amber-400 inline-block" /> Prerequisite
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
        {/* Left: Month Selector */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => canPrev && onChangeMonth(SCHOOL_YEAR_MONTHS[monthIdx - 1].key)}
            aria-label="Previous month"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            aria-label="Select school year month"
            value={currentMonth.key}
            onChange={(e) => onChangeMonth(e.target.value)}
            className="px-3 py-1.5 text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            {SCHOOL_YEAR_MONTHS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!canNext}
            onClick={() => canNext && onChangeMonth(SCHOOL_YEAR_MONTHS[monthIdx + 1].key)}
            aria-label="Next month"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {calendar?.isScience && (
            <div className="ml-2">
              <NgssToggle value={ngssFilter} onChange={onChangeNgssFilter} />
            </div>
          )}
        </div>

        {/* Right: Legend, Sync, Weekends, Print */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Compact Standard Badge Key */}
          <div className="hidden xl:flex items-center gap-2.5 text-xs text-slate-600 pr-2 border-r border-slate-200">
            <span className="inline-flex items-center gap-1.5">
              <StandardCodePill code="ESS" type="essential" />
              <span>Essential</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StandardCodePill code="SUP" type="supporting" />
              <span>Supporting</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StandardCodePill code="PRE" type="prerequisite" />
              <span>Prerequisite</span>
            </span>
          </div>

          {/* Sync Status */}
          <div className="w-20 flex justify-end">
            {syncState === 'saving' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving
              </span>
            )}
            {syncState === 'saved' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={showWeekends}
              onChange={onToggleWeekends}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Show weekends
          </label>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Export Month
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden print-calendar-grid">
        {/* Weekday Header Row */}
        <div
          className={`grid border-b border-slate-200 bg-slate-50 ${
            showWeekends ? 'grid-cols-7' : 'grid-cols-5'
          }`}
        >
          {dayHeaders.map((day) => (
            <div
              key={day}
              className="px-3 py-2 text-xs font-semibold text-slate-600 border-r last:border-r-0 border-slate-200"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="divide-y divide-slate-200">
          {weeks.map((week, wIdx) => (
            <div
              key={wIdx}
              className={`grid ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'} divide-x divide-slate-200`}
            >
              {week.map((cell) => {
                const entry = entryMap.get(cell.dateStr);
                const isToday = cell.dateStr === todayIso;
                const dayTheme = getDayTagTheme(entry?.dayTag);
                const taggedStandards = (entry?.standardIds || [])
                  .map((id) => standardMap.get(id))
                  .filter((s): s is StandardDoc =>
                    Boolean(
                      s &&
                        matchesNgssFilter(
                          s,
                          Boolean(calendar?.isScience),
                          ngssFilter
                        )
                    )
                  );

                const cellSurfaceClasses = dayTheme
                  ? dayTheme.cellClasses
                  : cell.isCurrentMonth
                  ? cell.isWeekend
                    ? 'bg-slate-50/60 hover:bg-slate-100/70'
                    : 'bg-white hover:bg-slate-50/90'
                  : 'bg-slate-50/90 text-slate-400 hover:bg-slate-100/70';

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => onSelectDate(cell.dateStr)}
                    className={`print-day-cell relative group text-left min-h-[132px] p-2.5 flex flex-col justify-between transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-indigo-600 ${cellSurfaceClasses} ${
                      !cell.isCurrentMonth ? 'opacity-80' : ''
                    }`}
                  >
                    {dayTheme && (
                      <span
                        aria-hidden="true"
                        className={`absolute top-0 left-0 right-0 h-1 ${dayTheme.stripeColorClass}`}
                      />
                    )}

                    <div className="w-full space-y-1.5">
                      {/* Date Number Row */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`inline-flex items-center justify-center text-xs font-semibold tabular-nums ${
                            isToday
                              ? 'w-6 h-6 rounded-full bg-indigo-600 text-white'
                              : cell.isCurrentMonth
                              ? 'text-slate-900'
                              : 'text-slate-500'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        <div className="flex items-center gap-1">
                          {entry?.dayTag && <DayTagBadge tag={entry.dayTag} />}
                          {entry?.notes && (
                            <span title="Has lesson notes" className="text-slate-500">
                              <FileText className="w-3 h-3" />
                            </span>
                          )}
                          <span className="no-print opacity-0 group-hover:opacity-100 text-slate-500 transition-opacity">
                            <Plus className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Lesson Topic */}
                      {entry?.topic && (
                        <p className="text-xs font-medium text-slate-900 leading-snug line-clamp-2">
                          {entry.topic}
                        </p>
                      )}

                      {/* Standard Code Pills */}
                      {taggedStandards.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {taggedStandards.map((std) => (
                            <StandardCodePill
                              key={std.id}
                              code={std.code}
                              type={std.type}
                              title={`${std.code}: ${std.description}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Subtle Attribution Hint */}
                    {entry?.updatedBy && (
                      <div
                        className={`mt-2 pt-1 text-[10px] truncate w-full ${
                          dayTheme ? 'text-slate-600' : 'text-slate-400'
                        }`}
                      >
                        {entry.updatedBy.split('(')[0].trim()}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
