import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  VALIDATION_LIMITS,
  type CalendarDoc,
  type NgssFilter,
  type NgssModel,
  type StandardDoc,
  type StandardType,
  type SyncState,
} from '../types/pacing';
import { matchesNgssFilter, type ParsedStandardImportRow } from '../utils/calendarUtils';
import { BulkImportModal, type BulkImportMode } from './BulkImportModal';
import { NgssToggle } from './NgssToggle';
import { StandardCodePill } from './StandardBadge';

interface StandardsTriageViewProps {
  calendar: CalendarDoc | undefined;
  calendars: CalendarDoc[];
  standards: StandardDoc[];
  ngssFilter: NgssFilter;
  onChangeNgssFilter: (next: NgssFilter) => void;
  syncState: SyncState;
  onQuickClassify: (standardId: string, nextType: StandardType) => Promise<void>;
  onCreateStandard: (
    calendarId: string,
    data: {
      code: string;
      description: string;
      gradeLevel: string;
      domain: string;
      type: StandardType;
      ngssModel: NgssModel;
    }
  ) => Promise<void>;
  onUpdateStandard: (
    standardId: string,
    data: {
      code: string;
      description: string;
      gradeLevel: string;
      domain: string;
      type: StandardType;
      ngssModel: NgssModel;
    }
  ) => Promise<void>;
  onDeleteStandard: (standardId: string) => Promise<void>;
  onClearAllStandards: (standardIds: string[]) => Promise<void>;
  onBulkImport: (
    calendarId: string,
    rows: ParsedStandardImportRow[],
    mode: BulkImportMode
  ) => Promise<void>;
}

const TRIAGE_OPTIONS: {
  type: StandardType;
  label: string;
  shortDesc: string;
  activeClass: string;
}[] = [
  {
    type: 'essential',
    label: 'Essential',
    shortDesc: 'Core guaranteed standard',
    activeClass: 'bg-indigo-600 text-white border-indigo-600',
  },
  {
    type: 'supporting',
    label: 'Supporting',
    shortDesc: 'Reinforces essential learning',
    activeClass: 'bg-slate-700 text-white border-slate-700',
  },
  {
    type: 'prerequisite',
    label: 'Prerequisite',
    shortDesc: 'Prerequisite from previous grade',
    activeClass: 'bg-amber-600 text-white border-amber-600',
  },
  {
    type: 'unassigned',
    label: 'Unassigned',
    shortDesc: 'Hidden from default calendar picker',
    activeClass: 'bg-slate-200 text-slate-800 border-slate-300',
  },
];

export function StandardsTriageView({
  calendar,
  calendars,
  standards,
  ngssFilter,
  onChangeNgssFilter,
  syncState,
  onQuickClassify,
  onCreateStandard,
  onUpdateStandard,
  onDeleteStandard,
  onClearAllStandards,
  onBulkImport,
}: StandardsTriageViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | StandardType>('all');

  const [bulkOpen, setBulkOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingStd, setEditingStd] = useState<StandardDoc | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add/Edit form state
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formGrade, setFormGrade] = useState('6');
  const [formDomain, setFormDomain] = useState('');
  const [formType, setFormType] = useState<StandardType>('essential');
  const [formNgss, setFormNgss] = useState<NgssModel>('none');
  const [formSaving, setFormSaving] = useState(false);

  const allCalendarStandards = useMemo(() => {
    if (!calendar) return [];
    return standards.filter((s) => s.calendarId === calendar.id);
  }, [standards, calendar]);

  const courseStandards = useMemo(() => {
    if (!calendar) return [];
    return allCalendarStandards.filter((s) =>
      matchesNgssFilter(s, calendar.isScience, ngssFilter)
    );
  }, [allCalendarStandards, calendar, ngssFilter]);

  const domains = useMemo(
    () => Array.from(new Set(courseStandards.map((s) => s.domain))).sort(),
    [courseStandards]
  );

  const grades = useMemo(
    () => Array.from(new Set(courseStandards.map((s) => s.gradeLevel))).sort(),
    [courseStandards]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courseStandards.filter((s) => {
      if (domainFilter !== 'all' && s.domain !== domainFilter) return false;
      if (gradeFilter !== 'all' && s.gradeLevel !== gradeFilter) return false;
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q)
      );
    });
  }, [courseStandards, domainFilter, gradeFilter, typeFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      essential: courseStandards.filter((s) => s.type === 'essential').length,
      supporting: courseStandards.filter((s) => s.type === 'supporting').length,
      prerequisite: courseStandards.filter((s) => s.type === 'prerequisite').length,
      unassigned: courseStandards.filter((s) => s.type === 'unassigned').length,
    };
  }, [courseStandards]);

  const openAddModal = () => {
    setEditingStd(null);
    setFormCode('');
    setFormDesc('');
    setFormGrade('7');
    setFormDomain('');
    setFormType('essential');
    setFormNgss(calendar?.isScience ? 'integrated' : 'none');
    setEditorOpen(true);
  };

  const openEditModal = (std: StandardDoc) => {
    setEditingStd(std);
    setFormCode(std.code);
    setFormDesc(std.description);
    setFormGrade(std.gradeLevel);
    setFormDomain(std.domain);
    setFormType(std.type);
    setFormNgss(std.ngssModel);
    setEditorOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendar || !formCode.trim() || !formDesc.trim()) return;
    setFormSaving(true);
    try {
      const payload = {
        code: formCode,
        description: formDesc,
        gradeLevel: formGrade,
        domain: formDomain || 'General',
        type: formType,
        ngssModel: formNgss,
      };
      if (editingStd) {
        await onUpdateStandard(editingStd.id, payload);
      } else {
        await onCreateStandard(calendar.id, payload);
      }
      setEditorOpen(false);
    } finally {
      setFormSaving(false);
    }
  };

  if (!calendar) return null;

  return (
    <div className="space-y-5">
      {/* Header & Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900">
              {calendar.name} — Standards Triage
            </h1>
            {syncState === 'saving' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving
              </span>
            )}
            {syncState === 'saved' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
            <span>{counts.essential} Essential</span>
            <span aria-hidden="true">·</span>
            <span>{counts.supporting} Supporting</span>
            <span aria-hidden="true">·</span>
            <span>{counts.prerequisite} Prerequisite</span>
            <span aria-hidden="true">·</span>
            <span>{counts.unassigned} Unassigned</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {calendar.isScience && (
            <NgssToggle value={ngssFilter} onChange={onChangeNgssFilter} />
          )}

          <button
            type="button"
            disabled={allCalendarStandards.length === 0}
            onClick={() => setClearConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All Standards for This Calendar
          </button>

          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Bulk Import (JSON/CSV)
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Standard
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code or text..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
          />
        </div>

        <select
          aria-label="Filter by Domain"
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
        >
          <option value="all">All Domains ({domains.length})</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by Grade Level"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
        >
          <option value="all">All Grade Levels</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by Classification"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | StandardType)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
        >
          <option value="all">All Classifications</option>
          <option value="essential">Essential</option>
          <option value="supporting">Supporting</option>
          <option value="prerequisite">Prerequisite (Previous Grade)</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      {/* Standards Catalog List */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
        {filtered.map((std) => (
          <div
            key={std.id}
            className="p-4 sm:px-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center flex-wrap gap-2">
                <StandardCodePill code={std.code} type={std.type} />
                <span className="text-xs text-slate-500">
                  Grade {std.gradeLevel}
                  <span aria-hidden="true" className="mx-1.5">·</span>
                  {std.domain}
                  {calendar.isScience && std.ngssModel !== 'none' && (
                    <>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span className="capitalize">
                        {std.ngssModel === 'both'
                          ? 'Integrated & Discipline-Specific'
                          : std.ngssModel}
                      </span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed">
                {std.description}
              </p>
              <div className="text-[11px] text-slate-400">
                Updated by {std.updatedBy}
              </div>
            </div>

            {/* 4-Way Classification Selector + Edit/Delete */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div
                role="group"
                aria-label={`Classify ${std.code}`}
                className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg"
              >
                {TRIAGE_OPTIONS.map((opt) => {
                  const active = std.type === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      title={opt.shortDesc}
                      onClick={() => {
                        if (!active) void onQuickClassify(std.id, opt.type);
                      }}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? opt.activeClass
                          : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(std)}
                  aria-label={`Edit ${std.code}`}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {confirmDeleteId === std.id ? (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        void onDeleteStandard(std.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(std.id)}
                    aria-label={`Delete ${std.code}`}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-slate-600">
              No standards match your current filters for {calendar.name}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDomainFilter('all');
                setGradeFilter('all');
                setTypeFilter('all');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Single Standard Modal */}
      {editorOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setEditorOpen(false)}
            aria-hidden="true"
          />
          <form
            onSubmit={handleSubmitForm}
            className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingStd ? `Edit ${editingStd.code}` : `Add Standard to ${calendar.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Standard Code
                  </label>
                  <input
                    required
                    maxLength={VALIDATION_LIMITS.STANDARD_CODE_MAX}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g., 7.NS.A.1"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grade Level
                  </label>
                  <input
                    required
                    maxLength={VALIDATION_LIMITS.STANDARD_GRADE_MAX}
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    placeholder="e.g., 6, 7, 8"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Domain / Strand
                  </label>
                  <input
                    required
                    maxLength={VALIDATION_LIMITS.STANDARD_DOMAIN_MAX}
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    placeholder="e.g., The Number System"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classification
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as StandardType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  >
                    <option value="essential">Essential</option>
                    <option value="supporting">Supporting</option>
                    <option value="prerequisite">Prerequisite (Previous Grade)</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>
              </div>

              {calendar.isScience && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CA NGSS Course Model
                  </label>
                  <select
                    value={formNgss}
                    onChange={(e) => setFormNgss(e.target.value as NgssModel)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  >
                    <option value="integrated">Preferred Integrated</option>
                    <option value="discipline-specific">Discipline-Specific</option>
                    <option value="both">Both Models</option>
                    <option value="none">General / Non-NGSS</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Standard Description
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={VALIDATION_LIMITS.STANDARD_DESC_MAX}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Full standard text..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                {formSaving ? 'Saving...' : editingStd ? 'Save changes' : 'Add standard'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clear All Standards Confirmation Dialog */}
      {clearConfirmOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => !clearingAll && setClearConfirmOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Clear All Standards Confirmation"
            className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-50 text-red-700 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Clear all standards for {calendar.name}?
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                    This will permanently delete all{' '}
                    <span className="font-semibold tabular-nums">
                      {allCalendarStandards.length}
                    </span>{' '}
                    standards currently loaded in{' '}
                    <span className="font-semibold">{calendar.name}</span>. Existing
                    lesson topics and notes on the calendar will remain intact.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={clearingAll}
                onClick={() => setClearConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearingAll}
                onClick={async () => {
                  setClearingAll(true);
                  try {
                    await onClearAllStandards(allCalendarStandards.map((s) => s.id));
                    setClearConfirmOpen(false);
                  } finally {
                    setClearingAll(false);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                {clearingAll ? 'Clearing...' : 'Yes, Clear All Standards'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={bulkOpen}
        calendars={calendars}
        standards={standards}
        defaultCalendarId={calendar.id}
        onClose={() => setBulkOpen(false)}
        onImport={onBulkImport}
      />
    </div>
  );
}
