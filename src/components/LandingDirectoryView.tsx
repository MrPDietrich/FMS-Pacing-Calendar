import { ChevronRight, Search, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CALENDAR_CATEGORIES,
  type CalendarCategory,
  type CalendarDoc,
  type EntryDoc,
  type StandardDoc,
  type ViewTab,
} from '../types/pacing';

interface LandingDirectoryViewProps {
  calendars: CalendarDoc[];
  standards: StandardDoc[];
  entries: EntryDoc[];
  onSelectCourse: (calendarId: string, targetTab?: ViewTab) => void;
  onOpenSettings: () => void;
}

interface DepartmentTheme {
  cardBorder: string;
  headerBg: string;
  headerTitle: string;
  headerCount: string;
  rowHover: string;
  titleHover: string;
  chevronHover: string;
  linkHover: string;
}

const DEPARTMENT_THEMES: Record<CalendarCategory, DepartmentTheme> = {
  '6th Grade Core': {
    cardBorder: 'border-indigo-200 border-t-[3px] border-t-indigo-600',
    headerBg: 'bg-indigo-50/85 border-b border-indigo-200/80',
    headerTitle: 'text-indigo-950',
    headerCount: 'text-indigo-700',
    rowHover: 'hover:bg-indigo-50/45',
    titleHover: 'group-hover:text-indigo-700',
    chevronHover: 'group-hover:text-indigo-600',
    linkHover: 'hover:text-indigo-700',
  },
  '7th Grade Core': {
    cardBorder: 'border-emerald-200 border-t-[3px] border-t-emerald-600',
    headerBg: 'bg-emerald-50/85 border-b border-emerald-200/80',
    headerTitle: 'text-emerald-950',
    headerCount: 'text-emerald-700',
    rowHover: 'hover:bg-emerald-50/45',
    titleHover: 'group-hover:text-emerald-700',
    chevronHover: 'group-hover:text-emerald-600',
    linkHover: 'hover:text-emerald-700',
  },
  '8th Grade Core': {
    cardBorder: 'border-sky-200 border-t-[3px] border-t-sky-600',
    headerBg: 'bg-sky-50/85 border-b border-sky-200/80',
    headerTitle: 'text-sky-950',
    headerCount: 'text-sky-700',
    rowHover: 'hover:bg-sky-50/45',
    titleHover: 'group-hover:text-sky-700',
    chevronHover: 'group-hover:text-sky-600',
    linkHover: 'hover:text-sky-700',
  },
  VAPA: {
    cardBorder: 'border-violet-200 border-t-[3px] border-t-violet-600',
    headerBg: 'bg-violet-50/85 border-b border-violet-200/80',
    headerTitle: 'text-violet-950',
    headerCount: 'text-violet-700',
    rowHover: 'hover:bg-violet-50/45',
    titleHover: 'group-hover:text-violet-700',
    chevronHover: 'group-hover:text-violet-600',
    linkHover: 'hover:text-violet-700',
  },
  PE: {
    cardBorder: 'border-amber-200 border-t-[3px] border-t-amber-500',
    headerBg: 'bg-amber-50/85 border-b border-amber-200/80',
    headerTitle: 'text-amber-950',
    headerCount: 'text-amber-800',
    rowHover: 'hover:bg-amber-50/45',
    titleHover: 'group-hover:text-amber-800',
    chevronHover: 'group-hover:text-amber-700',
    linkHover: 'hover:text-amber-800',
  },
  SDC: {
    cardBorder: 'border-teal-200 border-t-[3px] border-t-teal-600',
    headerBg: 'bg-teal-50/85 border-b border-teal-200/80',
    headerTitle: 'text-teal-950',
    headerCount: 'text-teal-700',
    rowHover: 'hover:bg-teal-50/45',
    titleHover: 'group-hover:text-teal-700',
    chevronHover: 'group-hover:text-teal-600',
    linkHover: 'hover:text-teal-700',
  },
};

export function LandingDirectoryView({
  calendars,
  standards,
  entries,
  onSelectCourse,
  onOpenSettings,
}: LandingDirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const statsByCalendar = useMemo(() => {
    const stdCount = new Map<string, number>();
    const essentialCount = new Map<string, number>();
    const entryCount = new Map<string, number>();

    for (const s of standards) {
      stdCount.set(s.calendarId, (stdCount.get(s.calendarId) || 0) + 1);
      if (s.type === 'essential') {
        essentialCount.set(s.calendarId, (essentialCount.get(s.calendarId) || 0) + 1);
      }
    }

    for (const e of entries) {
      if (e.topic || e.dayTag || e.standardIds.length > 0) {
        entryCount.set(e.calendarId, (entryCount.get(e.calendarId) || 0) + 1);
      }
    }

    return { stdCount, essentialCount, entryCount };
  }, [standards, entries]);

  const filteredCalendars = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return calendars;
    return calendars.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [calendars, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Directory Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            2026–2027 Department Pacing Calendars
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
            <span>{calendars.length} Active Courses</span>
            <span aria-hidden="true">·</span>
            <span>{CALENDAR_CATEGORIES.length} Departments</span>
            <span aria-hidden="true">·</span>
            <span>Select a course to open its monthly pacing calendar</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter courses or departments..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            Manage Calendars
          </button>
        </div>
      </div>

      {/* Department Columns / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
        {CALENDAR_CATEGORIES.map((category) => {
          const items = filteredCalendars
            .filter((c) => c.category === category)
            .sort((a, b) => a.order - b.order);

          if (items.length === 0) return null;

          const theme = DEPARTMENT_THEMES[category];

          return (
            <section
              key={category}
              className={`bg-white border rounded-xl overflow-hidden ${theme.cardBorder}`}
            >
              <div
                className={`px-5 py-3.5 flex items-center justify-between gap-2 ${theme.headerBg}`}
              >
                <h2 className={`text-sm font-bold ${theme.headerTitle}`}>
                  {category}
                </h2>
                <span
                  className={`text-xs font-semibold tabular-nums ${theme.headerCount}`}
                >
                  {items.length} {items.length === 1 ? 'course' : 'courses'}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((cal) => {
                  const essentials = statsByCalendar.essentialCount.get(cal.id) || 0;
                  const totalStds = statsByCalendar.stdCount.get(cal.id) || 0;
                  const pacedDays = statsByCalendar.entryCount.get(cal.id) || 0;

                  return (
                    <div
                      key={cal.id}
                      className={`group transition-colors ${theme.rowHover}`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectCourse(cal.id, 'calendar')}
                        className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-indigo-600"
                      >
                        <div className="min-w-0 space-y-1">
                          <div
                            className={`text-sm font-semibold text-slate-900 transition-colors truncate ${theme.titleHover}`}
                          >
                            {cal.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 tabular-nums">
                            <span>{essentials} essential</span>
                            <span aria-hidden="true">·</span>
                            <span>{totalStds} standards</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {pacedDays} {pacedDays === 1 ? 'day' : 'days'} paced
                            </span>
                            {cal.isScience && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>CA NGSS</span>
                              </>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5 ${theme.chevronHover}`}
                        />
                      </button>

                      {/* Quick Sub-view Links */}
                      <div className="px-5 pb-2.5 flex items-center gap-3 text-[11px] font-medium text-slate-500">
                        <button
                          type="button"
                          onClick={() => onSelectCourse(cal.id, 'calendar')}
                          className={`cursor-pointer ${theme.linkHover}`}
                        >
                          Open Calendar
                        </button>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectCourse(cal.id, 'triage')}
                          className={`cursor-pointer ${theme.linkHover}`}
                        >
                          Standards Triage
                        </button>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectCourse(cal.id, 'coverage')}
                          className={`cursor-pointer ${theme.linkHover}`}
                        >
                          Coverage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {filteredCalendars.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
          <p className="text-sm text-slate-600">
            No courses match &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
