import { CalendarRange, Check, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  VALIDATION_LIMITS,
  type CalendarDoc,
  type EntryDoc,
  type NgssFilter,
  type StandardDoc,
  type StandardType,
} from '../types/pacing';
import {
  formatLongDate,
  formatShortDate,
  getDatesInRange,
  matchesNgssFilter,
} from '../utils/calendarUtils';
import { DayTagBadge } from './DayTagBadge';
import { StandardCodePill } from './StandardBadge';

interface DayEditorDrawerProps {
  dateStr: string | null;
  calendar: CalendarDoc | undefined;
  entry: EntryDoc | undefined;
  standards: StandardDoc[];
  ngssFilter: NgssFilter;
  onClose: () => void;
  onSaveSingleDay: (
    date: string,
    topic: string,
    notes: string,
    dayTag: string,
    standardIds: string[]
  ) => Promise<void>;
  onApplyRange: (
    dates: string[],
    topic: string,
    notes: string,
    dayTag: string,
    standardIds: string[]
  ) => Promise<void>;
  onDeleteDay: (date: string) => Promise<void>;
}

const GROUP_META: { type: StandardType; heading: string }[] = [
  { type: 'essential', heading: 'Essential Standards' },
  { type: 'supporting', heading: 'Supporting Standards' },
  { type: 'prerequisite', heading: 'Prerequisite (Previous Grade)' },
  { type: 'unassigned', heading: 'Unassigned Standards' },
];

type DayTagMode =
  | 'none'
  | 'flex'
  | 'activity'
  | 'reteach'
  | 'review'
  | 'cfa'
  | 'pm'
  | 'bm'
  | 'ca';

function detectDayTagMode(tag: string): DayTagMode {
  const upper = tag.trim().toUpperCase();
  if (!upper) return 'none';
  if (upper === 'FLEX DAY') return 'flex';
  if (upper === 'ACTIVITY') return 'activity';
  if (upper === 'RETEACH') return 'reteach';
  if (upper === 'REVIEW') return 'review';
  if (upper === 'CFA') return 'cfa';
  if (upper === 'CA') return 'ca';
  if (upper.startsWith('PM')) return 'pm';
  if (upper.startsWith('BM')) return 'bm';
  return 'none';
}

export function DayEditorDrawer({
  dateStr,
  calendar,
  entry,
  standards,
  ngssFilter,
  onClose,
  onSaveSingleDay,
  onApplyRange,
  onDeleteDay,
}: DayEditorDrawerProps) {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [dayTag, setDayTag] = useState('');
  const [tagMode, setTagMode] = useState<DayTagMode>('none');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnassigned, setShowUnassigned] = useState(false);

  const [applyRangeOpen, setApplyRangeOpen] = useState(false);
  const [rangeEndDate, setRangeEndDate] = useState('');
  const [includeWeekendsInRange, setIncludeWeekendsInRange] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dateStr) return;
    const initialTag = entry?.dayTag ?? '';
    setTopic(entry?.topic ?? '');
    setNotes(entry?.notes ?? '');
    setDayTag(initialTag);
    setTagMode(detectDayTagMode(initialTag));
    setSelectedIds(entry?.standardIds ?? []);
    setSearchQuery('');
    setApplyRangeOpen(false);
    setRangeEndDate(dateStr);
    setConfirmDelete(false);
  }, [dateStr, entry]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape' && dateStr) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [dateStr, onClose]);

  const calendarStandards = useMemo(() => {
    if (!calendar) return [];
    return standards.filter(
      (s) =>
        s.calendarId === calendar.id &&
        matchesNgssFilter(s, calendar.isScience, ngssFilter)
    );
  }, [standards, calendar, ngssFilter]);

  const filteredStandards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return calendarStandards.filter((s) => {
      if (!showUnassigned && s.type === 'unassigned' && !selectedIds.includes(s.id)) {
        return false;
      }
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q)
      );
    });
  }, [calendarStandards, showUnassigned, selectedIds, searchQuery]);

  const rangeDates = useMemo(() => {
    if (!dateStr || !rangeEndDate) return [];
    return getDatesInRange(dateStr, rangeEndDate, includeWeekendsInRange);
  }, [dateStr, rangeEndDate, includeWeekendsInRange]);

  const existingStandardIdSet = useMemo(
    () => new Set(standards.map((s) => s.id)),
    [standards]
  );

  const activeSelectedIds = useMemo(
    () => selectedIds.filter((id) => existingStandardIdSet.has(id)),
    [selectedIds, existingStandardIdSet]
  );

  if (!dateStr || !calendar) return null;

  const handleSelectTagMode = (mode: DayTagMode) => {
    setTagMode(mode);
    switch (mode) {
      case 'none':
        setDayTag('');
        break;
      case 'flex':
        setDayTag('Flex Day');
        break;
      case 'activity':
        setDayTag('Activity');
        break;
      case 'reteach':
        setDayTag('Reteach');
        break;
      case 'review':
        setDayTag('Review');
        break;
      case 'cfa':
        setDayTag('CFA');
        break;
      case 'ca':
        setDayTag('CA');
        break;
      case 'pm':
        if (!dayTag.toUpperCase().startsWith('PM')) {
          setDayTag('PM1');
        }
        break;
      case 'bm':
        if (!dayTag.toUpperCase().startsWith('BM')) {
          setDayTag('BM1');
        }
        break;
    }
  };

  const toggleStandard = (id: string) => {
    setSelectedIds((prev) => {
      const cleaned = prev.filter((item) => existingStandardIdSet.has(item));
      if (cleaned.includes(id)) {
        return cleaned.filter((item) => item !== id);
      }
      if (cleaned.length >= VALIDATION_LIMITS.ENTRY_STANDARD_IDS_MAX) {
        return cleaned;
      }
      return [...cleaned, id];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalTag = dayTag.trim().slice(0, VALIDATION_LIMITS.ENTRY_DAY_TAG_MAX);
      if (applyRangeOpen && rangeDates.length > 1) {
        await onApplyRange(rangeDates, topic, notes, finalTag, activeSelectedIds);
      } else {
        await onSaveSingleDay(dateStr, topic, notes, finalTag, activeSelectedIds);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDeleteDay(dateStr);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const formattedUpdatedAt = entry?.updatedAt?.toDate
    ? entry.updatedAt.toDate().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  const dayTypeButtons: { mode: DayTagMode; label: string; title: string }[] = [
    { mode: 'none', label: 'Regular Day', title: 'Standard instructional day' },
    { mode: 'flex', label: 'Flex Day', title: 'Mark as Flex Day' },
    { mode: 'activity', label: 'Activity', title: 'Mark as Activity' },
    { mode: 'reteach', label: 'Reteach', title: 'Mark as Reteach' },
    { mode: 'review', label: 'Review', title: 'Mark as Review' },
    { mode: 'cfa', label: 'CFA', title: 'Common Formative Assessment (displays CFA)' },
    { mode: 'pm', label: 'PM', title: 'Progress Monitoring (PM1, PM2, PM3, etc.)' },
    { mode: 'bm', label: 'BM', title: 'Benchmark (BM1, BM2, BM3, etc.)' },
    { mode: 'ca', label: 'CA', title: 'Common Assessment (displays CA)' },
  ];

  return (
    <div className="no-print fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Edit pacing for ${formatLongDate(dateStr)}`}
        className="relative z-10 w-full max-w-xl bg-white h-full border-l border-slate-200 flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500 truncate">
              {calendar.name}
            </div>
            <div className="flex items-center gap-2.5 flex-wrap mt-0.5">
              <h2 className="text-lg font-bold text-slate-900">
                {formatLongDate(dateStr)}
              </h2>
              {dayTag && <DayTagBadge tag={dayTag} />}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close day editor"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Day Type / Assessment Indicator */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Day Type / Assessment Indicator
              </span>
              <span className="text-[11px] text-slate-400">
                CFA = Common Formative Assessment · CA = Common Assessment
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {dayTypeButtons.map((btn) => {
                const active = tagMode === btn.mode;
                return (
                  <button
                    key={btn.mode}
                    type="button"
                    title={btn.title}
                    onClick={() => handleSelectTagMode(btn.mode)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {(tagMode === 'pm' || tagMode === 'bm') && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-700">
                    {tagMode === 'pm'
                      ? 'Select or type Progress Monitoring label:'
                      : 'Select or type Benchmark label:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {['1', '2', '3', '4'].map((num) => {
                      const preset = `${tagMode.toUpperCase()}${num}`;
                      const isPresetActive = dayTag.trim().toUpperCase() === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDayTag(preset)}
                          className={`px-2 py-1 text-xs font-mono font-semibold rounded border cursor-pointer ${
                            isPresetActive
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input
                  type="text"
                  maxLength={VALIDATION_LIMITS.ENTRY_DAY_TAG_MAX}
                  value={dayTag}
                  onChange={(e) => setDayTag(e.target.value)}
                  placeholder={
                    tagMode === 'pm'
                      ? 'e.g., PM1, PM2, PM3, or PM Fall'
                      : 'e.g., BM1, BM2, BM3, or BM Mid'
                  }
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
              </div>
            )}
          </div>

          {/* Topic & Notes */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="day-topic"
                  className="text-xs font-semibold text-slate-700"
                >
                  Lesson / Pacing Topic
                </label>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {topic.length}/{VALIDATION_LIMITS.ENTRY_TOPIC_MAX}
                </span>
              </div>
              <input
                id="day-topic"
                type="text"
                maxLength={VALIDATION_LIMITS.ENTRY_TOPIC_MAX}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Unit 3.2: Solving Multi-Step Ratio Problems"
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="day-notes"
                  className="text-xs font-semibold text-slate-700"
                >
                  Notes & Resource Links (Optional)
                </label>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {notes.length}/{VALIDATION_LIMITS.ENTRY_NOTES_MAX}
                </span>
              </div>
              <textarea
                id="day-notes"
                rows={3}
                maxLength={VALIDATION_LIMITS.ENTRY_NOTES_MAX}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Lesson activities, formative check, or slide deck link..."
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 resize-y"
              />
            </div>
          </div>

          {/* Multi-Day Range Copy */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CalendarRange className="w-4 h-4 text-slate-500" />
                <span>Apply across multiple days</span>
              </div>
              <button
                type="button"
                onClick={() => setApplyRangeOpen((prev) => !prev)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                {applyRangeOpen ? 'Single day only' : 'Set date range'}
              </button>
            </div>

            {applyRangeOpen && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateStr}
                      disabled
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="range-end-date"
                      className="block text-[11px] font-medium text-slate-500 mb-1"
                    >
                      Through Date
                    </label>
                    <input
                      id="range-end-date"
                      type="date"
                      min={dateStr}
                      max="2027-06-30"
                      value={rangeEndDate}
                      onChange={(e) => setRangeEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeWeekendsInRange}
                      onChange={(e) => setIncludeWeekendsInRange(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Include weekends
                  </label>
                  <span className="text-xs font-medium text-slate-700 tabular-nums">
                    {rangeDates.length} {rangeDates.length === 1 ? 'day' : 'days'} selected (
                    {formatShortDate(dateStr)}
                    {rangeDates.length > 1
                      ? ` – ${formatShortDate(rangeDates[rangeDates.length - 1])}`
                      : ''}
                    )
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Standards Multi-Select */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-slate-800">
                Tagged Standards ({activeSelectedIds.length}/{VALIDATION_LIMITS.ENTRY_STANDARD_IDS_MAX})
              </h3>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnassigned}
                  onChange={(e) => setShowUnassigned(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Show unassigned
              </label>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search standard code, domain, or keyword..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div className="space-y-4">
              {GROUP_META.map((group) => {
                if (group.type === 'unassigned' && !showUnassigned) {
                  const hasSelectedUnassigned = filteredStandards.some(
                    (s) => s.type === 'unassigned' && selectedIds.includes(s.id)
                  );
                  if (!hasSelectedUnassigned) return null;
                }

                const items = filteredStandards.filter((s) => s.type === group.type);
                if (items.length === 0) return null;

                return (
                  <div key={group.type} className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500">
                      {group.heading}
                    </div>
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                      {items.map((std) => {
                        const checked = selectedIds.includes(std.id);
                        return (
                          <button
                            key={std.id}
                            type="button"
                            onClick={() => toggleStandard(std.id)}
                            className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 transition-colors cursor-pointer ${
                              checked ? 'bg-indigo-50/70' : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                checked
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'bg-white border-slate-300'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <StandardCodePill code={std.code} type={std.type} />
                                <span className="text-[11px] text-slate-500">
                                  Grade {std.gradeLevel} · {std.domain}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-700 leading-relaxed line-clamp-2">
                                {std.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredStandards.length === 0 && (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                  No matching standards found. Toggle &ldquo;Show unassigned&rdquo; or classify
                  standards in the Standards Triage tab.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 space-y-3">
          {entry && (
            <div className="text-xs text-slate-500">
              Last updated by <span className="font-medium text-slate-700">{entry.updatedBy}</span>
              {formattedUpdatedAt ? ` on ${formattedUpdatedAt}` : ''}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div>
              {entry &&
                (confirmDelete ? (
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleDelete}
                      className="px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Confirm clear
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear day
                  </button>
                ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : applyRangeOpen && rangeDates.length > 1
                  ? `Apply to ${rangeDates.length} days`
                  : 'Save entry'}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
