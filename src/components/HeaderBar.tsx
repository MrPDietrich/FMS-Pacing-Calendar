import type { User } from 'firebase/auth';
import { ChevronDown, LayoutGrid, LogOut, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  CALENDAR_CATEGORIES,
  type CalendarDoc,
  type ViewTab,
} from '../types/pacing';

interface HeaderBarProps {
  user: User;
  calendars: CalendarDoc[];
  selectedCalendarId: string | null;
  onSelectCalendar: (id: string | null, targetTab?: ViewTab) => void;
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onSignOut: () => void;
}

export function HeaderBar({
  user,
  calendars,
  selectedCalendarId,
  onSelectCalendar,
  activeTab,
  onSelectTab,
  onSignOut,
}: HeaderBarProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCalendar = selectedCalendarId
    ? calendars.find((c) => c.id === selectedCalendarId)
    : undefined;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCalendars = calendars.filter((c) => {
    if (!courseSearch.trim()) return true;
    const q = courseSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  const courseTabs: { id: ViewTab; label: string }[] = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'triage', label: 'Standards Triage' },
    { id: 'coverage', label: 'Coverage Summary' },
  ];

  return (
    <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand Title + Course Switcher */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="text-left text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            2026–2027 Pacing Calendar
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setSwitcherOpen((prev) => !prev)}
              aria-expanded={switcherOpen}
              aria-haspopup="listbox"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-900 bg-slate-100 hover:bg-slate-200/75 border border-slate-200 rounded-lg transition-colors cursor-pointer max-w-[240px] sm:max-w-[300px]"
            >
              <span className="truncate">
                {selectedCalendar ? selectedCalendar.name : 'Select a Course...'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            {switcherOpen && (
              <div className="absolute left-0 mt-1.5 w-80 max-h-[72vh] flex flex-col bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 space-y-2">
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Filter courses or departments..."
                    autoFocus
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('home');
                      setSwitcherOpen(false);
                      setCourseSearch('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    All Departments Overview
                  </button>
                </div>

                <div className="overflow-y-auto p-1.5 space-y-2">
                  {CALENDAR_CATEGORIES.map((category) => {
                    const groupItems = filteredCalendars
                      .filter((c) => c.category === category)
                      .sort((a, b) => a.order - b.order);
                    if (groupItems.length === 0) return null;

                    return (
                      <div key={category}>
                        <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 tracking-wide">
                          {category}
                        </div>
                        <div className="space-y-0.5">
                          {groupItems.map((cal) => {
                            const active = cal.id === selectedCalendarId;
                            return (
                              <button
                                key={cal.id}
                                type="button"
                                onClick={() => {
                                  onSelectCalendar(
                                    cal.id,
                                    activeTab === 'home' || activeTab === 'settings'
                                      ? 'calendar'
                                      : activeTab
                                  );
                                  setSwitcherOpen(false);
                                  setCourseSearch('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 text-sm rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                  active
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate">{cal.name}</span>
                                {cal.isScience && (
                                  <span className="text-[11px] text-slate-400 shrink-0">
                                    NGSS
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {filteredCalendars.length === 0 && (
                    <p className="px-3 py-4 text-sm text-slate-500 text-center">
                      No matching courses found.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: View Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Departments
          </button>

          {courseTabs.map((tab) => {
            const active = activeTab === tab.id;
            const disabled = !selectedCalendar;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={disabled}
                title={disabled ? 'Select a course first' : tab.label}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  disabled
                    ? 'text-slate-400 cursor-not-allowed'
                    : active
                    ? 'bg-white text-slate-900 shadow-xs cursor-pointer'
                    : 'text-slate-600 hover:text-slate-900 cursor-pointer'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Settings + Staff Profile / Sign Out */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            aria-label="Settings and Add Calendar"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden lg:flex items-center gap-2 text-right">
            <span className="text-xs font-medium text-slate-700 max-w-[160px] truncate">
              {user.displayName || user.email}
            </span>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            title={`Sign out (${user.email || 'staff'})`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      {/* Tablet/Mobile secondary tab strip */}
      <div className="md:hidden border-t border-slate-100 px-4 py-1.5 flex items-center gap-1 overflow-x-auto bg-slate-50/70">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'home'
              ? 'bg-white text-slate-900 border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Departments
        </button>
        {courseTabs.map((tab) => {
          const active = activeTab === tab.id;
          const disabled = !selectedCalendar;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                disabled
                  ? 'text-slate-400 cursor-not-allowed'
                  : active
                  ? 'bg-white text-slate-900 border border-slate-200 cursor-pointer'
                  : 'text-slate-600 hover:text-slate-900 cursor-pointer'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
